import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoRecord } from '../types';

interface PhotoStore {
  photos: PhotoRecord[];
  addPhoto: (photo: PhotoRecord) => void;
  removePhoto: (id: string) => void;
  loadPhotos: (photos: PhotoRecord[]) => void;
  getPhotoById: (id: string) => PhotoRecord | undefined;
}

export const usePhotoStore = create<PhotoStore>()(
  persist(
    (set, get) => ({
      photos: [],

      addPhoto: (photo) =>
        set((state) => ({
          photos: [photo, ...state.photos],
        })),

      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      loadPhotos: (photos) =>
        set(() => ({
          photos,
        })),

      getPhotoById: (id) => get().photos.find((p) => p.id === id),
    }),
    {
      name: 'geophoto-store',
      storage: createJSONStorage(() => AsyncStorage),
      // DateオブジェクトのシリアライズはISO文字列で行う
      partialize: (state) => ({
        photos: state.photos.map((p) => ({
          ...p,
          capturedAt: p.capturedAt instanceof Date
            ? p.capturedAt.toISOString()
            : p.capturedAt,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ISO文字列からDateオブジェクトに復元する
          state.photos = state.photos.map((p: PhotoRecord & { capturedAt: string | Date }) => ({
            ...p,
            capturedAt:
              typeof p.capturedAt === 'string'
                ? new Date(p.capturedAt)
                : p.capturedAt,
          }));
        }
      },
    }
  )
);
