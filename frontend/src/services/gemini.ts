import { CropDisease } from "../types";

const API_BASE = "http://127.0.0.1:8000";

// 🌿 Call FastAPI /predict
export const analyzeCropImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  return await response.json();
};

// 🤖 Call FastAPI /chat
export const getAgronomistAdvice = async (message: string) => {
  const response = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to advisor");
  }

  return await response.json();
};