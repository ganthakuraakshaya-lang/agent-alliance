import fs from 'fs';
import path from 'path';
import { FIRReport } from '../src/types/fir';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'reports.json');

// Ensure data folder and file exist
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export class ReportStorage {
  private static readAll(): FIRReport[] {
    ensureDataFile();
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('Error reading reports file, returning empty array:', err);
      return [];
    }
  }

  private static writeAll(reports: FIRReport[]): boolean {
    ensureDataFile();
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing reports file:', err);
      return false;
    }
  }

  public static getAll(): FIRReport[] {
    const list = this.readAll();
    // Return newest first
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public static getById(id: string): FIRReport | null {
    const list = this.readAll();
    const found = list.find((r) => r.id === id);
    return found || null;
  }

  public static save(report: FIRReport): boolean {
    const list = this.readAll();
    const existingIndex = list.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      list[existingIndex] = report;
    } else {
      list.unshift(report);
    }
    return this.writeAll(list);
  }

  public static update(id: string, updates: Partial<FIRReport>): FIRReport | null {
    const list = this.readAll();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    this.writeAll(list);
    return list[index];
  }

  public static count(): number {
    return this.readAll().length;
  }
}
