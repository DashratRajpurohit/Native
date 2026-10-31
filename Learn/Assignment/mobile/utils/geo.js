export function formatCoordinates(latitude, longitude, digits = 5) {
  return `${latitude.toFixed(digits)}, ${longitude.toFixed(digits)}`;
}

export function formatAddress(address) {
  if (!address) return null;
  const parts = [
    address.name,
    address.streetNumber,
    address.street,
    address.district,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ') || null;
}

export function haversineDistance(a, b) {
  const R = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters) {
  if (meters < 250) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function compassLabel(degrees) {
  if (degrees == null) return '–';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return `${directions[index]} ${Math.round(degrees)}°`;
}

export function openGoogleMaps(latitude, longitude, label = '') {
  const query = encodeURIComponent(`${latitude},${longitude}`);
  if (label) {
    return `https://www.google.com/maps/dir/?api=1&destination=${query}&destination_plain=${encodeURIComponent(label)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function formatFileSize(bytes) {
  if (bytes == null) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}