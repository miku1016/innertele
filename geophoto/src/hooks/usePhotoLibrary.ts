import { useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';

const ALBUM_NAME = 'GeoPhoto';

interface SaveResult {
  assetId: string;
  assetUri: string;
}

interface UsePhotoLibraryResult {
  savePhoto: (uri: string) => Promise<SaveResult | null>;
  loadAlbumAssets: () => Promise<MediaLibrary.Asset[]>;
}

/**
 * 写真をGeoPhotoアルバムに保存し、アルバムの資産を読み込むフック。
 */
export function usePhotoLibrary(): UsePhotoLibraryResult {
  const savePhoto = useCallback(async (uri: string): Promise<SaveResult | null> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('MediaLibrary permission not granted');
        return null;
      }

      // 資産を作成する
      const asset = await MediaLibrary.createAssetAsync(uri);

      // アルバムを取得または作成する
      let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) {
        // 初回: アルバムを作成しながら資産を追加する
        await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
      } else {
        // 既存アルバムに資産を追加する
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return {
        assetId: asset.id,
        assetUri: asset.uri,
      };
    } catch (error) {
      console.error('Failed to save photo:', error);
      return null;
    }
  }, []);

  const loadAlbumAssets = useCallback(async (): Promise<MediaLibrary.Asset[]> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return [];

      const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) return [];

      const { assets } = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: MediaLibrary.MediaType.photo,
        first: 200,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      return assets;
    } catch (error) {
      console.error('Failed to load album:', error);
      return [];
    }
  }, []);

  return { savePhoto, loadAlbumAssets };
}
