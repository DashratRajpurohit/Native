import { File, Paths } from 'expo-file-system';

export type AppSettings = {
  customCameraSound: boolean;
};

const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: AppSettings = {
  customCameraSound: false,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const file = new File(Paths.document, SETTINGS_FILE);
    if (!file.exists) return DEFAULT_SETTINGS;
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.warn('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const current = await loadSettings();
    const updated: AppSettings = {
      ...current,
      ...settings,
    };
    const file = new File(Paths.document, SETTINGS_FILE);
    if (!file.exists) {
      file.create();
    }
    await file.write(JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}
