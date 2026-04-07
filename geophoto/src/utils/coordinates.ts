interface Rational {
  numerator: number;
  denominator: number;
}

/** DMS（度分秒）形式の有理数配列を十進数に変換する */
export function dmsToDecimal(
  dms: Rational[],
  ref: string
): number {
  const degrees = dms[0].numerator / dms[0].denominator;
  const minutes = dms[1].numerator / dms[1].denominator;
  const seconds = dms[2].numerator / dms[2].denominator;

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

/** 緯度経度を読みやすい文字列に変換する */
export function formatCoordinate(
  latitude: number,
  longitude: number
): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  const lat = Math.abs(latitude).toFixed(6);
  const lon = Math.abs(longitude).toFixed(6);
  return `${lat}° ${latDir}, ${lon}° ${lonDir}`;
}
