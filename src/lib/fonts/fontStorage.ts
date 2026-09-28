import { FontProject } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from './defaultFont';

const STORAGE_KEY = 'glyphworks_font_projects_v1';

export function createNewFontProject(params: {
  family?: string;
  style?: string;
  weight?: number;
  width?: string;
}): FontProject {
  const family = params.family?.trim() || 'Untitled Font';
  const style = params.style?.trim() || 'Regular';
  const weight = params.weight || 400;
  const width = params.width || 'Normal';
  const now = new Date().toISOString();

  return {
    id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name: family,
    family,
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

function getInitialProjects(): FontProject[] {
  const untitled = createNewFontProject({
    family: 'Untitled Font',
    style: 'Regular',
    weight: 400,
  });
  // Modify timestamps to match prompt
  untitled.updatedAt = new Date().toISOString();

  const interDisplay = createNewFontProject({
    family: 'Inter Display',
    style: 'Regular',
    weight: 400,
  });
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  interDisplay.updatedAt = yesterday;
  interDisplay.createdAt = new Date(Date.now() - 86400000 * 5).toISOString();

  return [untitled, interDisplay];
}

export const fontStorage = {
  getAllProjects(): FontProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getInitialProjects();
        this.saveAllProjects(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initial = getInitialProjects();
        this.saveAllProjects(initial);
        return initial;
      }
      return parsed;
    } catch {
      return getInitialProjects();
    }
  },

  getProjectById(id: string): FontProject | null {
    const projects = this.getAllProjects();
    return projects.find((p) => p.id === id) || null;
  },

  saveAllProjects(projects: FontProject[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  saveProject(project: FontProject): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      projects[index] = updated;
    } else {
      projects.unshift(updated);
    }
    this.saveAllProjects(projects);
  },

  deleteProject(id: string): void {
    const projects = this.getAllProjects().filter((p) => p.id !== id);
    this.saveAllProjects(projects);
  },

  duplicateProject(id: string): FontProject | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const copy: FontProject = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: `${original.name} Copy`,
      family: `${original.family} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projects = this.getAllProjects();
    projects.unshift(copy);
    this.saveAllProjects(projects);
    return copy;
  },
};
