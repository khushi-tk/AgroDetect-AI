export type CropDisease = {
  name: string;
  confidence: number;
  description: string;
  etiology: string;
  treatment: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
  timestamp: number;
  imageUrl?: string;
};

export type TelemetryData = {
  soilPh: number;
  moisture: number;
  nitrogen: number;
  temperature: number;
};

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export type OutbreakPoint = {
  id: string;
  lat: number;
  lng: number;
  disease: string;
  severity: 'low' | 'medium' | 'high';
};
