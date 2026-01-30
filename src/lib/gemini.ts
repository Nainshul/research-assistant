import { GoogleGenerativeAI } from "@google/generative-ai";
import { DiagnosisResult } from '@/types/diagnosis';

export const analyzeWithGemini = async (
  imageBase64: string,
  apiKey: string,
  language: string = 'en',
  weatherContext?: string
): Promise<DiagnosisResult> => {
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the specific version available to this key
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Clean base64 string if it has the prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    let languageInstruction = "Language: English";
    let styleInstruction = "Language: English. Standard professional tone.";

    switch (language) {
      case 'hi':
        languageInstruction = "Language: Hindi (Devanagari script)";
        styleInstruction = "Language: Hindi (Devanagari). Use precise agricultural terms in Hindi.";
        break;
      case 'hinglish':
        languageInstruction = "Language: Hinglish (Hindi + English mix)";
        styleInstruction = "Language: Hinglish. Example: 'Iske liye aap Neem Oil ka use karein.' Casual, helpful tone.";
        break;
      case 'ta':
        languageInstruction = "Language: Tamil";
        styleInstruction = "Language: Tamil. Use Tamil script.";
        break;
      case 'te':
        languageInstruction = "Language: Telugu";
        styleInstruction = "Language: Telugu. Use Telugu script.";
        break;
      case 'kn':
        languageInstruction = "Language: Kannada";
        styleInstruction = "Language: Kannada. Use Kannada script.";
        break;
      case 'mr':
        languageInstruction = "Language: Marathi";
        styleInstruction = "Language: Marathi. Use Marathi script.";
        break;
      default:
        languageInstruction = "Language: English";
        styleInstruction = "Language: English. Professional and clear.";
    }

    const weatherPrompt = weatherContext ? `
    ENVIRONMENTAL CONTEXT:
    ${weatherContext}
    Consider this weather data when recommending treatments (e.g., if raining, avoid certain sprays; if humid, warn about fungi).
    ` : '';

    const prompt = `
    You are an expert agronomist. Analyze this image of a plant.
    ${weatherPrompt}
    
    1. Identify the specific Plant/Crop name.
    2. Detect if it has any disease or pests.
    3. If HEALTHY: output "Healthy".
    4. If DISEASED: Identify the specific disease name.
    5. Provide detailed remedies (Chemical and Organic) and Prevention steps.
    6. Return the confidence level (0.0 to 1.0).
    7. If NO PLANT is detected or image is unclear, set "isPlant" to false.

    Return ONLY valid JSON in this exact format:
    {
      "isPlant": boolean,
      "name": "Plant Name",
      "disease": "Disease Name" (or "Healthy"),
      "confidence": number,
      "chemical": "detailed chemical remedy in ${languageInstruction} using bullet points with emojis...",
      "organic": "detailed organic remedy in ${languageInstruction} using bullet points with emojis...",
      "prevention": "prevention tips in ${languageInstruction} using bullet points with emojis..."
    }
    
    IMPORTANT STYLE GUIDELINES:
    1. ${styleInstruction}
    2. Formatting: Use Markdown bullet points (-).
    3. Icons: Start EVERY bullet point with a relevant Emoji.
    4. Tone: Helpful and encouraging for an Indian farmer.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean markdown code blocks if present (Gemini often adds ```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedContent = JSON.parse(cleanText);

    if (!parsedContent.isPlant) {
      throw new Error('No crop found in the image. Please scan a clear image of a plant.');
    }

    return {
      id: crypto.randomUUID(),
      diseaseName: parsedContent.disease,
      crop: parsedContent.name,
      confidence: parsedContent.confidence,
      imageUrl: imageBase64,
      timestamp: new Date(),
      remedy: {
        diseaseName: parsedContent.disease,
        crop: parsedContent.name,
        chemicalSolution: parsedContent.chemical || "Consult a local expert.",
        organicSolution: parsedContent.organic || "Remove infected parts.",
        prevention: parsedContent.prevention || "Maintain good hygiene."
      }
    };

  } catch (error: any) {
    console.error('Gemini Analysis Failed - Full details:', error);

    // Log extended details if available
    if (error.response) {
      console.error('Error Response:', error.response);
      const text = await error.response.text().catch(() => 'No response body');
      console.error('Error Body:', text);
    }

    // Improve error message for 404/403
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error(`Gemini Error (404): Model not found. This might be a Region issue or API Key issue. Original Error: ${error.message}`);
    }
    throw new Error(error.message || "AI Analysis failed.");
  }
};

export const generateChatResponse = async (
  context: { disease: string; crop: string; history: { role: 'user' | 'ai'; text: string }[] },
  query: string,
  apiKey: string
): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct history for the model
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{
            text: `System Context: The user is an Indian farmer. They have scanned a ${context.crop} plant which has been diagnosed with ${context.disease}. 
          You are an expert agronomist assistant. 
          Respond to their questions specifically about this situation. 
          Keep answers short (under 50 words), practical, and encouraging. 
          Use emojis.` }]
        },
        {
          role: "model",
          parts: [{ text: `Namaste! I am your farm assistant. I see your ${context.crop} has ${context.disease}. How can I help you manage this?` }]
        },
        ...context.history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ]
    });

    const result = await chat.sendMessage(query);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting right now. Please check your internet or try again.";
  }
};
