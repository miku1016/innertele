import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';

export interface PermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
  location: boolean;
}

/** カメラとメディアライブラリの権限を一括リクエストする（必須権限） */
export async function requestRequiredPermissions(): Promise<{
  camera: boolean;
  mediaLibrary: boolean;
}> {
  const [cameraResult, mediaResult] = await Promise.all([
    Camera.requestCameraPermissionsAsync(),
    MediaLibrary.requestPermissionsAsync(),
  ]);

  return {
    camera: cameraResult.status === 'granted',
    mediaLibrary: mediaResult.status === 'granted',
  };
}

/** 位置情報権限をリクエストする（任意権限） */
export async function requestLocationPermission(): Promise<boolean> {
  const result = await Location.requestForegroundPermissionsAsync();
  return result.status === 'granted';
}

/** 現在の権限状態を確認する */
export async function checkPermissions(): Promise<PermissionStatus> {
  const [cameraResult, mediaResult, locationResult] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    MediaLibrary.getPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
  ]);

  return {
    camera: cameraResult.status === 'granted',
    mediaLibrary: mediaResult.status === 'granted',
    location: locationResult.status === 'granted',
  };
}
