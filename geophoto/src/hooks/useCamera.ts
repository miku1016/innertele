import { useRef, useState, useCallback } from 'react';
import { CameraView, CameraType } from 'expo-camera';

interface UseCameraResult {
  cameraRef: React.RefObject<CameraView>;
  facing: CameraType;
  toggleFacing: () => void;
  takePicture: () => Promise<string | null>;
  isCapturing: boolean;
}

/** カメラ操作を管理するフック */
export function useCamera(): UseCameraResult {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || isCapturing) return null;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
        skipProcessing: false,
      });
      return photo?.uri ?? null;
    } catch (error) {
      console.error('Failed to take picture:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  return { cameraRef, facing, toggleFacing, takePicture, isCapturing };
}
