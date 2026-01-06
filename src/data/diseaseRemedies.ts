import { Remedy } from '@/types/diagnosis';
import { PlantDiseaseClass } from '@/lib/plantDiseaseModel';

// Comprehensive remedies database for all PlantVillage classes
export const remediesDatabase: Record<string, Remedy> = {
  // Apple diseases
  'Apple___Apple_scab': {
    diseaseName: 'Apple Scab',
    crop: 'Apple',
    chemicalSolution: 'Apply Captan or Myclobutanil fungicide at bud break and continue every 7-10 days during wet weather. Follow label instructions carefully.',
    organicSolution: 'Remove and destroy fallen leaves in autumn. Apply sulfur or lime-sulfur spray during dormant season. Use neem oil as preventive measure.',
    prevention: 'Plant resistant varieties. Prune trees for good air circulation. Rake and destroy fallen leaves. Avoid overhead irrigation.',
  },
  'Apple___Black_rot': {
    diseaseName: 'Black Rot',
    crop: 'Apple',
    chemicalSolution: 'Apply Captan, Mancozeb, or Thiophanate-methyl from pink bud stage through early fruit development.',
    organicSolution: 'Prune out and destroy all mummified fruits and dead wood. Apply copper-based fungicide during dormant season.',
    prevention: 'Remove mummified fruits from trees. Prune dead branches. Maintain proper tree spacing for air circulation.',
  },
  'Apple___Cedar_apple_rust': {
    diseaseName: 'Cedar Apple Rust',
    crop: 'Apple',
    chemicalSolution: 'Apply Myclobutanil or Triadimefon from pink bud through petal fall. Repeat applications every 7-10 days.',
    organicSolution: 'Remove nearby cedar/juniper trees if possible. Apply sulfur-based fungicides preventively.',
    prevention: 'Plant rust-resistant varieties. Remove cedar trees within 1-2 miles. Scout for and remove galls on cedars.',
  },
  'Apple___healthy': {
    diseaseName: 'Healthy',
    crop: 'Apple',
    chemicalSolution: 'No treatment needed. Continue regular maintenance and monitoring.',
    organicSolution: 'Maintain organic practices with compost and mulching. Regular pruning for optimal growth.',
    prevention: 'Regular inspection for early disease signs. Proper nutrition and watering. Maintain good sanitation.',
  },

  // Blueberry
  'Blueberry___healthy': {
    diseaseName: 'Healthy',
    crop: 'Blueberry',
    chemicalSolution: 'No treatment needed. Maintain regular fertilization schedule with acidic fertilizer.',
    organicSolution: 'Apply acidic mulch like pine needles. Maintain soil pH between 4.5-5.5.',
    prevention: 'Regular soil testing. Proper pruning. Good drainage. Bird netting to protect fruit.',
  },

  // Cherry diseases
  'Cherry_(including_sour)___Powdery_mildew': {
    diseaseName: 'Powdery Mildew',
    crop: 'Cherry',
    chemicalSolution: 'Apply Myclobutanil, Trifloxystrobin, or sulfur-based fungicides at first sign of infection.',
    organicSolution: 'Apply milk spray (40% milk, 60% water) or baking soda solution (1 tbsp per gallon). Use neem oil preventively.',
    prevention: 'Ensure good air circulation. Avoid excessive nitrogen fertilization. Water at base, not on foliage.',
  },
  'Cherry_(including_sour)___healthy': {
    diseaseName: 'Healthy',
    crop: 'Cherry',
    chemicalSolution: 'No treatment needed. Maintain regular care schedule.',
    organicSolution: 'Apply compost around base. Maintain mulch layer. Regular organic feeding.',
    prevention: 'Annual pruning. Monitor for pests. Proper watering during fruiting.',
  },

  // Corn/Maize diseases
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot': {
    diseaseName: 'Gray Leaf Spot',
    crop: 'Corn (Maize)',
    chemicalSolution: 'Apply Azoxystrobin or Pyraclostrobin foliar fungicides at first sign of disease.',
    organicSolution: 'Remove crop residue after harvest. Use resistant hybrids. Apply beneficial microbes.',
    prevention: 'Crop rotation with non-host crops. Tillage to bury residue. Plant resistant hybrids.',
  },
  'Corn_(maize)___Common_rust_': {
    diseaseName: 'Common Rust',
    crop: 'Corn (Maize)',
    chemicalSolution: 'Apply Propiconazole or Tebuconazole fungicides when pustules first appear on leaves.',
    organicSolution: 'Plant resistant varieties. Remove heavily infected plants. Apply sulfur-based fungicide.',
    prevention: 'Plant early-maturing varieties. Avoid excessive nitrogen fertilization. Scout regularly.',
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    diseaseName: 'Northern Leaf Blight',
    crop: 'Corn (Maize)',
    chemicalSolution: 'Apply Azoxystrobin or Propiconazole at early signs. Repeat if conditions favor disease.',
    organicSolution: 'Crop rotation for 1-2 years. Remove infected debris. Use resistant varieties.',
    prevention: 'Plant resistant hybrids. Rotate crops. Till under crop residue. Avoid planting late.',
  },
  'Corn_(maize)___healthy': {
    diseaseName: 'Healthy',
    crop: 'Corn (Maize)',
    chemicalSolution: 'No treatment needed. Maintain regular fertilization schedule.',
    organicSolution: 'Side-dress with compost. Maintain adequate moisture during tasseling.',
    prevention: 'Regular scouting. Proper plant spacing. Adequate nutrition.',
  },

  // Grape diseases
  'Grape___Black_rot': {
    diseaseName: 'Black Rot',
    crop: 'Grape',
    chemicalSolution: 'Apply Mancozeb or Myclobutanil starting at bud break through veraison every 7-14 days.',
    organicSolution: 'Remove mummified berries and infected canes. Apply copper fungicide during dormancy.',
    prevention: 'Prune for good air circulation. Remove mummies. Destroy infected fruit immediately.',
  },
  'Grape___Esca_(Black_Measles)': {
    diseaseName: 'Esca (Black Measles)',
    crop: 'Grape',
    chemicalSolution: 'No effective chemical cure. Apply wound sealant to pruning cuts. Consider trunk renewal.',
    organicSolution: 'Careful pruning. Apply Trichoderma-based products to wounds. Delay pruning until late dormancy.',
    prevention: 'Make clean pruning cuts. Avoid large wounds. Protect pruning wounds. Maintain vine vigor.',
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    diseaseName: 'Leaf Blight (Isariopsis)',
    crop: 'Grape',
    chemicalSolution: 'Apply copper-based fungicides or Mancozeb at first symptoms. Repeat every 10-14 days.',
    organicSolution: 'Remove infected leaves. Improve canopy management. Apply sulfur dust.',
    prevention: 'Good canopy management. Remove leaf litter. Avoid overhead irrigation.',
  },
  'Grape___healthy': {
    diseaseName: 'Healthy',
    crop: 'Grape',
    chemicalSolution: 'No treatment needed. Continue regular maintenance.',
    organicSolution: 'Maintain organic mulch. Apply compost in spring. Regular pruning.',
    prevention: 'Annual pruning. Regular monitoring. Proper training system.',
  },

  // Orange
  'Orange___Haunglongbing_(Citrus_greening)': {
    diseaseName: 'Citrus Greening (HLB)',
    crop: 'Orange',
    chemicalSolution: 'No cure available. Control Asian citrus psyllid with systemic insecticides. Remove infected trees.',
    organicSolution: 'Apply nutritional sprays. Control psyllids with organic insecticides. Remove infected trees immediately.',
    prevention: 'Use certified disease-free nursery stock. Control psyllid vectors. Regular scouting. Report infections.',
  },

  // Peach diseases
  'Peach___Bacterial_spot': {
    diseaseName: 'Bacterial Spot',
    crop: 'Peach',
    chemicalSolution: 'Apply copper-based bactericides during dormant season. Oxytetracycline during bloom.',
    organicSolution: 'Apply fixed copper at leaf fall and dormant season. Improve tree vigor with proper nutrition.',
    prevention: 'Plant resistant varieties. Avoid overhead irrigation. Windbreaks to reduce injury.',
  },
  'Peach___healthy': {
    diseaseName: 'Healthy',
    crop: 'Peach',
    chemicalSolution: 'No treatment needed. Regular care and dormant sprays as preventive.',
    organicSolution: 'Apply organic dormant oil spray. Compost application in spring.',
    prevention: 'Annual pruning. Regular monitoring. Proper thinning of fruit.',
  },

  // Pepper diseases
  'Pepper,_bell___Bacterial_spot': {
    diseaseName: 'Bacterial Spot',
    crop: 'Bell Pepper',
    chemicalSolution: 'Apply copper hydroxide or copper sulfate at first symptoms. Repeat every 7-10 days.',
    organicSolution: 'Apply copper-based organic fungicides. Remove infected plants. Use disease-free seed.',
    prevention: 'Use certified disease-free seed. Rotate crops 2-3 years. Avoid overhead irrigation.',
  },
  'Pepper,_bell___healthy': {
    diseaseName: 'Healthy',
    crop: 'Bell Pepper',
    chemicalSolution: 'No treatment needed. Maintain regular fertilization.',
    organicSolution: 'Apply organic mulch. Side-dress with compost during fruiting.',
    prevention: 'Stake plants. Regular watering. Proper spacing.',
  },

  // Potato diseases
  'Potato___Early_blight': {
    diseaseName: 'Early Blight',
    crop: 'Potato',
    chemicalSolution: 'Apply Mancozeb or Chlorothalonil every 7-10 days starting when plants are 6 inches tall.',
    organicSolution: 'Apply neem oil or copper fungicide. Remove infected leaves. Use compost tea.',
    prevention: 'Rotate crops 3+ years. Use certified seed. Adequate potassium fertilization.',
  },
  'Potato___Late_blight': {
    diseaseName: 'Late Blight',
    crop: 'Potato',
    chemicalSolution: 'Apply Metalaxyl + Mancozeb or Cymoxanil immediately upon detection. Repeat every 5-7 days.',
    organicSolution: 'Remove and destroy all infected plants immediately. Apply copper hydroxide. Improve drainage.',
    prevention: 'Use certified disease-free seed. Destroy volunteer potatoes. Avoid overhead irrigation.',
  },
  'Potato___healthy': {
    diseaseName: 'Healthy',
    crop: 'Potato',
    chemicalSolution: 'No treatment needed. Continue hilling and regular watering.',
    organicSolution: 'Apply compost mulch. Maintain soil moisture consistency.',
    prevention: 'Regular hilling. Scout for pests. Proper harvest timing.',
  },

  // Raspberry
  'Raspberry___healthy': {
    diseaseName: 'Healthy',
    crop: 'Raspberry',
    chemicalSolution: 'No treatment needed. Maintain regular pruning schedule.',
    organicSolution: 'Apply organic mulch. Prune floricanes after harvest.',
    prevention: 'Annual pruning. Trellis support. Good air circulation.',
  },

  // Soybean
  'Soybean___healthy': {
    diseaseName: 'Healthy',
    crop: 'Soybean',
    chemicalSolution: 'No treatment needed. Monitor for pest pressure.',
    organicSolution: 'Maintain good soil health with cover crops. Proper inoculation.',
    prevention: 'Crop rotation. Scout regularly. Proper planting density.',
  },

  // Squash
  'Squash___Powdery_mildew': {
    diseaseName: 'Powdery Mildew',
    crop: 'Squash',
    chemicalSolution: 'Apply sulfur or potassium bicarbonate at first symptoms. Repeat every 7-10 days.',
    organicSolution: 'Apply milk spray (40:60 milk to water) or baking soda solution. Neem oil as preventive.',
    prevention: 'Plant resistant varieties. Good air circulation. Avoid overhead watering. Morning watering only.',
  },

  // Strawberry diseases
  'Strawberry___Leaf_scorch': {
    diseaseName: 'Leaf Scorch',
    crop: 'Strawberry',
    chemicalSolution: 'Apply Captan or Thiram after harvest. Repeat in spring at bloom.',
    organicSolution: 'Remove infected leaves. Apply copper fungicide. Improve air circulation.',
    prevention: 'Plant resistant varieties. Proper spacing. Remove old foliage after harvest.',
  },
  'Strawberry___healthy': {
    diseaseName: 'Healthy',
    crop: 'Strawberry',
    chemicalSolution: 'No treatment needed. Maintain straw mulch.',
    organicSolution: 'Apply compost. Renew straw mulch. Remove runners as needed.',
    prevention: 'Regular renovation. Runner management. Proper watering.',
  },

  // Tomato diseases
  'Tomato___Bacterial_spot': {
    diseaseName: 'Bacterial Spot',
    crop: 'Tomato',
    chemicalSolution: 'Apply copper hydroxide + mancozeb at first symptoms. Repeat every 5-7 days.',
    organicSolution: 'Apply copper-based organic bactericide. Remove infected leaves. Use disease-free seed.',
    prevention: 'Use certified seed. Rotate crops 2-3 years. Avoid overhead irrigation. Stake plants.',
  },
  'Tomato___Early_blight': {
    diseaseName: 'Early Blight',
    crop: 'Tomato',
    chemicalSolution: 'Apply Mancozeb or Chlorothalonil every 7-10 days. Spray early morning or late evening.',
    organicSolution: 'Remove infected leaves immediately. Apply neem oil spray (2ml per liter water). Use copper fungicide.',
    prevention: 'Rotate crops yearly. Avoid overhead watering. Ensure good air circulation between plants.',
  },
  'Tomato___Late_blight': {
    diseaseName: 'Late Blight',
    crop: 'Tomato',
    chemicalSolution: 'Apply Metalaxyl + Mancozeb or Cymoxanil-based fungicides immediately upon detection.',
    organicSolution: 'Remove and burn all infected plants. Apply copper hydroxide spray. Improve drainage.',
    prevention: 'Plant resistant varieties. Avoid planting near potatoes. Remove plant debris after harvest.',
  },
  'Tomato___Leaf_Mold': {
    diseaseName: 'Leaf Mold',
    crop: 'Tomato',
    chemicalSolution: 'Apply Chlorothalonil or copper-based fungicides at first symptoms.',
    organicSolution: 'Increase ventilation. Remove lower leaves. Apply baking soda spray (1 tbsp per liter).',
    prevention: 'Maintain humidity below 85%. Space plants properly. Water at base only.',
  },
  'Tomato___Septoria_leaf_spot': {
    diseaseName: 'Septoria Leaf Spot',
    crop: 'Tomato',
    chemicalSolution: 'Apply Chlorothalonil or Mancozeb at first symptoms. Repeat every 7-10 days.',
    organicSolution: 'Remove infected leaves. Apply copper fungicide. Mulch to prevent splash.',
    prevention: 'Rotate crops 3 years. Remove plant debris. Stake plants. Avoid overhead watering.',
  },
  'Tomato___Spider_mites_Two-spotted_spider_mite': {
    diseaseName: 'Spider Mites',
    crop: 'Tomato',
    chemicalSolution: 'Apply miticide like Abamectin or Bifenazate. Ensure thorough coverage of undersides.',
    organicSolution: 'Spray with strong water jet. Apply neem oil or insecticidal soap. Release predatory mites.',
    prevention: 'Maintain adequate humidity. Avoid drought stress. Scout regularly. Remove weeds.',
  },
  'Tomato___Target_Spot': {
    diseaseName: 'Target Spot',
    crop: 'Tomato',
    chemicalSolution: 'Apply Chlorothalonil or Azoxystrobin at first symptoms. Rotate fungicide modes.',
    organicSolution: 'Remove infected foliage. Apply copper fungicide. Improve air circulation.',
    prevention: 'Stake or cage plants. Remove lower leaves. Rotate crops. Avoid overhead irrigation.',
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    diseaseName: 'Yellow Leaf Curl Virus',
    crop: 'Tomato',
    chemicalSolution: 'Control whitefly vectors with systemic insecticides (Imidacloprid). Remove infected plants.',
    organicSolution: 'Use reflective mulch to repel whiteflies. Apply neem oil. Remove and destroy infected plants.',
    prevention: 'Use resistant varieties. Control whiteflies. Use insect netting. Remove infected plants.',
  },
  'Tomato___Tomato_mosaic_virus': {
    diseaseName: 'Tomato Mosaic Virus',
    crop: 'Tomato',
    chemicalSolution: 'No chemical cure. Remove infected plants. Disinfect tools with 10% bleach.',
    organicSolution: 'Remove and destroy infected plants. Wash hands before handling. Use disease-free seed.',
    prevention: 'Use resistant varieties. Disinfect tools. Avoid tobacco products near plants. Handle carefully.',
  },
  'Tomato___healthy': {
    diseaseName: 'Healthy',
    crop: 'Tomato',
    chemicalSolution: 'No treatment needed. Your plant appears healthy!',
    organicSolution: 'Continue regular care. Maintain good watering and nutrition practices.',
    prevention: 'Keep monitoring regularly. Practice crop rotation. Maintain soil health.',
  },
};

/**
 * Get remedy for a given disease class
 */
export const getRemedyForClass = (className: string): Remedy | null => {
  return remediesDatabase[className] || null;
};

/**
 * Get a default remedy for unknown diseases
 */
export const getDefaultRemedy = (diseaseName: string, crop: string): Remedy => {
  return {
    diseaseName,
    crop,
    chemicalSolution: 'Please consult a local agricultural extension officer for specific treatment recommendations for this condition.',
    organicSolution: 'Remove affected parts of the plant. Improve air circulation. Apply general-purpose organic fungicide as a precaution.',
    prevention: 'Practice crop rotation. Maintain plant spacing. Avoid overhead watering. Regular monitoring.',
  };
};
