import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { PhotoRecord } from '../types';
import { formatCoordinate } from '../utils/coordinates';

interface Props {
  photo: PhotoRecord;
}

/** EXIF情報を折りたたみ可能なパネルで表示するコンポーネント */
export function ExifPanel({ photo }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const rows: { label: string; value: string }[] = [
    {
      label: '撮影日時',
      value: photo.capturedAt
        ? photo.capturedAt.toLocaleString('ja-JP')
        : '不明',
    },
    {
      label: '位置情報',
      value: photo.coordinate
        ? formatCoordinate(photo.coordinate.latitude, photo.coordinate.longitude)
        : 'なし',
    },
    {
      label: '位置情報ソース',
      value:
        photo.exifSource === 'exif'
          ? 'EXIF'
          : photo.exifSource === 'device-gps'
          ? 'デバイスGPS'
          : 'なし',
    },
    {
      label: '高度',
      value: photo.altitude !== null ? `${photo.altitude.toFixed(1)} m` : '不明',
    },
    {
      label: 'カメラメーカー',
      value: photo.cameraMake ?? '不明',
    },
    {
      label: 'カメラモデル',
      value: photo.cameraModel ?? '不明',
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.headerText}>EXIF情報</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    color: '#aaaacc',
    fontSize: 12,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a4e',
  },
  label: {
    color: '#aaaacc',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#ffffff',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
});
