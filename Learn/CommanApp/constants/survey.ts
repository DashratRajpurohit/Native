import { File, Paths } from 'expo-file-system';

export type Priority = 'Low' | 'Medium' | 'High';

export type Survey = {
  id: string;
  siteName: string;
  clientName: string;
  description: string;
  priority: Priority;
  date: string;
  photo: string | null;
  contact: string;
  latitude: number | null;
  longitude: number | null;
  notes: string;
  createdAt: string;
  status?: 'completed' | 'pending';
};

const STORAGE = 'surveys.json';

export async function loadSurveys(): Promise<Survey[]> {
  try {
    const file = new File(Paths.document, STORAGE);
    if (!file.exists) return [];
    const text = await file.text();
    const parsed = JSON.parse(text) as Survey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Error loading surveys from file:', error);
    return [];
  }
}

export async function saveSurvey(survey: Survey): Promise<void> {
  try {
    const all = await loadSurveys();
    const existingIndex = all.findIndex((s) => s.id === survey.id);
    if (existingIndex >= 0) {
      all[existingIndex] = { ...survey };
    } else {
      all.push({ ...survey, status: survey.status ?? 'completed' });
    }
    const file = new File(Paths.document, STORAGE);
    if (!file.exists) {
      file.create();
    }
    await file.write(JSON.stringify(all, null, 2));
  } catch (error) {
    console.error('Error saving survey:', error);
    throw error;
  }
}

export async function deleteSurvey(id: string): Promise<void> {
  try {
    const all = await loadSurveys();
    const filtered = all.filter((s) => s.id !== id);
    const file = new File(Paths.document, STORAGE);
    if (!file.exists) {
      file.create();
    }
    await file.write(JSON.stringify(filtered, null, 2));
  } catch (error) {
    console.error('Error deleting survey:', error);
    throw error;
  }
}

export function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRV-${new Date().getFullYear()}-${rand}`;
}
