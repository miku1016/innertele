import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCamera } from '../hooks/useCamera';
import { useExif } from '../hooks/useExif';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';
import { usePhotoStore } from '../store/photoStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** カメラ画面: 撮影→EXIF抽出→アルバム保存 */
export function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cameraRef, facing, toggleFacing, takePicture, isCapturing } = useCamera();
  const { processImage, isLoading: isProcessing } = useExif();
  const { savePhoto } = usePhotoLibrary();
  const addPhoto = usePhotoStore((s) => s.addPhoto);

  const isBusy = isCapturing || isProcessing;

  const handleCapture = useCallback(async () => {
    const uri = await takePicture();
    if (!uri) return;

    const exifData = await processImage(uri);

    const saved = await savePhoto(uri);
    if (!saved) {
      Alert.alert('保存エラー', '写真の保存に失敗しました。');
      return;
    }

    const record = {
      id: saved.assetId,
      uri: saved.assetUri,
      coordinate: exifData.coordinate,
      altitude: exifData.altitude,
      capturedAt: exifData.capturedAt ?? new Date(),
      exifSource: exifData.source,
      cameraMake: exifData.cameraMake,
      cameraModel: exifData.cameraModel,
    };

    addPhoto(record);
    navigation.navigate('PhotoDetail', { photoId: record.id });
  }, [takePicture, processImage, savePhoto, addPhoto, navigation]);

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* 上部ツールバー */}
        <View style={styles.topBar}>
          <Text style={styles.appName}>GeoPhoto</Text>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleFacing}
            disabled={isBusy}
          >
            <Text style={styles.flipIcon}>⇄</Text>
          </TouchableOpacity>
        </View>

        {/* シャッターボタン */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.shutterOuter, isBusy && styles.shutterDisabled]}
            onPress={handleCapture}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            {isBusy ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>

        {/* 処理中オーバーレイ */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#4a90d9" />
            <Text style={styles.processingText}>位置情報を取得中...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const SHUTTER_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    color: '#ffffff',
    fontSize: 22,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  shutterOuter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: SHUTTER_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: SHUTTER_SIZE - 20,
    height: SHUTTER_SIZE - 20,
    borderRadius: (SHUTTER_SIZE - 20) / 2,
    backgroundColor: '#ffffff',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
