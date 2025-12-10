import { GoogleGenAI } from "@google/genai";
import { API_KEY, MAPS_MODEL_NAME } from "../constants";

export const findNearbyHospitals = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MAPS_MODEL_NAME,
      contents: "Find the 3 nearest hospitals or medical centers to my location. Provide their names and addresses.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const text = response.text;
    
    return {
      text,
      places: chunks?.filter(c => c.maps).map(c => c.maps) || []
    };
  } catch (error) {
    console.error("Error finding hospitals:", error);
    throw error;
  }
};
