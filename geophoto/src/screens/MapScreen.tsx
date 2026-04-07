import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PhotoMarker } from '../components/PhotoMarker';
import { usePhotoStore } from '../store/photoStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** 地図画面: 撮影済みの全写真のピンを地図上に表示する */
export function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const photos = usePhotoStore((s) => s.photos);

  // GPS座標を持つ写真のみフィルタリング
  const geoPhotos = useMemo(
    () => photos.filter((p) => p.coordinate !== null),
    [photos]
  );

  // 最初の写真の座標を初期中心点として使用する
  const initialRegion = useMemo(() => {
    if (geoPhotos.length === 0) {
      return {
        latitude: 35.6812362,
        longitude: 139.7671248,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return {
      latitude: geoPhotos[0].coordinate!.latitude,
      longitude: geoPhotos[0].coordinate!.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [geoPhotos]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {geoPhotos.map((photo) => (
          <PhotoMarker
            key={photo.id}
            photo={photo}
            onPress={(id) => navigation.navigate('PhotoDetail', { photoId: id })}
          />
        ))}
      </MapView>

      {geoPhotos.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>
            カメラで写真を撮影すると{'\n'}地図にピンが表示されます
          </Text>
        </View>
      )}

      <View style={styles.countBadge} pointerEvents="none">
        <Text style={styles.countText}>{geoPhotos.length} 枚</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,46,0.5)',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(74,144,217,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
