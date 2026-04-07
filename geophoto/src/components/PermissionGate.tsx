import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { requestRequiredPermissions } from '../utils/permissions';

interface Props {
  children: React.ReactNode;
}

/**
 * カメラとメディアライブラリの権限を確認し、
 * 未付与の場合はリクエスト画面を表示するコンポーネント。
 */
export function PermissionGate({ children }: Props) {
  const [status, setStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  const requestPermissions = async () => {
    setStatus('loading');
    const { camera, mediaLibrary } = await requestRequiredPermissions();
    setStatus(camera && mediaLibrary ? 'granted' : 'denied');
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a90d9" />
        <Text style={styles.message}>権限を確認中...</Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>権限が必要です</Text>
        <Text style={styles.message}>
          GeoPhotoはカメラと写真ライブラリへのアクセス権限が必要です。
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>権限を許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#aaaacc',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
