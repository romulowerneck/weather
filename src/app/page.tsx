'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Loader2, Cloud, Wind, Droplets, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HourlyForecast {
  datetime: string;
  temp: number;
  conditions: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  conditions: string;
  hourlyForecast: HourlyForecast[];
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (location: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&include=current,hours&hours=24&key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&contentType=json&lang=pt`
      );

      if (!response.ok) {
        throw new Error('Localização não encontrada');
      }

      const data = await response.json();

      setWeather({
        location: data.resolvedAddress,
        temperature: Math.round(data.currentConditions.temp),
        windSpeed: Math.round(data.currentConditions.windspeed),
        precipitation: Math.round(data.currentConditions.precipprob || 0),
        humidity: Math.round(data.currentConditions.humidity || 0),
        conditions: data.currentConditions.conditions,
        hourlyForecast: data.days[0].hours.map((hour: { datetime: string; temp: number; conditions: string }) => ({
          datetime: hour.datetime,
          temp: Math.round(hour.temp),
          conditions: hour.conditions
        }))
      });
    } catch (error) {
      setError('Erro ao buscar dados meteorológicos');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (datetime: string) => {
    return datetime.split(':')[0] + ':00';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#001214] via-[#002428] to-[#003A40] 
    flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Cloud className="w-16 h-16 text-cyan-400/80 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Weather Forecast
          </h1>
          <p className="text-cyan-200/60 text-lg">
            Enter a city name to check the weather
          </p>
        </motion.div>

        <SearchBar onSearch={fetchWeatherData} />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex justify-center"
            >
              <Loader2 className="w-8 h-8 text-[#808080] animate-spin" />
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-red-500"
            >
              {error}
            </motion.div>
          )}

          {weather && !loading && !error && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 space-y-4"
            >
              <div className="bg-[#001a1c]/80 backdrop-blur-sm rounded-lg p-6 
              border border-[#00ffff10] shadow-lg ring-1 ring-[#00ffff05]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="text-[#808080] mt-1" size={20} />
                    <div className="text-left">
                      <h2 className="text-white text-xl">{weather.location}</h2>
                      <p className="text-[#808080]">{weather.conditions}</p>
                    </div>
                  </div>
                  <p className="text-5xl font-bold text-white">{weather.temperature}°C</p>
                </div>

                <div className="flex justify-end gap-6 mt-4">
                  <p className="text-[#808080] flex items-center gap-2">
                    <Wind size={16} />
                    Velocidade do vento: {weather.windSpeed} km/h
                  </p>
                  <p className="text-[#808080] flex items-center gap-2">
                    <Droplets size={16} />
                    Umidade: {weather.humidity}%
                  </p>
                  <p className="text-[#808080] flex items-center gap-2">
                    <Cloud size={16} />
                    Precipitação: {weather.precipitation}%
                  </p>
                </div>
              </div>

              <div className="bg-[#001a1c]/80 backdrop-blur-sm rounded-lg p-6 
              border border-[#00ffff10] shadow-lg ring-1 ring-[#00ffff05]">
                <h3 className="text-white text-xl mb-4 text-left">
                  Previsão de 24 horas
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {weather.hourlyForecast.map((hour) => (
                    <div
                      key={hour.datetime}
                      className="bg-[#252525] rounded-lg p-3 text-center min-w-[100px]"
                    >
                      <p className="text-[#808080]">{formatHour(hour.datetime)}</p>
                      <p className="text-white text-lg font-bold my-1">
                        {hour.temp}°C
                      </p>
                      <p className="text-[#808080] text-sm">
                        {hour.conditions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
