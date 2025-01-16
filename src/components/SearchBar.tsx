'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (location: string) => void;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fechar sugestões quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=5&countrycodes=br`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar sugestões');
      
      const data = await response.json();
      setSuggestions(data.filter((item: Suggestion) => 
        item.address.city || item.address.town
      ));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    // Debounce para evitar muitas requisições
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const city = suggestion.address.city || suggestion.address.town || '';
    const state = suggestion.address.state || '';
    const locationString = `${city}, ${state}, Brasil`;
    
    setLocation(locationString);
    setShowSuggestions(false);
    onSearch(locationString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location);
    }
  };

  const getCurrentLocation = async () => {
    setGeoError(null);
    setIsGeoLoading(true);

    if (!navigator.geolocation) {
      setGeoError('Seu navegador não suporta geolocalização');
      setIsGeoLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Usando a API do Nominatim (OpenStreetMap) para fazer a geocodificação reversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (!response.ok) throw new Error('Erro ao buscar localização');

      const data = await response.json();
      
      // Extraindo a cidade e estado
      const city = data.address.city || 
                  data.address.town || 
                  data.address.village || 
                  data.address.municipality;
      
      const state = data.address.state;

      if (city && state) {
        const locationString = `${city}, ${state}, Brasil`;
        setLocation(locationString);
        onSearch(locationString);
      } else {
        throw new Error('Não foi possível determinar sua localização');
      }

    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Permissão de localização negada');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Informações de localização indisponíveis');
            break;
          case error.TIMEOUT:
            setGeoError('Tempo de requisição de localização expirou');
            break;
          default:
            setGeoError('Erro ao obter localização');
        }
      } else {
        setGeoError('Erro ao determinar sua localização');
      }
    } finally {
      setIsGeoLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative" ref={suggestionsRef}>
        <form onSubmit={handleSubmit} className="relative">
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#808080]" 
            size={20} 
          />
          <input
            type="text"
            value={location}
            onChange={handleInputChange}
            onFocus={() => location.length >= 3 && setShowSuggestions(true)}
            placeholder="Digite o nome da cidade..."
            className="w-full px-4 py-3 pl-12 bg-[#1a1a1a] text-white rounded-lg
            border-none focus:outline-none focus:ring-1 focus:ring-[#303030]
            placeholder:text-[#808080]"
          />
        </form>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute w-full mt-2 bg-[#1a1a1a] rounded-lg shadow-lg 
              border border-[#303030] overflow-hidden z-50"
            >
              {suggestions.map((suggestion) => {
                const city = suggestion.address.city || suggestion.address.town || '';
                const state = suggestion.address.state || '';
                if (!city || !state) return null;
                
                return (
                  <button
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-[#252525] 
                    transition-colors text-white flex items-center gap-2"
                  >
                    <MapPin size={16} className="text-[#808080]" />
                    <div>
                      <p className="text-sm">{city}</p>
                      <p className="text-xs text-[#808080]">{state}, Brasil</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={getCurrentLocation}
        disabled={isGeoLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3
        bg-[#1a1a1a] text-[#808080] rounded-lg
        hover:bg-[#252525] transition-colors
        ${isGeoLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <MapPin size={20} />
        {isGeoLoading ? 'Obtendo localização...' : 'Use minha localização atual'}
      </button>

      {geoError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm"
        >
          {geoError}
        </motion.p>
      )}
    </div>
  );
} 