export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ExifData {
  coordinate: Coordinate | null;
  altitude: number | null;
  capturedAt: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
  source: 'exif' | 'device-gps' | 'none';
}

export interface PhotoRecord {
  id: string;
  uri: string;
  thumbnailUri?: string;
  coordinate: Coordinate | null;
  altitude: number | null;
  capturedAt: Date;
  exifSource: 'exif' | 'device-gps' | 'none';
  cameraMake: string | null;
  cameraModel: string | null;
}

export type RootStackParamList = {
  Main: undefined;
  PhotoDetail: { photoId: string };
};

export type TabParamList = {
  Camera: undefined;
  Map: undefined;
  Gallery: undefined;
};
