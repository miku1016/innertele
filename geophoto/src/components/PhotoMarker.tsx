import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { PhotoRecord } from '../types';

interface Props {
  photo: PhotoRecord;
  onPress: (id: string) => void;
}

/** 地図上に写真サムネイルを表示するマーカーコンポーネント */
export function PhotoMarker({ photo, onPress }: Props) {
  if (!photo.coordinate) return null;

  return (
    <Marker
      key={photo.id}
      coordinate={photo.coordinate}
      onCalloutPress={() => onPress(photo.id)}
    >
      <View style={styles.markerContainer}>
        <Image
          source={{ uri: photo.thumbnailUri ?? photo.uri }}
          style={styles.thumbnail}
        />
      </View>
      <Callout tooltip>
        <View style={styles.callout}>
          <Image
            source={{ uri: photo.thumbnailUri ?? photo.uri }}
            style={styles.calloutImage}
          />
          <View style={styles.calloutTextContainer}>
            <Image
              source={{ uri: photo.thumbnailUri ?? photo.uri }}
              style={{ width: 0, height: 0 }}
            />
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#4a90d9',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  callout: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#4a90d9',
    elevation: 6,
  },
  calloutImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  calloutTextContainer: {
    padding: 4,
  },
});
