🌱 AgroDetect AI
AI-Powered Crop Disease Detection and Agronomic Advisory

   AgroDetect AI is a computer vision–based system designed to help identify plant diseases from leaf images and provide agronomic recommendations. The system combines a CNN-based image classification model with a FastAPI backend and a React + TypeScript frontend to create an interactive AI-powered diagnostic tool.

   The goal of this project is to demonstrate how machine learning models can move from experimentation in notebooks to usable end-to-end applications.

Features
   Disease Detection

   Classifies crop diseases from leaf images using a trained TensorFlow CNN model

   Supports multiple crops and disease classes from the PlantVillage dataset

Image Upload

   Drag-and-drop or upload leaf images through a web interface

AI Agronomist Assistant

   Provides crop health advice and farming recommendations using an LLM-powered chat endpoint

Real-Time Inference

   Fast predictions via a FastAPI backend

Interactive UI

   Modern frontend built with React + TypeScript + Vite

System Architecture
```
User
  │
  │ Upload Image / Ask Question
  ▼
React Frontend (Vite + TypeScript)
  │
  │ API Requests
  ▼
FastAPI Backend
  │
  ├── /predict → TensorFlow CNN Model
  │        │
  │        └── Crop disease classification
  │
  └── /chat → LLM-based agronomic advisor
📂 Project Structure
AgroDetect/
│
├── backend/
│   └── app/
│       └── main.py           # FastAPI backend
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── services/         # API communication
│   │   ├── types.ts          # Type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
├── training/
│   ├── dataset.py            # Dataset preparation
│   ├── model.py              # CNN architecture
│   └── train.py              # Model training pipeline
│
├── data/
│   └── PlantVillage/         # PlantVillage dataset
│
├── saved_models/
│   └── plant_disease_model.h5
│
└── predict.py              # Standalone prediction script
```
 Machine Learning Model

The disease classification model is built using TensorFlow / Keras.

Model Details

   Architecture: Convolutional Neural Network (CNN)

   Input size: 128 × 128

   Dataset: PlantVillage

   Output: Disease class prediction with confidence score

Supported Disease Classes (Example)

   Tomato Late Blight

   Tomato Leaf Mold

   Tomato Yellow Leaf Curl Virus

   Potato Early Blight

   Potato Late Blight

   Pepper Bacterial Spot

   Healthy leaves

Installation

Clone the repository

git clone https://github.com/khushi-tk/AgroDetect.git
cd AgroDetect

Backend Setup (FastAPI)

Create virtual environment
python -m venv venv

Activate:

Linux / macOS

source venv/bin/activate

Windows

venv\Scripts\activate
Install dependencies
pip install -r requirements.txt

Example dependencies:

   fastapi
   uvicorn
   tensorflow
   numpy
   pillow
   python-multipart
   Run the backend
   uvicorn backend.app.main:app --reload

Server will start at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
Frontend Setup (React + Vite)

Navigate to frontend directory:

   cd frontend

   Install dependencies:

   npm install

   Run development server:

   npm run dev

Frontend runs at:

http://localhost:5173
🔌 API Endpoints
Predict Crop Disease

POST

/predict

Request:

multipart/form-data
file: image

Example response:

{
  "status": "success",
  "diagnosis": "Tomato_Late_blight",
  "confidence": 98.2,
  "etiology": "Fungal pathogen encouraged by humid conditions",
  "recommendation": "Apply appropriate fungicide and improve field ventilation"
}
Agronomist Chat

POST

/chat

Request:

   {
   "message": "How do I treat leaf blight?"
   }

Response:

   {
   "status": "success",
   "reply": "Apply fungicide and maintain proper airflow around plants."
   }

Future Improvements

   Deploy the model as a cloud API

   Mobile app for farmers

   Support more crops and diseases

   Integrate weather-based disease prediction

   Improve model accuracy with larger datasets

   Offline inference for low-connectivity regions

Acknowledgements

   PlantVillage Dataset

   TensorFlow / Keras

   FastAPI

   React + Vite
