# Plant Disease Model Setup

This folder should contain a TensorFlow.js model for plant disease detection.

## How to add your model

1. Train a model using the PlantVillage dataset (Keras/TensorFlow)
2. Convert to TensorFlow.js format using:
   ```bash
   tensorflowjs_converter --input_format=keras model.h5 ./plant-disease/
   ```
3. Place the generated files here:
   - `model.json` (model architecture)
   - `group1-shard1of*.bin` (model weights)

## Expected model specifications

- **Input**: 224x224x3 RGB images normalized to [0, 1]
- **Output**: 38 class probabilities (PlantVillage classes)
- **Architecture**: MobileNetV2 or similar lightweight CNN

## Pre-trained models

You can find pre-trained PlantVillage models on:
- Kaggle: https://www.kaggle.com/datasets/emmarex/plantdisease
- TensorFlow Hub (similar plant models)
- GitHub: Search for "PlantVillage TensorFlow.js"

## Demo Mode

If no model is present, the app will automatically use demo mode with simulated predictions.
