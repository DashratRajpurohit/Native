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
};

const STORAGE = 'surveys.json';

export async function loadSurveys(): Promise<Survey[]> {
  const file = new File(Paths.documents, STORAGE);
  if (!file.exists) return [];
  const text = await file.text();
  try {
    return JSON.parse(text) as Survey[];
  } catch {
    return [];
  }
}

export async function saveSurvey(survey: Survey): Promise<void> {
  const all = await loadSurveys();
  all.push(survey);
  const file = new File(Paths.documents, STORAGE);
  file.create({ idempotent: true });
  await file.write(JSON.stringify(all, null, 2));
}

export async function deleteSurvey(id: string): Promise<void> {
  const all = await loadSurveys();
  const filtered = all.filter((s) => s.id !== id);
  const file = new File(Paths.documents, STORAGE);
  file.create({ idempotent: true });
  await file.write(JSON.stringify(filtered, null, 2));
}

export function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRV-${new Date().getFullYear()}-${rand}`;
}
