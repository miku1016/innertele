import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoRecord } from '../types';

const STORAGE_KEY = 'geophoto_records';

/** PhotoRecordの配列をAsyncStorageに保存する */
export async function saveRecords(records: PhotoRecord[]): Promise<void> {
  try {
    const json = JSON.stringify(
      records.map((r) => ({
        ...r,
        capturedAt: r.capturedAt.toISOString(),
      }))
    );
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.warn('Failed to save records:', error);
  }
}

/** AsyncStorageからPhotoRecordの配列を読み込む */
export async function loadRecords(): Promise<PhotoRecord[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    const parsed = JSON.parse(json) as Array<
      Omit<PhotoRecord, 'capturedAt'> & { capturedAt: string }
    >;

    return parsed.map((r) => ({
      ...r,
      capturedAt: new Date(r.capturedAt),
    }));
  } catch (error) {
    console.warn('Failed to load records:', error);
    return [];
  }
}

/** 特定のIDのレコードを削除する */
export async function deleteRecord(id: string): Promise<void> {
  const records = await loadRecords();
  const updated = records.filter((r) => r.id !== id);
  await saveRecords(updated);
}
