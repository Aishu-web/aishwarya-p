import React, { useState } from 'react';
import { CROP_CALENDAR, CropCalendarEntry } from '../constants/cropCalendar';
import { Language } from '../types';

interface CropCalendarProps {
  language: Language;
}

export const CropCalendar: React.FC<CropCalendarProps> = ({ language }) => {
  const [selectedCropType, setSelectedCropType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  
  const filteredCrops = CROP_CALENDAR.filter(c => 
    (selectedCropType === 'All' || c.cropType === selectedCropType) &&
    (selectedLocation === 'All' || c.location === selectedLocation)
  );

  const [selectedCrop, setSelectedCrop] = useState<CropCalendarEntry>(filteredCrops[0] || CROP_CALENDAR[0]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-black text-zinc-900">
        {language === 'kn' ? 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್' : 'Crop Calendar'}
      </h2>
      
      <div className="flex gap-2">
        <select 
          value={selectedCropType}
          onChange={(e) => {
            setSelectedCropType(e.target.value);
            setSelectedCrop(CROP_CALENDAR.find(c => c.cropType === e.target.value) || filteredCrops[0] || CROP_CALENDAR[0]);
          }}
          className="p-2 bg-white border border-zinc-200 rounded-lg text-sm flex-1"
        >
          <option value="All">{language === 'kn' ? 'ಎಲ್ಲಾ ವಿಧಗಳು' : 'All Types'}</option>
          {Array.from(new Set(CROP_CALENDAR.map(c => c.cropType))).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setSelectedCrop(CROP_CALENDAR.find(c => c.location === e.target.value) || filteredCrops[0] || CROP_CALENDAR[0]);
          }}
          className="p-2 bg-white border border-zinc-200 rounded-lg text-sm flex-1"
        >
          <option value="All">{language === 'kn' ? 'ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು' : 'All Locations'}</option>
          {Array.from(new Set(CROP_CALENDAR.map(c => c.location))).map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <select 
        value={selectedCrop.crop}
        onChange={(e) => setSelectedCrop(CROP_CALENDAR.find(c => c.crop === e.target.value) || filteredCrops[0] || CROP_CALENDAR[0])}
        className="w-full p-3 bg-white border border-zinc-200 rounded-xl"
      >
        {filteredCrops.map(c => (
          <option key={c.crop} value={c.crop}>
            {language === 'kn' ? c.cropKn : c.crop}
          </option>
        ))}
      </select>
      <div className="space-y-4">
        {selectedCrop.stages.map((stage, idx) => (
          <div key={idx} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <h4 className="font-bold text-emerald-900">{language === 'kn' ? stage.stageKn : stage.stage}</h4>
            <p className="text-sm text-zinc-600 mt-1">{language === 'kn' ? stage.descriptionKn : stage.description}</p>
            <div className="text-xs text-emerald-600 font-bold mt-2">
              {language === 'kn' ? 'ಹವಾಮಾನ: ' : 'Weather: '}
              {language === 'kn' ? stage.optimalWeatherKn : stage.optimalWeather}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
