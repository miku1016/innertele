import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';

interface UseLocationResult {
  coordinate: Coordinate | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** デバイスの現在位置を取得するフック */
export function useLocation(): UseLocationResult {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('位置情報の権限が拒否されました');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoordinate({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      setError('位置情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { coordinate, isLoading, error, refresh };
}
