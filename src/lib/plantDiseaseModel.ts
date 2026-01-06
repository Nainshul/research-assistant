import * as tf from '@tensorflow/tfjs';

// PlantVillage dataset class labels (38 classes)
export const PLANT_DISEASE_CLASSES = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew',
  'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites_Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy',
] as const;

export type PlantDiseaseClass = typeof PLANT_DISEASE_CLASSES[number];

// Model configuration
const MODEL_INPUT_SIZE = 224;
const MODEL_URL = '/models/plant-disease/model.json'; // Local model path

let model: tf.GraphModel | tf.LayersModel | null = null;
let isModelLoading = false;
let modelLoadError: string | null = null;

/**
 * Preprocess image for model inference
 * Resizes to 224x224 and normalizes pixel values
 */
export const preprocessImage = async (imageElement: HTMLImageElement | HTMLCanvasElement): Promise<tf.Tensor4D> => {
  return tf.tidy(() => {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);
    
    // Resize to model input size (224x224)
    tensor = tf.image.resizeBilinear(tensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    
    // Normalize pixel values to [0, 1]
    const normalized = tensor.div(255.0);
    
    // Add batch dimension: [224, 224, 3] -> [1, 224, 224, 3]
    return normalized.expandDims(0) as tf.Tensor4D;
  });
};

/**
 * Load image from data URL into an HTMLImageElement
 */
export const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Check if model is loaded and ready
 */
export const isModelReady = (): boolean => {
  return model !== null;
};

/**
 * Get model loading status
 */
export const getModelStatus = (): { loading: boolean; error: string | null; ready: boolean } => {
  return {
    loading: isModelLoading,
    error: modelLoadError,
    ready: model !== null,
  };
};

/**
 * Load the TensorFlow.js model
 * Tries GraphModel first (converted from SavedModel), then LayersModel
 */
export const loadModel = async (): Promise<void> => {
  if (model || isModelLoading) return;

  isModelLoading = true;
  modelLoadError = null;

  try {
    console.log('Loading plant disease model...');
    
    // Try loading as GraphModel first (for converted SavedModel/TF Hub models)
    try {
      model = await tf.loadGraphModel(MODEL_URL);
      console.log('GraphModel loaded successfully');
    } catch {
      // Fall back to LayersModel (for Keras models)
      console.log('GraphModel failed, trying LayersModel...');
      model = await tf.loadLayersModel(MODEL_URL);
      console.log('LayersModel loaded successfully');
    }

    // Warm up the model with a dummy prediction
    const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
    let warmupResult: tf.Tensor | tf.Tensor[];
    if ('executeAsync' in model) {
      warmupResult = await (model as tf.GraphModel).executeAsync(dummyInput);
    } else {
      warmupResult = (model as tf.LayersModel).predict(dummyInput) as tf.Tensor;
    }
    if (Array.isArray(warmupResult)) {
      warmupResult.forEach(t => t.dispose());
    } else {
      (warmupResult as tf.Tensor).dispose();
    }
    dummyInput.dispose();
    
    console.log('Model warmed up and ready');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load model';
    console.error('Model loading error:', message);
    modelLoadError = message;
    model = null;
  } finally {
    isModelLoading = false;
  }
};

/**
 * Run inference on an image
 * Returns top predictions with class names and confidence scores
 */
export const predictDisease = async (
  imageDataUrl: string,
  topK: number = 3
): Promise<Array<{ className: PlantDiseaseClass; confidence: number }>> => {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  // Load and preprocess the image
  const imgElement = await loadImageFromDataUrl(imageDataUrl);
  const inputTensor = await preprocessImage(imgElement);

  try {
    // Run prediction - handle both GraphModel and LayersModel
    let predictions: tf.Tensor;
    if ('executeAsync' in model) {
      // GraphModel
      const result = await (model as tf.GraphModel).executeAsync(inputTensor);
      predictions = Array.isArray(result) ? result[0] : result;
    } else {
      // LayersModel
      predictions = (model as tf.LayersModel).predict(inputTensor) as tf.Tensor;
    }
    
    // Apply softmax if not already applied
    const softmaxed = predictions.softmax();
    const probabilities = await softmaxed.data();
    
    predictions.dispose();
    softmaxed.dispose();

    // Sort by confidence and get top K
    const results = Array.from(probabilities)
      .map((confidence, index) => ({
        className: PLANT_DISEASE_CLASSES[index] as PlantDiseaseClass,
        confidence,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topK);

    return results;
  } finally {
    inputTensor.dispose();
  }
};

/**
 * Parse class name into readable format
 * e.g., "Tomato___Early_blight" -> { crop: "Tomato", disease: "Early blight" }
 */
export const parseClassName = (className: PlantDiseaseClass): { crop: string; disease: string; isHealthy: boolean } => {
  const parts = className.split('___');
  const crop = parts[0].replace(/_/g, ' ').replace(/,/g, ',');
  let disease = parts[1] || 'Unknown';
  
  const isHealthy = disease.toLowerCase() === 'healthy';
  
  // Clean up disease name
  disease = disease
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter of each word
  disease = disease
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return { crop, disease, isHealthy };
};
