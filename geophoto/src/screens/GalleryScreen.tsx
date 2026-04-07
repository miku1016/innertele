import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePhotoStore } from '../store/photoStore';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';
import { useExif } from '../hooks/useExif';
import { PhotoRecord, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const COLUMN = 3;
const ITEM_SIZE = (Dimensions.get('window').width - 4) / COLUMN;

/** ギャラリー画面: 保存済み写真のグリッド表示 */
export function GalleryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const photos = usePhotoStore((s) => s.photos);
  const loadPhotos = usePhotoStore((s) => s.loadPhotos);
  const addPhoto = usePhotoStore((s) => s.addPhoto);
  const { loadAlbumAssets } = usePhotoLibrary();
  const { processImage } = useExif();
  const [refreshing, setRefreshing] = React.useState(false);

  const syncFromAlbum = useCallback(async () => {
    setRefreshing(true);
    try {
      const assets = await loadAlbumAssets();
      const existingIds = new Set(photos.map((p) => p.id));

      // ストアにまだない写真のみ追加する
      for (const asset of assets) {
        if (!existingIds.has(asset.id)) {
          const exifData = await processImage(asset.uri);
          const record: PhotoRecord = {
            id: asset.id,
            uri: asset.uri,
            coordinate: exifData.coordinate,
            altitude: exifData.altitude,
            capturedAt: exifData.capturedAt ?? new Date(asset.creationTime ?? Date.now()),
            exifSource: exifData.source,
            cameraMake: exifData.cameraMake,
            cameraModel: exifData.cameraModel,
          };
          addPhoto(record);
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadAlbumAssets, processImage, photos, addPhoto]);

  useEffect(() => {
    syncFromAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }: { item: PhotoRecord }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('PhotoDetail', { photoId: item.id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
      {item.coordinate && (
        <View style={styles.pinBadge}>
          <Text style={styles.pinIcon}>📍</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {photos.length === 0 && !refreshing ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            まだ写真がありません{'\n'}カメラで撮影してみましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={COLUMN}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={syncFromAlbum}
              tintColor="#4a90d9"
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  list: {
    gap: 2,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginHorizontal: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pinBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
  },
  pinIcon: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaaacc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
});
