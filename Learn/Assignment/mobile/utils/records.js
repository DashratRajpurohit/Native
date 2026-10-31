import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const RECORDS_KEY = '@travelguardian/records';
const SETTINGS_KEY = '@travelguardian/settings';
const ADDRESS_CACHE_KEY = '@travelguardian/addressCache';
const LOCATIONS_KEY = '@travelguardian/locations';

function recordsDir() {
  return new Directory(Paths.document, 'records');
}

function ensureDir() {
  const dir = recordsDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export async function getRecords() {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAll(records) {
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export async function addRecord(record) {
  const records = await getRecords();
  records.unshift(record);
  await saveAll(records);
  return record;
}

export async function updateRecord(recordId, patch) {
  const records = await getRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) return null;
  records[index] = { ...records[index], ...patch };
  await saveAll(records);
  return records[index];
}

export async function deleteRecord(recordId) {
  const records = await getRecords();
  const record = records.find((r) => r.id === recordId);
  const next = records.filter((r) => r.id !== recordId);
  await saveAll(next);
  if (record) {
    try {
      const file = new File(record.uri);
      if (file.exists) file.delete();
    } catch {
      // ignore file delete errors
    }
  }
}

export async function saveMediaFile(id, sourceUri, extension) {
  const dir = ensureDir();
  const ext = extension || 'jpg';
  const dest = new File(dir, `${id}.${ext}`);
  try {
    const source = new File(sourceUri);
    source.copy(dest);
    return dest;
  } catch {
    return null;
  }
}

export async function exportRecordsAsJson() {
  const records = await getRecords();
  const json = JSON.stringify(records, null, 2);
  const dir = new Directory(Paths.cache, 'exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const file = new File(dir, `travel-journal-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(json);
  return file.uri;
}

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return {
      gridOverlay: false,
      cameraSound: true,
      selfTimer: 0,
      smartCapture: false,
      ...(raw ? JSON.parse(raw) : {}),
    };
  } catch {
    return { gridOverlay: false, cameraSound: true, selfTimer: 0, smartCapture: false };
  }
}

export async function updateSettings(patch) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function addressCacheKey(latitude, longitude) {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

export async function getCachedAddress(latitude, longitude) {
  try {
    const raw = await AsyncStorage.getItem(ADDRESS_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    return cache[addressCacheKey(latitude, longitude)] || null;
  } catch {
    return null;
  }
}

export async function cacheAddress(latitude, longitude, address) {
  try {
    const raw = await AsyncStorage.getItem(ADDRESS_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[addressCacheKey(latitude, longitude)] = address;
    await AsyncStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore cache errors
  }
}

export async function getLocations() {
  try {
    const raw = await AsyncStorage.getItem(LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addLocation(location) {
  const locations = await getLocations();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address || null,
    accuracy: location.accuracy == null ? null : Math.round(location.accuracy),
    timestamp: Date.now(),
  };
  const next = [entry, ...locations].slice(0, 20);
  await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(next));
  return entry;
}