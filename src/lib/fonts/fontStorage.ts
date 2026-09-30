import { FontProject } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from './defaultFont';

const DB_NAME = 'GlyphWorks_DB_v2';
const DB_VERSION = 1;
const STORE_NAME = 'font_projects';

// In-memory cache for ultra-fast, synchronous access and 60fps UI rendering
let projectsCache: FontProject[] = [];
let isInitialized = false;
let initPromise: Promise<FontProject[]> | null = null;

// Subscribers for storage changes
const subscribers = new Set<(projects: FontProject[]) => void>();

function notifySubscribers() {
  const current = [...projectsCache];
  subscribers.forEach((callback) => {
    try {
      callback(current);
    } catch (e) {
      console.error('Error notifying subscriber:', e);
    }
  });
}

/**
 * Open IndexedDB database with no 5MB limit
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('family', 'family', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Initialize storage by reading all projects from IndexedDB into memory cache.
 * NO sample or starting projects are created - starts strictly empty as requested.
 */
export async function initFontStorage(): Promise<FontProject[]> {
  if (isInitialized) return projectsCache;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const allRecords: FontProject[] = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      // Sort by updatedAt descending
      allRecords.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      projectsCache = allRecords;
      isInitialized = true;
      notifySubscribers();
      return projectsCache;
    } catch (err) {
      console.warn('Could not initialize IndexedDB, falling back to memory storage:', err);
      // Strictly empty initial projects - no sample/demo fonts
      projectsCache = [];
      isInitialized = true;
      return projectsCache;
    }
  })();

  return initPromise;
}

// Auto-trigger initialization in browser
if (typeof window !== 'undefined') {
  initFontStorage().catch((err) => console.error('Storage init failed:', err));
}

export function createNewFontProject(params: {
  family?: string;
  style?: string;
  weight?: number;
  width?: string;
  familyId?: string;
}): FontProject {
  const family = params.family?.trim() || 'Untitled Font';
  const style = params.style?.trim() || 'Regular';
  const weight = params.weight || 400;
  const width = params.width || 'Normal';
  const now = new Date().toISOString();
  const familyId = params.familyId || `fam_${family.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

  return {
    id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name: `${family} ${style}`.trim(),
    family,
    familyId,
    style,
    weight,
    width,
    version: '1.000',
    description: 'Designed with GlyphWorks',
    designer: 'Type Designer',
    license: 'OFL-1.1',
    createdAt: now,
    updatedAt: now,
    metrics: { ...DEFAULT_METRICS },
    glyphs: generateInitialGlyphSet(),
  };
}

export const fontStorage = {
  subscribe(callback: (projects: FontProject[]) => void): () => void {
    subscribers.add(callback);
    callback([...projectsCache]);
    return () => subscribers.delete(callback);
  },

  getAllProjects(): FontProject[] {
    return [...projectsCache];
  },

  getProjectById(id: string): FontProject | null {
    return projectsCache.find((p) => p.id === id) || null;
  },

  getProjectsByFamily(familyOrFamilyId: string): FontProject[] {
    const query = familyOrFamilyId.toLowerCase().trim();
    return projectsCache.filter(
      (p) => (p.familyId && p.familyId.toLowerCase() === query) || p.family.toLowerCase() === query
    );
  },

  saveProject(project: FontProject): void {
    const updated: FontProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    const index = projectsCache.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projectsCache[index] = updated;
    } else {
      projectsCache.unshift(updated);
    }

    notifySubscribers();

    // Asynchronously commit to IndexedDB (No 5MB limit)
    openDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(updated);
      })
      .catch((err) => {
        console.error('Failed to commit font project to IndexedDB:', err);
      });
  },

  saveProjects(projects: FontProject[]): void {
    const now = new Date().toISOString();
    const prepared = projects.map((p) => ({
      ...p,
      updatedAt: p.updatedAt || now,
    }));

    prepared.forEach((p) => {
      const idx = projectsCache.findIndex((existing) => existing.id === p.id);
      if (idx >= 0) {
        projectsCache[idx] = p;
      } else {
        projectsCache.unshift(p);
      }
    });

    notifySubscribers();

    openDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        prepared.forEach((p) => store.put(p));
      })
      .catch((err) => {
        console.error('Failed to commit multiple projects to IndexedDB:', err);
      });
  },

  deleteProject(id: string): void {
    projectsCache = projectsCache.filter((p) => p.id !== id);
    notifySubscribers();

    openDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
      })
      .catch((err) => {
        console.error('Failed to delete project from IndexedDB:', err);
      });
  },

  duplicateProject(id: string): FontProject | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const copy: FontProject = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: `${original.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projectsCache.unshift(copy);
    notifySubscribers();

    openDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(copy);
      })
      .catch((err) => {
        console.error('Failed to save duplicate project to IndexedDB:', err);
      });

    return copy;
  },

  clearAll(): void {
    projectsCache = [];
    notifySubscribers();

    openDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
      })
      .catch((err) => {
        console.error('Failed to clear IndexedDB:', err);
      });
  },
};
