import { GoogleGenAI } from "@google/genai";
import { API_KEY, MAPS_MODEL_NAME } from "../constants";

const queryOverpassAPI = async (url: string, query: string) => {
  const response = await fetch(url, {
    method: "POST",
    body: query,
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

export const findNearbyHospitals = async (lat: number, lng: number) => {
  try {
    const urls = [
      import.meta.env.VITE_OVERPASS_API_URL || "https://overpass-api.de/api/interpreter",
      import.meta.env.VITE_OVERPASS_FALLBACK_1 || "https://z.overpass-api.de/api/interpreter",
      import.meta.env.VITE_OVERPASS_FALLBACK_2 || "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ];

    const query = `[bbox:${lat - 0.045},${lng - 0.045},${lat + 0.045},${lng + 0.045}];(node["amenity"="hospital"]; way["amenity"="hospital"]; );out center 5;`;

    let lastError: Error | null = null;
    for (const url of urls) {
      try {
        const data = await queryOverpassAPI(url, query);
        const hospitals = (data.elements || [])
          .slice(0, 5)
          .map((element: any) => ({
            text: element.tags?.name || "Hospital",
            places: element.lat && element.lon ? [{ lat: element.lat, lng: element.lon }] : [],
          }));
        return {
          text: `Found ${hospitals.length} nearby hospitals`,
          places: hospitals.length > 0 ? hospitals[0].places : [],
        };
      } catch (err) {
        lastError = err as Error;
        continue;
      }
    }
    throw lastError || new Error("All Overpass API endpoints failed");
  } catch (error) {
    console.error("Error finding hospitals:", error);
    return {
      text: "Could not fetch hospital data.",
      places: [],
    };
  }
};
