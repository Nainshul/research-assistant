import { DiagnosisResult, Remedy } from '@/types/diagnosis';

// Mock remedies database - in production this would come from Supabase
export const remediesDatabase: Record<string, Remedy> = {
  'tomato_early_blight': {
    diseaseName: 'Early Blight',
    crop: 'Tomato',
    chemicalSolution: 'Apply Mancozeb or Chlorothalonil fungicide every 7-10 days. Spray early morning or late evening for best results.',
    organicSolution: 'Remove infected leaves immediately. Apply neem oil spray (2ml per liter water). Use copper-based organic fungicide.',
    prevention: 'Rotate crops yearly. Avoid overhead watering. Ensure good air circulation between plants.',
  },
  'tomato_late_blight': {
    diseaseName: 'Late Blight',
    crop: 'Tomato',
    chemicalSolution: 'Apply Metalaxyl + Mancozeb or Cymoxanil-based fungicides immediately upon detection.',
    organicSolution: 'Remove and burn all infected plants. Apply copper hydroxide spray. Improve drainage.',
    prevention: 'Plant resistant varieties. Avoid planting near potatoes. Remove plant debris after harvest.',
  },
  'tomato_leaf_mold': {
    diseaseName: 'Leaf Mold',
    crop: 'Tomato',
    chemicalSolution: 'Apply fungicides containing chlorothalonil or copper compounds.',
    organicSolution: 'Increase ventilation in greenhouse. Remove lower leaves. Apply baking soda spray (1 tbsp per liter water).',
    prevention: 'Maintain humidity below 85%. Space plants properly. Water at base, not on leaves.',
  },
  'potato_early_blight': {
    diseaseName: 'Early Blight',
    crop: 'Potato',
    chemicalSolution: 'Spray Mancozeb or Propineb every 10-14 days starting when plants are 6 inches tall.',
    organicSolution: 'Apply compost tea spray. Use neem oil. Remove infected leaves promptly.',
    prevention: 'Use certified disease-free seed potatoes. Practice 3-year crop rotation.',
  },
  'corn_common_rust': {
    diseaseName: 'Common Rust',
    crop: 'Corn/Maize',
    chemicalSolution: 'Apply Propiconazole or Tebuconazole fungicides when rust pustules first appear.',
    organicSolution: 'Plant resistant varieties. Remove heavily infected plants. Apply sulfur-based fungicide.',
    prevention: 'Plant early-maturing varieties. Avoid excessive nitrogen fertilization.',
  },
  'rice_blast': {
    diseaseName: 'Rice Blast',
    crop: 'Rice',
    chemicalSolution: 'Apply Tricyclazole or Isoprothiolane as preventive spray. Repeat every 15 days.',
    organicSolution: 'Use silicon-rich fertilizers. Apply Pseudomonas fluorescens bio-agent.',
    prevention: 'Use resistant varieties. Avoid excessive nitrogen. Maintain proper water levels.',
  },
  'healthy': {
    diseaseName: 'Healthy Plant',
    crop: 'Various',
    chemicalSolution: 'No treatment needed! Your plant appears healthy.',
    organicSolution: 'Continue regular care. Maintain good watering and nutrition practices.',
    prevention: 'Keep monitoring regularly. Practice crop rotation. Maintain soil health.',
  },
};

// Mock function to simulate AI diagnosis - in production this uses TensorFlow.js
export const mockDiagnosis = (imageUrl: string): DiagnosisResult => {
  const diseases = Object.keys(remediesDatabase);
  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
  const remedy = remediesDatabase[randomDisease];
  
  return {
    id: crypto.randomUUID(),
    diseaseName: remedy.diseaseName,
    crop: remedy.crop,
    confidence: 0.65 + Math.random() * 0.30, // 65-95% confidence
    imageUrl,
    timestamp: new Date(),
    remedy,
  };
};
