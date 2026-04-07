import * as Location from 'expo-location';
import { Coordinate } from '../types';

/** 現在の位置情報を取得する（EXIFにGPSがない場合のフォールバック） */
export async function getCurrentLocation(): Promise<Coordinate | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn('Location fetch failed:', error);
    return null;
  }
}

/** 座標から住所（リバースジオコーディング）を取得する */
export async function reverseGeocode(
  coordinate: Coordinate
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync(coordinate);
    if (results.length === 0) return null;

    const addr = results[0];
    const parts = [
      addr.country,
      addr.region,
      addr.city,
      addr.district,
      addr.street,
      addr.streetNumber,
    ].filter(Boolean);

    return parts.join(' ') || null;
  } catch (error) {
    console.warn('Reverse geocode failed:', error);
    return null;
  }
}
