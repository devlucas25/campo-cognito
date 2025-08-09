import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation(enableHighAccuracy: boolean = true) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const geoError: GeolocationError = {
        code: 0,
        message: 'Geolocalização não é suportada neste dispositivo'
      };
      setError(geoError);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLocation(locationData);
        setLoading(false);

        // Show accuracy warning if GPS is not precise enough
        if (position.coords.accuracy > 50) {
          toast({
            variant: "destructive",
            title: "GPS Impreciso",
            description: `Precisão: ±${Math.round(position.coords.accuracy)}m. Tente se mover para área aberta.`,
          });
        }
      },
      (error) => {
        const geoError: GeolocationError = {
          code: error.code,
          message: getErrorMessage(error.code)
        };
        
        setError(geoError);
        setLoading(false);
        
        toast({
          variant: "destructive",
          title: "Erro de GPS",
          description: geoError.message,
        });
      },
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  }, [enableHighAccuracy, toast]);

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Permissão de localização negada. Permita o acesso ao GPS nas configurações.';
      case 2:
        return 'Localização indisponível. Verifique se o GPS está ativado.';
      case 3:
        return 'Tempo limite excedido. Tente novamente.';
      default:
        return 'Erro desconhecido ao obter localização.';
    }
  };

  // Auto-get location on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Watch position for continuous updates
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return null;

    return navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(locationData);
      },
      (error) => {
        const geoError: GeolocationError = {
          code: error.code,
          message: getErrorMessage(error.code)
        };
        setError(geoError);
      },
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [enableHighAccuracy]);

  const formatLocation = useCallback((loc: LocationData | null) => {
    if (!loc) return 'Localização não disponível';
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  }, []);

  const getAccuracyText = useCallback((loc: LocationData | null) => {
    if (!loc) return '';
    return `±${Math.round(loc.accuracy)}m`;
  }, []);

  const isAccurate = useCallback((threshold: number = 50) => {
    return location ? location.accuracy <= threshold : false;
  }, [location]);

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    watchPosition,
    formatLocation,
    getAccuracyText,
    isAccurate,
    hasLocation: !!location
  };
}