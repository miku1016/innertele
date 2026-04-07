import * as FileSystem from 'expo-file-system';
import ExifReader from 'exifreader';
import { dmsToDecimal } from '../utils/coordinates';
import { ExifData } from '../types';

/** base64文字列をArrayBufferに変換する */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/** 画像ファイルのURIからEXIFデータを抽出する */
export async function extractExif(uri: string): Promise<ExifData> {
  try {
    // ファイルをbase64として読み込む
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const buffer = base64ToArrayBuffer(base64);
    const tags = ExifReader.load(buffer, { expanded: true });

    let coordinate = null;
    let altitude: number | null = null;
    let capturedAt: Date | null = null;
    let cameraMake: string | null = null;
    let cameraModel: string | null = null;

    // GPS座標の取得
    const gps = tags.gps;
    if (gps) {
      const lat = gps['GPSLatitude'];
      const latRef = gps['GPSLatitudeRef'];
      const lon = gps['GPSLongitude'];
      const lonRef = gps['GPSLongitudeRef'];

      if (lat && latRef && lon && lonRef) {
        // ExifReaderのGPSタグは配列形式 [degrees, minutes, seconds]
        const latValue = Array.isArray(lat)
          ? dmsRawToDecimal(lat, String(latRef))
          : null;
        const lonValue = Array.isArray(lon)
          ? dmsRawToDecimal(lon, String(lonRef))
          : null;

        if (latValue !== null && lonValue !== null) {
          coordinate = { latitude: latValue, longitude: lonValue };
        }
      }

      const altTag = gps['GPSAltitude'];
      if (altTag !== undefined) {
        const altNum = Number(altTag);
        if (!isNaN(altNum)) {
          altitude = altNum;
        }
      }
    }

    // 撮影日時の取得
    const exif = tags.exif;
    if (exif) {
      const dateTimeTag = exif['DateTimeOriginal'];
      if (dateTimeTag) {
        const dateStr = String(dateTimeTag.description || dateTimeTag);
        // EXIF日時形式: "YYYY:MM:DD HH:MM:SS"
        const parsed = parseExifDate(dateStr);
        if (parsed) capturedAt = parsed;
      }

      const makeTag = exif['Make'];
      if (makeTag) cameraMake = String(makeTag.description || makeTag);

      const modelTag = exif['Model'];
      if (modelTag) cameraModel = String(modelTag.description || modelTag);
    }

    return {
      coordinate,
      altitude,
      capturedAt,
      cameraMake,
      cameraModel,
      source: coordinate ? 'exif' : 'none',
    };
  } catch (error) {
    console.warn('EXIF extraction failed:', error);
    return {
      coordinate: null,
      altitude: null,
      capturedAt: null,
      cameraMake: null,
      cameraModel: null,
      source: 'none',
    };
  }
}

/** ExifReaderが返すGPS配列 [degrees, minutes, seconds] を十進数に変換する */
function dmsRawToDecimal(
  dms: number[],
  ref: string
): number | null {
  if (!Array.isArray(dms) || dms.length < 3) return null;
  const [degrees, minutes, seconds] = dms;
  if (
    typeof degrees !== 'number' ||
    typeof minutes !== 'number' ||
    typeof seconds !== 'number'
  ) {
    return null;
  }
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') decimal = -decimal;
  return decimal;
}

/** EXIF日時文字列をDateオブジェクトに変換する */
function parseExifDate(dateStr: string): Date | null {
  // "YYYY:MM:DD HH:MM:SS" → "YYYY-MM-DD HH:MM:SS"
  const normalized = dateStr.replace(
    /^(\d{4}):(\d{2}):(\d{2})/,
    '$1-$2-$3'
  );
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}
