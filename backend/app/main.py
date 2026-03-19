from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import numpy as np
from PIL import Image
import tensorflow as tf
from google import genai
import io
import os

# Setup paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "saved_models"
MODEL_PATH = MODEL_DIR / "plant_disease_model.h5"
CLASSES_PATH = BASE_DIR / "classes.txt"

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# HF_REPO_ID = os.getenv("HF_REPO_ID", "Khushi-tk/agrodetect")
# HF_TOKEN = os.getenv("HF_TOKEN")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

# Gemini client
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Ensure model directory exists
MODEL_DIR.mkdir(exist_ok=True)

# Uncomment when ready to enable HuggingFace download:
# if not MODEL_PATH.exists():
#     print("⬇ Downloading model from HuggingFace...")
#     from huggingface_hub import hf_hub_download
#     hf_hub_download(
#         repo_id=HF_REPO_ID,
#         filename="plant_disease_model.h5",
#         local_dir=str(MODEL_DIR),
#         token=HF_TOKEN
#     )

# Load classes
if CLASSES_PATH.exists():
    with open(CLASSES_PATH, "r") as f:
        class_names = [line.strip() for line in f if line.strip()]
else:
    print("⚠ classes.txt not found, using fallback classes")
    class_names = ["Healthy", "Early Blight", "Late Blight", "Leaf Spot"]

# FastAPI app
app = FastAPI(title="AgroDetect AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
IMG_SIZE = 128

if not MODEL_PATH.exists():
    print(f"❌ Model file not found at {MODEL_PATH}")
    model = None
else:
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model loaded | Classes: {len(class_names)}")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        model = None


# Prediction route
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((IMG_SIZE, IMG_SIZE))

        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        idx = int(np.argmax(predictions))
        confidence = float(np.max(predictions))
        predicted_class = class_names[idx]

        return {
            "status": "success",
            "diagnosis": predicted_class,
            "confidence": round(confidence * 100, 2),
            "etiology": "Fungal or bacterial pathogen influenced by humidity and temperature.",
            "recommendation": "Apply appropriate fungicide and improve field ventilation."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Chat route (Gemini + fallback)
@app.post("/chat")
async def chat(payload: dict):
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    prompt = f"""
You are an AI Agronomist specialising in tomato and potato crop diseases.
Provide clear, practical, farmer-friendly advice.

Farmer question:
{user_message}
"""

    try:
        response = gemini_client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=prompt
        )
        return {"status": "gemini", "reply": response.text}

    except Exception as e:
        print(f"⚠ Gemini failed: {e}")

        msg = user_message.lower()
        if "late blight" in msg:
            reply = "Late blight detected. Use Mancozeb or Metalaxyl immediately and avoid wet foliage."
        elif "early blight" in msg:
            reply = "Early blight detected. Remove affected leaves and apply copper fungicide."
        else:
            reply = "Ensure proper irrigation, spacing, and preventive fungicide use."

        return {"status": "fallback", "reply": reply}


# Health check
@app.get("/health")
def health():
    return {
        "status": "AgroDetect API running",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "classes_count": len(class_names)
    }


# Debug route
@app.get("/debug/model-info")
def model_info():
    if model is None:
        return {"error": "Model not loaded"}

    return {
        "input_shape": model.input_shape,
        "output_shape": model.output_shape,
        "classes_count": len(class_names),
        "class_names": class_names
    }