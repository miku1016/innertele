import { useState, useCallback } from 'react';
import { extractExif } from '../services/exifService';
import { getCurrentLocation } from '../services/locationService';
import { ExifData } from '../types';

interface UseExifResult {
  isLoading: boolean;
  error: string | null;
  processImage: (uri: string) => Promise<ExifData>;
}

/**
 * 画像URIからEXIFデータを取得するフック。
 * EXIF内にGPS情報がない場合はデバイスの現在位置でフォールバックする。
 */
export function useExif(): UseExifResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (uri: string): Promise<ExifData> => {
    setIsLoading(true);
    setError(null);

    try {
      const exifData = await extractExif(uri);

      // GPS情報がない場合はデバイスの現在位置を使用する
      if (!exifData.coordinate) {
        const deviceLocation = await getCurrentLocation();
        if (deviceLocation) {
          return {
            ...exifData,
            coordinate: deviceLocation,
            source: 'device-gps',
          };
        }
      }

      return exifData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'EXIF処理に失敗しました';
      setError(message);
      return {
        coordinate: null,
        altitude: null,
        capturedAt: null,
        cameraMake: null,
        cameraModel: null,
        source: 'none',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, processImage };
}
