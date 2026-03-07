from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

BASE_DIR   = "/home/khushi/AgroDetect"
MODEL_PATH = "/home/khushi/AgroDetect/saved_models/plant_disease_model.h5"
DATA_PATH  = "/home/khushi/AgroDetect/data/PlantVillage"

from google import genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in backend/.env")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AgroDetect AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMG_SIZE = 128

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    class_names = sorted(os.listdir(DATA_PATH))
    print(f"✅ Model loaded. Classes: {len(class_names)}")
except Exception as e:
    print(f"⚠ Model loading failed: {e}")
    model = None
    class_names = ["Healthy", "Early Blight", "Late Blight", "Leaf Spot"]

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

@app.post("/chat")
async def chat(payload: dict):
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    prompt = f"""
You are an AI Agronomist specialising in tomato and potato crop diseases, especially late blight caused by Phytophthora infestans.
Provide clear, practical, farmer-friendly advice. Be specific about fungicide names, dosages, and timing.

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

        # ===== TOMATO LATE BLIGHT (primary focus) =====
        if "late blight" in msg or "phytophthora" in msg:
            reply = """Late blight (Phytophthora infestans) is the most destructive tomato and potato disease.

🔍 Identification:
• Dark water-soaked lesions on leaves, often with white mould on underside
• Brown lesions on stems, fruits turn dark brown and rot rapidly
• Spreads field-wide within 48–72 hours in cool, wet weather (15–20°C)

🌿 Organic Treatment:
• Apply Bordeaux mixture (copper sulfate + lime) immediately
• Remove and destroy ALL infected material — do not compost
• Switch to drip irrigation — keep foliage completely dry
• Spray copper hydroxide every 5–7 days during wet weather

⚗️ Chemical Treatment:
• Mancozeb 75% WP at 2.5g/L — protectant, spray preventively
• Cymoxanil + Mancozeb (Curzate M) — curative within 48h of infection
• Metalaxyl-M (Ridomil Gold) — systemic, use when blight is spreading
• Fluopicolide (Infinito) — best for resistant strains

⚠️ Critical Actions:
• Act within 24 hours of first symptom — delay causes total crop loss
• Rotate fungicide modes of action to prevent resistance
• Spray in the morning so leaves dry before evening"""

        # ===== EARLY BLIGHT =====
        elif "early blight" in msg or "alternaria" in msg:
            reply = """Early blight (Alternaria solani) typically affects older, stressed tomato plants.

🔍 Identification:
• Concentric ring (target-like) lesions on older leaves first
• Yellow halo surrounding brown spots
• Progresses upward from the base of the plant

🌿 Organic Treatment:
• Remove all affected lower leaves immediately
• Neem oil spray at 5ml/L every 7 days
• Baking soda solution (1 tsp per litre) as foliar spray
• Mulch around base to prevent soil splash

⚗️ Chemical Treatment:
• Copper oxychloride 50% WP at 3g/L
• Mancozeb 75% WP at 2g/L
• Azoxystrobin (Amistar) for systemic control

🛡️ Prevention:
• Stake plants to keep foliage off ground
• Water at base only — never wet leaves
• 2–3 year rotation away from Solanaceae crops"""

        # ===== TREATMENT / FUNGICIDE QUESTIONS =====
        elif any(w in msg for w in ["treatment", "fungicide", "spray", "apply", "cure", "control"]):
            reply = """General disease management for tomato crops:

⚗️ Recommended Fungicides:
• Mancozeb 75% WP (2–2.5g/L) — broad-spectrum protectant
• Copper hydroxide — effective for both fungal and bacterial diseases
• Cymoxanil + Mancozeb — curative action within 48 hours
• Azoxystrobin (Amistar) — systemic, long-lasting protection

📋 Application Guidelines:
• Spray early morning for best absorption and to allow drying
• Repeat every 7 days, or every 5 days in wet weather
• Always cover both upper and lower leaf surfaces
• Rotate between fungicide groups to prevent resistance

🌿 Organic Options:
• Bordeaux mixture — preventive copper-based spray
• Neem oil (5ml/L) — broad-spectrum, safe for beneficial insects
• Trichoderma-based biocontrol for soil-borne diseases"""

        # ===== PREVENTION =====
        elif any(w in msg for w in ["prevent", "avoid", "protect", "stop"]):
            reply = """Disease prevention strategy for tomato and potato crops:

🌱 Before Planting:
• Use certified disease-free or resistant varieties
• Treat seeds with Thiram or Captan fungicide
• Prepare raised beds with well-drained soil
• Test soil pH — aim for 6.0–6.8 for tomatoes

🌿 During the Season:
• Maintain wide plant spacing (45–60cm) for airflow
• Use drip irrigation — wet foliage invites infection
• Apply preventive copper spray before wet weather forecasts
• Scout fields twice weekly during high-risk periods

🔄 After Harvest:
• Remove and destroy all crop residue
• Deep plough to bury disease inoculum
• Rotate with cereals or legumes for 2–3 years
• Never compost diseased plant material"""

        # ===== GENERAL / DEFAULT =====
        else:
            reply = """As an AI Agronomist, here is key advice for healthy tomato crops:

🔍 Most Common Diseases to Watch:
• Late blight (Phytophthora infestans) — most destructive, acts fast
• Early blight (Alternaria solani) — affects older leaves first
• Bacterial spot (Xanthomonas) — water-soaked lesions in wet weather
• Leaf mould — grey/brown patches in humid greenhouse conditions

📅 Weekly Management Checklist:
• Inspect lower leaves for early signs of blight or spots
• Check weather forecast — apply fungicide before rain
• Ensure drip irrigation is working — avoid wetting foliage
• Remove any yellowing or infected leaves promptly

⚗️ Preventive Spray Schedule:
• Mancozeb every 10–14 days as standard protection
• Switch to systemic fungicide (Amistar/Ridomil) at first sign of disease
• Copper-based spray after heavy rain

Ask me about a specific disease for detailed treatment advice."""

        return {"status": "fallback", "reply": reply}

@app.get("/health")
def health():
    return {
        "status": "AgroDetect API running",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "data_path": DATA_PATH,
        "classes_found": len(class_names)
    }
