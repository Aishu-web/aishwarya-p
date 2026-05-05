
export interface CropCalendarStage {
  stage: string;
  stageKn: string;
  months: string[];
  description: string;
  descriptionKn: string;
  optimalWeather: string;
  optimalWeatherKn: string;
}

export interface CropCalendarEntry {
  crop: string;
  cropKn: string;
  cropType: string; // e.g., 'Cereal', 'Fruit', 'Vegetable'
  location: string; // e.g., 'Coastal Karnataka', 'Southern Karnataka', 'All Karnataka'
  stages: CropCalendarStage[];
}

export const CROP_CALENDAR: CropCalendarEntry[] = [
  {
    crop: 'Paddy',
    cropKn: 'ಭತ್ತ',
    cropType: 'Cereal',
    location: 'All Karnataka',
    stages: [
      {
        stage: 'Nursery Preparation',
        stageKn: 'ನೇಜಿ ತಯಾರಿ',
        months: ['June', 'July'],
        description: 'Sowing seeds in a nursery bed with organic manure.',
        descriptionKn: 'ಸಾವಯವ ಗೊಬ್ಬರದೊಂದಿಗೆ ನೇಜಿ ಮಡಿಗಳಲ್ಲಿ ಬೀಜ ಬಿತ್ತನೆ.',
        optimalWeather: 'Moderate rain, 25-30°C',
        optimalWeatherKn: 'ಮಧ್ಯಮ ಮಳೆ, 25-30°C'
      },
      {
        stage: 'Transplanting',
        stageKn: 'ನಾಟಿ ಕಾರ್ಯ',
        months: ['July', 'August'],
        description: 'Moving 21-25 day old seedlings to the main field.',
        descriptionKn: '21-25 ದಿನಗಳ ಸಸಿಗಳನ್ನು ಮುಖ್ಯ ಹೊಲಕ್ಕೆ ಸ್ಥಳಾಂತರಿಸುವುದು.',
        optimalWeather: 'Frequent rain, Cloud cover',
        optimalWeatherKn: 'ವಾರವಿಡೀ ಮಳೆ, ಮೋಡ ಕವಿದ ವಾತಾವರಣ'
      },
      {
        stage: 'Vegetative Phase',
        stageKn: 'ಬೆಳವಣಿಗೆಯ ಹಂತ',
        months: ['August', 'September', 'October'],
        description: 'Rapid growth, tillering, and weeding activities.',
        descriptionKn: 'ಕ್ಷಿಪ್ರ ಬೆಳವಣಿಗೆ, ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಳೆ ತೆಗೆಯುವುದು.',
        optimalWeather: 'High humidity, Sun & Rain mix',
        optimalWeatherKn: 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ, ಬಿಸಿಲು ಮತ್ತು ಮಳೆಯ ಮಿಶ್ರಣ'
      },
      {
        stage: 'Harvesting',
        stageKn: 'ಕೊಯ್ಲು',
        months: ['November', 'December'],
        description: 'Draining the field and cutting the golden yellow crop.',
        descriptionKn: 'ಹೊಲದಿಂದ ನೀರನ್ನು ಬಸಿದು ಹಾಕುವುದು ಮತ್ತು ಬಂಗಾರದ ಬಣ್ಣದ ಬೆಳೆಯನ್ನು ಕತ್ತರಿಸುವುದು.',
        optimalWeather: 'Dry weather, Sunny days',
        optimalWeatherKn: 'ಒಣ ಹವೆ, ಬಿಸಿಲಿನ ದಿನಗಳು'
      }
    ]
  },
  {
    crop: 'Areca nut',
    cropKn: 'ಅಡಿಕೆ',
    cropType: 'Nut',
    location: 'Coastal Karnataka',
    stages: [
      {
        stage: 'Land Preparation',
        stageKn: 'ನೆಲ ಸಿದ್ಧತೆ',
        months: ['May', 'June'],
        description: 'Digging pits and applying base fertilizers.',
        descriptionKn: 'ಗುಂಡಿಗಳನ್ನು ತೋಡುವುದು ಮತ್ತು ಮೂಲ ಗೊಬ್ಬರಗಳನ್ನು ಹಾಕುವುದು.',
        optimalWeather: 'Early monsoon showers',
        optimalWeatherKn: 'ಮುಂಗಾರು ಆರಂಭದ ಮಳೆ'
      },
      {
        stage: 'Pollination',
        stageKn: 'ಪರಾಗಸ್ಪರ್ಶ',
        months: ['February', 'March'],
        description: 'Development of inflorescence and pollination.',
        descriptionKn: 'ಹೂಗೊಂಚಲುಗಳ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಪರಾಗಸ್ಪರ್ಶ.',
        optimalWeather: 'Mild wind, Dry weather',
        optimalWeatherKn: 'ಮೃದುವಾದ ಗಾಳಿ, ಒಣ ಹವೆ'
      },
      {
        stage: 'Harvesting',
        stageKn: 'ಕೊಯ್ಲು',
        months: ['November', 'December', 'January', 'February'],
        description: 'Harvesting of ripe nuts (Chali) or tender nuts (Koka).',
        descriptionKn: 'ಹಣ್ಣು ಅಡಿಕೆ (ಚಾಲಿ) ಅಥವಾ ಎಳೆ ಅಡಿಕೆ (ಕೋಕ) ಕೊಯ್ಲು.',
        optimalWeather: 'Clear sky, Moderate temp',
        optimalWeatherKn: 'ಶುಭ್ರ ಆಕಾಶ, ಮಧ್ಯಮ ತಾಪಮಾನ'
      }
    ]
  },
  {
    crop: 'Tomato',
    cropKn: 'ಟೊಮೆಟೊ',
    cropType: 'Vegetable',
    location: 'Southern Karnataka',
    stages: [
      {
        stage: 'Sowing/Kharif',
        stageKn: 'ಬಿತ್ತನೆ (ಮುಂಗಾರು)',
        months: ['June', 'July'],
        description: 'Direct sowing or nursery raising for Kharif season.',
        descriptionKn: 'ಮುಂಗಾರು ಹಂಗಾಮಿಗೆ ನೇರ ಬಿತ್ತನೆ ಅಥವಾ ನೇಜಿ ಬೆಳೆಸುವುದು.',
        optimalWeather: 'Humid, 20-25°C',
        optimalWeatherKn: 'ಆರ್ದ್ರತೆ, 20-25°C'
      },
      {
        stage: 'Fruiting',
        stageKn: 'ಕಾಯಿ ಬಿಡುವ ಹಂತ',
        months: ['August', 'September'],
        description: 'Flowering and development of green tomatoes.',
        descriptionKn: 'ಹೂಬಿಡುವಿಕೆ ಮತ್ತು ಹಸಿರು ಟೊಮೆಟೊಗಳ ಅಭಿವೃದ್ಧಿ.',
        optimalWeather: 'Occasional rain, Partial sun',
        optimalWeatherKn: 'ಮಧ್ಯಂತರ ಮಳೆ, ಅಲ್ಪ ಬಿಸಿಲು'
      },
      {
        stage: 'Harvesting',
        stageKn: 'ಕೊಯ್ಲು',
        months: ['September', 'October', 'November'],
        description: 'Picking ripe red tomatoes in multiple rounds.',
        descriptionKn: 'ಹಲವು ಹಂತಗಳಲ್ಲಿ ಹಣ್ಣಾದ ಕೆಂಪು ಟೊಮೆಟೊಗಳ ಕೊಯ್ಲು.',
        optimalWeather: 'Cool nights, Sunny days',
        optimalWeatherKn: 'ತಂಪಾದ ರಾತ್ರಿಗಳು, ಬಿಸಿಲಿನ ದಿನಗಳು'
      }
    ]
  },
  {
    crop: 'Ragi',
    cropKn: 'ರಾಗಿ',
    cropType: 'Cereal',
    location: 'All Karnataka',
    stages: [
      {
        stage: 'Sowing',
        stageKn: 'ಬಿತ್ತನೆ',
        months: ['July', 'August'],
        description: 'Broadcasting or line sowing with early rains.',
        descriptionKn: 'ಮುಂಗಾರು ಮಳೆಯೊಂದಿಗೆ ಚೆಲ್ಲುವ ಅಥವಾ ಸಾಲು ಬಿತ್ತನೆ.',
        optimalWeather: 'Moderate rain',
        optimalWeatherKn: 'ಮಧ್ಯಮ ಮಳೆ'
      },
      {
        stage: 'Maturity',
        stageKn: 'ಪಕ್ವತೆ ಹಂತ',
        months: ['October', 'November'],
        description: 'Formation of grain and drying of ear heads.',
        descriptionKn: 'ಕಾಳು ಕಟ್ಟುವಿಕೆ ಮತ್ತು ರಾಗಿ ತೆನೆಗಳು ಒಣಗುವುದು.',
        optimalWeather: 'Low humidity, Sunny',
        optimalWeatherKn: 'ಕಡಿಮೆ ಆರ್ದ್ರತೆ, ಬಿಸಿಲು'
      },
      {
        stage: 'Harvesting',
        stageKn: 'ಕೊಯ್ಲು',
        months: ['November', 'December'],
        description: 'Cutting the ear heads and threshing.',
        descriptionKn: 'ರಾಗಿ ತೆನೆಗಳನ್ನು ಕುಯ್ಯುವುದು ಮತ್ತು ಒಕ್ಕಣೆ ಮಾಡುವುದು.',
        optimalWeather: 'Dry, Breezy',
        optimalWeatherKn: 'ವಿಪರೀತ ಗಾಳಿ ಇಲ್ಲದ ಒಣ ಹವೆ'
      }
    ]
  }
];
