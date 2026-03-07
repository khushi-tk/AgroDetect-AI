import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCropImage } from '../services/gemini';
import { CropDisease } from '../types';

interface ScannerProps {
  onResult: (result: CropDisease) => void;
}

// ✅ Disease knowledge base — maps class names to full CropDisease data
const DISEASE_DB: Record<string, Partial<CropDisease>> = {
  Tomato_Late_blight: {
    description: "Late blight is caused by the oomycete pathogen Phytophthora infestans.",
    etiology: "Spreads rapidly in cool, wet conditions via airborne sporangia. Can devastate entire crops within days.",
    treatment: {
      organic: [
        "Apply copper-based fungicide (Bordeaux mixture)",
        "Remove and destroy all infected plant material immediately",
        "Use compost tea spray to boost plant immunity",
        "Avoid overhead watering — use drip irrigation",
      ],
      chemical: [
        "Mancozeb 75% WP at 2.5g/L water",
        "Chlorothalonil 75% WP at 2g/L water",
        "Cymoxanil + Mancozeb (Curzate M) at label rate",
        "Metalaxyl-M (Ridomil Gold) for systemic control",
      ],
    },
    prevention: [
      "Plant certified disease-free or resistant tomato varieties",
      "Maintain wide plant spacing for airflow",
      "Apply preventive fungicide sprays before wet weather",
      "Rotate crops — avoid planting Solanaceae in same bed for 2+ years",
      "Monitor daily during cool, humid periods (15–20°C)",
    ],
  },
  Tomato_Early_blight: {
    description: "Early blight is caused by the fungus Alternaria solani.",
    etiology: "Favoured by warm, humid conditions. Causes characteristic concentric ring lesions on older leaves first.",
    treatment: {
      organic: [
        "Remove infected lower leaves immediately",
        "Apply neem oil spray (5ml/L) every 7 days",
        "Use baking soda solution (1 tsp/L) as foliar spray",
        "Mulch base of plants to prevent soil splash",
      ],
      chemical: [
        "Copper oxychloride 50% WP at 3g/L",
        "Mancozeb 75% WP at 2g/L water",
        "Azoxystrobin (Amistar) at label rate",
        "Difenoconazole for systemic control",
      ],
    },
    prevention: [
      "Water at the base — never wet foliage",
      "Stake or cage plants to keep foliage off the ground",
      "Practice 2–3 year crop rotation with non-Solanaceae",
      "Remove plant debris after harvest",
      "Use resistant varieties where available",
    ],
  },
  Potato___Late_blight: {
    description: "Potato late blight caused by Phytophthora infestans — the pathogen responsible for the Irish Famine.",
    etiology: "Airborne sporangia infect leaves in cool, wet weather. Spreads to tubers causing wet rot in storage.",
    treatment: {
      organic: [
        "Apply Bordeaux mixture preventively",
        "Remove and destroy infected haulms before harvest",
        "Avoid irrigation during cool cloudy periods",
        "Use phosphonate-based biofungicides",
      ],
      chemical: [
        "Mancozeb + Cymoxanil (Curzate) at label rate",
        "Fluopicolide (Infinito) for systemic control",
        "Propamocarb hydrochloride spray",
        "Dimethomorph (Acrobat) at label rate",
      ],
    },
    prevention: [
      "Plant certified blight-free seed potatoes",
      "Hill up soil around stems to protect tubers",
      "Harvest during dry weather and cure properly",
      "Destroy volunteer potato plants",
      "Monitor using blight forecasting tools (BlightCast)",
    ],
  },
  Potato___Early_blight: {
    description: "Early blight of potato caused by Alternaria solani.",
    etiology: "Affects stressed or aging plants. Warm days and cool nights with high humidity favour infection.",
    treatment: {
      organic: [
        "Remove and destroy affected foliage",
        "Apply neem oil spray weekly",
        "Ensure adequate potassium fertilisation",
        "Use compost to improve soil health",
      ],
      chemical: [
        "Chlorothalonil 75% WP at 2g/L",
        "Mancozeb 75% WP at 2.5g/L",
        "Azoxystrobin (Amistar) at label rate",
      ],
    },
    prevention: [
      "Avoid excessive nitrogen — encourages lush susceptible growth",
      "Rotate crops with cereals or legumes",
      "Irrigate in the morning so leaves dry quickly",
      "Remove crop debris after harvest",
    ],
  },
  Tomato_Bacterial_spot: {
    description: "Bacterial spot caused by Xanthomonas vesicatoria.",
    etiology: "Spreads through rain splash and contaminated seed. Warm, wet weather accelerates infection.",
    treatment: {
      organic: [
        "Apply copper-based bactericide (copper hydroxide)",
        "Remove and destroy infected plant parts",
        "Avoid working in fields when plants are wet",
      ],
      chemical: [
        "Copper hydroxide + Mancozeb tank mix",
        "Streptomycin sulfate (where permitted)",
        "Kasugamycin-based bactericide",
      ],
    },
    prevention: [
      "Use certified disease-free seed",
      "Avoid overhead irrigation",
      "Rotate crops — minimum 2 years",
      "Disinfect tools between plants",
      "Plant resistant varieties",
    ],
  },
  Tomato_healthy: {
    description: "No disease detected. Your tomato plant appears healthy.",
    etiology: "Continue current management practices to maintain plant health.",
    treatment: {
      organic: ["Continue regular neem oil preventive spray", "Maintain compost mulch around base"],
      chemical: ["No treatment required"],
    },
    prevention: [
      "Maintain consistent watering schedule",
      "Monitor weekly for early signs of disease",
      "Ensure adequate nutrition with balanced NPK",
      "Keep foliage dry — water at the base",
    ],
  },
  Pepper__bell___healthy: {
    description: "No disease detected. Your bell pepper plant appears healthy.",
    etiology: "Plant is in good condition. Maintain current care practices.",
    treatment: {
      organic: ["Preventive neem oil spray monthly", "Compost mulch at base"],
      chemical: ["No treatment required"],
    },
    prevention: [
      "Monitor for aphids and whitefly weekly",
      "Water consistently at base level",
      "Rotate crops each season",
      "Ensure good airflow around plants",
    ],
  },
};

// ✅ Fuzzy match: find best disease key from class name
const getDiseaseData = (className: string): Partial<CropDisease> => {
  // Try exact match first
  if (DISEASE_DB[className]) return DISEASE_DB[className];

  // Try normalised match (replace spaces/underscores)
  const normalised = className.replace(/\s+/g, '_');
  if (DISEASE_DB[normalised]) return DISEASE_DB[normalised];

  // Try partial match
  const key = Object.keys(DISEASE_DB).find(k =>
    k.toLowerCase().includes(className.toLowerCase()) ||
    className.toLowerCase().includes(k.toLowerCase())
  );
  if (key) return DISEASE_DB[key];

  // Generic fallback
  return {
    description: "Disease detected by AI model. Consult a local agronomist for confirmation.",
    etiology: "Pathogen type and spread mechanism require further analysis.",
    treatment: {
      organic: ["Remove visibly infected plant material", "Apply neem oil spray as a precaution", "Improve airflow around plants"],
      chemical: ["Consult local agronomist for appropriate fungicide or bactericide"],
    },
    prevention: [
      "Practice regular crop monitoring",
      "Maintain crop rotation every 2–3 years",
      "Use certified disease-free planting material",
      "Ensure balanced fertilisation",
    ],
  };
};

export const Scanner: React.FC<ScannerProps> = ({ onResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    await processImage(file, previewUrl);
  };

  const processImage = async (file: File, previewUrl: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const raw = await analyzeCropImage(file);
      const diseaseData = getDiseaseData(raw.diagnosis ?? "");

      const result: CropDisease = {
        name: (raw.diagnosis ?? "Unknown").replace(/_/g, ' '),
        confidence: raw.confidence ?? 0,
        description: diseaseData.description ?? raw.etiology ?? "",
        etiology: diseaseData.etiology ?? raw.etiology ?? "",
        treatment: diseaseData.treatment ?? {
          organic: [],
          chemical: raw.recommendation ? [raw.recommendation] : [],
        },
        prevention: diseaseData.prevention ?? [],
        timestamp: Date.now(),
        imageUrl: previewUrl,
      };

      onResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    setIsScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <Camera className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Neural Optical Scanner</h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto">
                Upload or capture a photo of the affected crop for instant AI diagnosis.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full rounded-xl overflow-hidden group"
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />

            {isScanning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
                <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Analyzing Pathogens...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-red-500/20 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-white font-medium">{error}</p>
                <button onClick={reset} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  Try Again
                </button>
              </div>
            )}

            {!isScanning && !error && (
              <button onClick={reset} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
