import { WeatherData, WeatherForecast } from '../types';

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// WMO Weather interpretation codes
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Sunny';
  if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
};

export const dataService = {
  async getCurrentWeather(lat: number, lng: number, locationName: string = 'Local Region'): Promise<WeatherData | null> {
    const cacheKey = `weather_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    
    // Check cache
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data as WeatherData;
    }

    try {
      // Build Open-Meteo endpoint url
      // We request current weather and daily forecast for 7 days
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data from Open-Meteo');
      }

      const data = await response.json();
      
      // Parse Daily forecasts
      const forecast: WeatherForecast[] = [];
      if (data.daily && data.daily.time) {
        for (let i = 0; i < data.daily.time.length; i++) {
          forecast.push({
            date: data.daily.time[i],
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            condition: getWeatherCondition(data.daily.weather_code[i]),
            precipitationMm: data.daily.precipitation_sum[i],
            precipitationProbability: data.daily.precipitation_probability_max[i]
          });
        }
      }

      const weatherData: WeatherData = {
        location: { lat, lng, name: locationName },
        current: {
          temperature: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          condition: getWeatherCondition(data.current.weather_code),
          windSpeed: Math.round(data.current.wind_speed_10m)
        },
        forecast,
        alerts: [] // Open-Meteo free doesn't provide standard alerts directly, would need another service or parsing
      };

      // Save to cache
      cache[cacheKey] = {
        data: weatherData,
        timestamp: Date.now()
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching Open-Meteo data:', error);
      return null;
    }
  },

  async getAgroclimatology(lat: number, lng: number): Promise<any> {
    const cacheKey = `agroclim_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION * 4) { // Cache NASA data longer (1 hour)
      return cache[cacheKey].data;
    }

    try {
      // NASA POWER Endpoint for Agroclimatology
      // Fetching past 30 days of daily data for point: PRECTOTCORR, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1); // Yesterday
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const formatString = (d: Date) => {
        return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      };
      
      const parameters = 'PRECTOTCORR,T2M_MAX,T2M_MIN,ALLSKY_SFC_SW_DWN'; // Precipitation, Temps, Solar Radiation
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=AG&longitude=${lng}&latitude=${lat}&start=${formatString(startDate)}&end=${formatString(endDate)}&format=JSON`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch from NASA POWER');
      }

      const data = await response.json();
      
      cache[cacheKey] = {
        data: data.properties.parameter,
        timestamp: Date.now()
      };

      return data.properties.parameter;
    } catch (error) {
      console.error('Error fetching NASA POWER data:', error);
      return null;
    }
  }
};
