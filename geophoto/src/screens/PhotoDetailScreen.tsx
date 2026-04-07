import React, { useCallback } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import { ExifPanel } from '../components/ExifPanel';
import { usePhotoStore } from '../store/photoStore';
import { RootStackParamList } from '../types';
import { formatCoordinate } from '../utils/coordinates';

type DetailRouteProp = RouteProp<RootStackParamList, 'PhotoDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** 写真詳細画面: 大きな写真表示 + 地図 + EXIF情報 */
export function PhotoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { photoId } = route.params;

  const getPhotoById = usePhotoStore((s) => s.getPhotoById);
  const removePhoto = usePhotoStore((s) => s.removePhoto);
  const photo = getPhotoById(photoId);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      '写真を削除',
      'この写真をGeoPhotoアルバムから削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await MediaLibrary.deleteAssetsAsync([photoId]);
            } catch {
              // アセット削除が失敗してもストアからは削除する
            }
            removePhoto(photoId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [photoId, removePhoto, navigation]);

  if (!photo) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>写真が見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 写真 */}
      <Image
        source={{ uri: photo.uri }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* 撮影日時と削除ボタン */}
      <View style={styles.metaRow}>
        <Text style={styles.dateText}>
          {photo.capturedAt.toLocaleString('ja-JP')}
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>削除</Text>
        </TouchableOpacity>
      </View>

      {/* 地図 */}
      {photo.coordinate ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: photo.coordinate.latitude,
              longitude: photo.coordinate.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={photo.coordinate} />
          </MapView>
          <View style={styles.coordBadge}>
            <Text style={styles.coordText}>
              {formatCoordinate(
                photo.coordinate.latitude,
                photo.coordinate.longitude
              )}
            </Text>
            {photo.exifSource === 'device-gps' && (
              <Text style={styles.sourceText}>※ デバイスGPSより取得</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noMapContainer}>
          <Text style={styles.noMapText}>位置情報がありません</Text>
        </View>
      )}

      {/* EXIFパネル */}
      <ExifPanel photo={photo} />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingBottom: 16,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    color: '#aaaacc',
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(220,50,50,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3232',
  },
  deleteText: {
    color: '#dc3232',
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 220,
  },
  coordBadge: {
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  coordText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
  },
  sourceText: {
    color: '#aaaacc',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  noMapContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    height: 100,
    backgroundColor: '#16213e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMapText: {
    color: '#aaaacc',
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  notFoundText: {
    color: '#aaaacc',
    fontSize: 16,
  },
});
