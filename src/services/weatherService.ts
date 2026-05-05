
export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  alerts: { en: string; kn: string }[];
  advisory: {
    en: string;
    kn: string;
  };
}

export const fetchWeather = async (lat: number, lon: number, crop?: string): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  const current = data.current;
  const weatherCode = current.weather_code;
  const alerts: { en: string; kn: string }[] = [];

  // Weather alerts
  if (current.precipitation > 20) {
    alerts.push({ en: "Heavy rain alert!", kn: "ಭಾರೀ ಮಳೆಯ ಎಚ್ಚರಿಕೆ!" });
  }
  if (current.wind_speed_10m > 40) {
    alerts.push({ en: "High wind alert!", kn: "ಬಲವಾದ ಗಾಳಿಯ ಎಚ್ಚರಿಕೆ!" });
  }

  // Agricultural advisories based on weather codes and conditions
  let advisoryEn = "Normal conditions. Continue regular monitoring.";
  let advisoryKn = "ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ. ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.";

  if (current.precipitation > 0) {
    advisoryEn = "Rain expected. Postpone pesticide spraying and irrigation.";
    advisoryKn = "ಮಳೆಯ ಮುನ್ಸೂಚನೆ. ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮತ್ತು ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡಿ.";
  } else if (current.wind_speed_10m > 15) {
    advisoryEn = "High winds detected. Avoid spraying activities.";
    advisoryKn = "ಬಲವಾದ ಗಾಳಿ. ಸಿಂಪಡಿಸುವ ಚಟುವಟಿಕೆಗಳನ್ನು ತಪ್ಪಿಸಿ.";
  } else if (current.temperature_2m > 35) {
    advisoryEn = "High temperature. Increase irrigation frequency if needed.";
    advisoryKn = "ಹೆಚ್ಚಿನ ತಾಪಮಾನ. ಅಗತ್ಯವಿದ್ದರೆ ನೀರಾವರಿ ಆವರ್ತನವನ್ನು ಹೆಚ್ಚಿಸಿ.";
  }

  // Enhance with crop-specific advisory
  if (crop) {
    const cropAdvisory = getCropWeatherAdvisory(crop, current);
    advisoryEn += ` (${cropAdvisory.en})`;
    advisoryKn += ` (${cropAdvisory.kn})`;
  }

  return {
    temp: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    precipitation: current.precipitation,
    condition: getWeatherCondition(weatherCode),
    alerts,
    advisory: {
      en: advisoryEn,
      kn: advisoryKn
    }
  };
};

const getCropWeatherAdvisory = (crop: string, current: any): { en: string, kn: string } => {
  // Simple crop-weather rules
  if (crop === 'Paddy' && current.precipitation > 0) {
    return { en: "Ensure proper drainage for Paddy.", kn: "ಭತ್ತದ ಗದ್ದೆಗೆ ಸರಿಯಾದ ಒಳಚರಂಡಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ." };
  }
  if (crop === 'Tomato' && current.temperature_2m > 30) {
    return { en: "Monitor for fruit cracking in Tomatoes.", kn: "ಟೊಮೆಟೊ ಹಣ್ಣು ಒಡೆಯುವುದನ್ನು ಗಮನಿಸಿ." };
  }
  return { en: "Monitor your crop closely.", kn: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಹತ್ತಿರದಿಂದ ಗಮನಿಸಿ." };
};

const getWeatherCondition = (code: number): string => {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain Showers";
  if (code <= 99) return "Thunderstorm";
  return "Cloudy";
};
