import { FontProject, FontTypeStyle } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from './defaultFont';
import { detectFontPrimaryLanguage } from './languagePresets';

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

      // Self-healing: normalize any existing mega-projects from past sessions to ensure zero memory thrashing
      for (const p of allRecords) {
        if (p.glyphs) {
          // Self-heal primaryScript if missing or incorrectly Latin
          if (!p.primaryScript || p.primaryScript === 'Latin') {
            const detected = detectFontPrimaryLanguage(p.glyphs, p.primaryScript);
            if (detected.primaryScript !== 'Latin') {
              p.primaryScript = detected.primaryScript;
            }
          }

          const glyphKeys = Object.keys(p.glyphs);
          if (glyphKeys.length > 3500) {
            let contourCount = 0;
            const MAX_ALLOWED_CONTOURS = 3500;
            for (const k of glyphKeys) {
              const g = p.glyphs[k];
              if (g && g.contours && g.contours.length > 0) {
                contourCount++;
                if (contourCount > MAX_ALLOWED_CONTOURS) {
                  const u = g.unicode;
                  const isCore =
                    (u !== undefined && u <= 0x007f) ||
                    (u === 0x6c38 || u === 0x548c || u === 0x4e2d || u === 0x56fd || u === 0x6587 || u === 0x5b57 ||
                     u === 0x1200 || u === 0x1208 || u === 0x12a0 ||
                     u === 0x0627 || u === 0x0628 ||
                     u === 0x0416 || u === 0x044f ||
                     u === 0x03a9 || u === 0x03b1 ||
                     u === 0x05d0 || u === 0x05d1 ||
                     u === 0x0905 || u === 0x0915 ||
                     u === 0x3042 || u === 0x30a2);
                  if (!isCore) {
                    g.contours = [];
                    g.hasCustomPath = false;
                  }
                }
              }
            }
          }
        }
      }

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
  isFamily?: boolean;
  initialStyles?: { name: string; weight: number; width?: string; isItalic?: boolean }[];
}): FontProject {
  const family = params.family?.trim() || 'Untitled Font';
  const now = new Date().toISOString();
  const familyId = params.familyId || `fam_${family.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

  if (params.isFamily && params.initialStyles && params.initialStyles.length > 0) {
    const types: FontTypeStyle[] = params.initialStyles.map((s) => ({
      id: 'type_' + Math.random().toString(36).substring(2, 9),
      name: s.name,
      weight: s.weight,
      width: s.width || 'Normal',
      isItalic: s.isItalic,
      metrics: { ...DEFAULT_METRICS },
      glyphs: generateInitialGlyphSet(),
    }));

    const primaryType = types.find((t) => t.name === 'Regular' || t.weight === 400) || types[0];

    return {
      id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: family,
      family,
      familyId,
      style: primaryType.name,
      weight: primaryType.weight,
      width: primaryType.width,
      version: '1.000',
      description: `Font Family with ${types.length} styles`,
      designer: 'Type Designer',
      license: 'OFL-1.1',
      createdAt: now,
      updatedAt: now,
      isFamily: true,
      types,
      activeTypeId: primaryType.id,
      metrics: primaryType.metrics,
      glyphs: primaryType.glyphs,
      primaryScript: 'Latin',
    };
  }

  const style = params.style?.trim() || 'Regular';
  const weight = params.weight || 400;
  const width = params.width || 'Normal';
  const initialType: FontTypeStyle = {
    id: 'type_' + Math.random().toString(36).substring(2, 9),
    name: style,
    weight,
    width,
    isItalic: style.toLowerCase().includes('italic'),
    metrics: { ...DEFAULT_METRICS },
    glyphs: generateInitialGlyphSet(),
  };

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
    isFamily: false,
    types: [initialType],
    activeTypeId: initialType.id,
    metrics: initialType.metrics,
    glyphs: initialType.glyphs,
    primaryScript: 'Latin',
  };
}

const scheduleStorageWrite = (fn: () => void) => {
  // Use setTimeout instead of requestIdleCallback — rIC can trigger Chrome's
  // "Cannot read properties of undefined (reading 'startTime')" Performance Observer bug.
  // A short-delay setTimeout achieves the same non-blocking write without the crash.
  setTimeout(fn, 80);
};

export const fontStorage = {
  subscribe(callback: (projects: FontProject[]) => void): () => void {
    subscribers.add(callback);
    callback([...projectsCache]);
    return () => subscribers.delete(callback);
  },

  getAllProjects(): FontProject[] {
    return [...projectsCache];
  },

  /** True once IndexedDB has finished loading into the in-memory cache */
  isReady(): boolean {
    return isInitialized;
  },

  /** Resolves when IndexedDB cache is fully loaded */
  awaitReady(): Promise<FontProject[]> {
    if (isInitialized) return Promise.resolve([...projectsCache]);
    return initPromise || initFontStorage();
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

    // Asynchronously commit to IndexedDB on idle frame so UI never freezes or stutters
    scheduleStorageWrite(() => {
      openDatabase()
        .then((db) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(updated);
        })
        .catch((err) => {
          console.error('Failed to commit font project to IndexedDB:', err);
        });
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

    scheduleStorageWrite(() => {
      openDatabase()
        .then((db) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          prepared.forEach((p) => store.put(p));
        })
        .catch((err) => {
          console.error('Failed to commit multiple projects to IndexedDB:', err);
        });
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

  exportWorkspaceGworks(): void {
    const projects = this.getAllProjects();
    const bundle = {
      format: 'glyphworks-workspace',
      version: 1,
      exportedAt: new Date().toISOString(),
      projectCount: projects.length,
      projects,
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `glyphworks-workspace-${dateStr}.gworks`;
    downloadBlob(blob, filename);
  },

  exportProjectGworks(id: string): void {
    const project = this.getProjectById(id);
    if (!project) return;
    const bundle = {
      format: 'glyphworks-project',
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const safeFamily = (project.family || 'font').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeStyle = (project.style || 'regular').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadBlob(blob, `${safeFamily}-${safeStyle}.gworks`);
  },

  async importGworksFile(file: File): Promise<FontProject[]> {
    const text = await file.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid .gworks file format: could not parse JSON.');
    }

    let importedProjects: FontProject[] = [];

    if (data.format === 'glyphworks-workspace' && Array.isArray(data.projects)) {
      importedProjects = data.projects;
    } else if (data.format === 'glyphworks-project' && data.project) {
      importedProjects = [data.project];
    } else if (Array.isArray(data)) {
      importedProjects = data;
    } else if (data.glyphs && data.family) {
      importedProjects = [data as FontProject];
    } else {
      throw new Error('Unrecognized .gworks file structure.');
    }

    if (importedProjects.length === 0) {
      throw new Error('No font projects found in .gworks file.');
    }

    this.saveProjects(importedProjects);
    return importedProjects;
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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

