
import { Project, Task, Note, Artifact, CalendarItem, ProjectStatus, Priority, TaskStatus, ArtifactType, ActivityLog, Mindmap, Deck } from '../types';

const STORAGE_KEY = 'notnotes_db_v1';

interface DB {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  artifacts: Artifact[];
  calendarItems: CalendarItem[];
  mindmaps: Mindmap[];
  activityLogs: ActivityLog[];
  decks: Deck[];
}

const SEED_DB: DB = {
  projects: [],
  tasks: [],
  notes: [],
  artifacts: [],
  calendarItems: [],
  mindmaps: [],
  activityLogs: [],
  decks: []
};

// Helper to load/save
const loadDB = (): DB => {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DB));
  return SEED_DB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// API Methods
export const api = {
  getProjects: () => loadDB().projects.filter(p => !p.archived),
  getProject: (id: string) => loadDB().projects.find(p => p.id === id),
  createProject: (p: Partial<Project>) => {
    const db = loadDB();
    const newProject: Project = {
      id: `p-${Date.now()}`,
      title: p.title || 'Untitled Project',
      description: p.description || '',
      status: p.status || ProjectStatus.PLANNING,
      priority: p.priority || Priority.MEDIUM,
      tags: p.tags || [],
      startDate: p.startDate,
      targetDate: p.targetDate,
      color: p.color,
      createdAt: Date.now(),
      ...p
    };
    db.projects.push(newProject);
    saveDB(db);
    return newProject;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    const db = loadDB();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx > -1) {
      db.projects[idx] = { ...db.projects[idx], ...updates };
      saveDB(db);
    }
  },

  deleteProject: (id: string) => {
    const db = loadDB();
    db.projects = db.projects.filter(p => p.id !== id);
    db.tasks = db.tasks.filter(t => t.projectId !== id);
    db.notes = db.notes.filter(n => n.projectId !== id);
    db.artifacts = db.artifacts.filter(a => a.projectId !== id);
    db.calendarItems = db.calendarItems.filter(c => c.projectId !== id);
    db.mindmaps = db.mindmaps.filter(m => m.projectId !== id);
    saveDB(db);
  },

  archiveProject: (id: string) => {
    const db = loadDB();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx > -1) {
      db.projects[idx].archived = true;
      saveDB(db);
    }
  },

  duplicateProject: (id: string) => {
    const db = loadDB();
    const original = db.projects.find(p => p.id === id);
    if (!original) return;

    const newId = `p-${Date.now()}`;
    const newProject: Project = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      createdAt: Date.now()
    };
    db.projects.push(newProject);

    // Clone tasks
    db.tasks.filter(t => t.projectId === id).forEach(t => {
      db.tasks.push({ ...t, id: `t-${Date.now()}-${Math.random()}`, projectId: newId, createdAt: Date.now() });
    });

    // Clone notes
    db.notes.filter(n => n.projectId === id).forEach(n => {
      db.notes.push({ ...n, id: `n-${Date.now()}-${Math.random()}`, projectId: newId, createdAt: Date.now() });
    });

    // Clone artifacts
    db.artifacts.filter(a => a.projectId === id).forEach(a => {
      db.artifacts.push({ ...a, id: `a-${Date.now()}-${Math.random()}`, projectId: newId, createdAt: Date.now() });
    });

    // Clone calendar items
    db.calendarItems.filter(c => c.projectId === id).forEach(c => {
      db.calendarItems.push({ ...c, id: `c-${Date.now()}-${Math.random()}`, projectId: newId });
    });

    // Clone mindmaps
    db.mindmaps.filter(m => m.projectId === id).forEach(m => {
      db.mindmaps.push({ ...m, id: `m-${Date.now()}-${Math.random()}`, projectId: newId, createdAt: Date.now() });
    });

    saveDB(db);
  },

  getTasks: (projectId?: string) => {
    const db = loadDB();
    return projectId ? db.tasks.filter(t => t.projectId === projectId) : db.tasks;
  },
  createTask: (t: Partial<Task>) => {
    const db = loadDB();
    const newTask: Task = {
      id: `t-${Date.now()}`,
      projectId: t.projectId!,
      title: t.title || 'Untitled Task',
      status: t.status || TaskStatus.BACKLOG,
      createdAt: Date.now(),
      ...t
    };
    db.tasks.push(newTask);
    saveDB(db);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const db = loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...updates };
      saveDB(db);
    }
  },

  getArtifacts: (projectId: string) => loadDB().artifacts.filter(a => a.projectId === projectId),
  createArtifact: (a: Partial<Artifact>) => {
    const db = loadDB();
    const newArtifact: Artifact = {
      id: `a-${Date.now()}`,
      projectId: a.projectId!,
      title: a.title!,
      type: a.type || ArtifactType.GENERIC,
      size: a.size || 0,
      createdAt: Date.now(),
      ...a
    };
    db.artifacts.push(newArtifact);
    saveDB(db);
    return newArtifact;
  },

  getNotes: (projectId: string) => {
    const db = loadDB();
    // Return project level notes by default (where taskId is not set)
    return db.notes.filter(n => n.projectId === projectId && !n.taskId);
  },
  getNotesByTask: (taskId: string) => {
    const db = loadDB();
    return db.notes.filter(n => n.taskId === taskId);
  },
  createNote: (n: Partial<Note>) => {
    const db = loadDB();
    const newNote: Note = {
      id: `n-${Date.now()}`,
      projectId: n.projectId,
      taskId: n.taskId,
      title: n.title || 'Untitled Note',
      content: n.content || '',
      pinned: false,
      createdAt: Date.now(),
      ...n
    };
    db.notes.push(newNote);
    saveDB(db);
    return newNote;
  },
  updateNote: (id: string, updates: Partial<Note>) => {
    const db = loadDB();
    const idx = db.notes.findIndex(n => n.id === id);
    if (idx > -1) {
      db.notes[idx] = { ...db.notes[idx], ...updates };
      saveDB(db);
    }
  },
  deleteNote: (id: string) => {
    const db = loadDB();
    db.notes = db.notes.filter(n => n.id !== id);
    saveDB(db);
  },

  getCalendarItems: (projectId?: string) => {
    const db = loadDB();
    return projectId ? db.calendarItems.filter(c => c.projectId === projectId) : db.calendarItems;
  },
  createCalendarItem: (c: Partial<CalendarItem>) => {
    const db = loadDB();
    const newItem: CalendarItem = {
      id: `c-${Date.now()}`,
      projectId: c.projectId!,
      title: c.title || 'Untitled Event',
      startDatetime: c.startDatetime || new Date().toISOString(),
      endDatetime: c.endDatetime || new Date().toISOString(),
      isAllDay: c.isAllDay || false,
      type: c.type || 'event',
      ...c
    };
    db.calendarItems.push(newItem);
    saveDB(db);
    return newItem;
  },
  updateCalendarItem: (id: string, updates: Partial<CalendarItem>) => {
    const db = loadDB();
    const idx = db.calendarItems.findIndex(c => c.id === id);
    if (idx > -1) {
      db.calendarItems[idx] = { ...db.calendarItems[idx], ...updates };
      saveDB(db);
    }
  },
  deleteCalendarItem: (id: string) => {
    const db = loadDB();
    db.calendarItems = db.calendarItems.filter(c => c.id !== id);
    saveDB(db);
  },

  getMindmaps: (projectId: string) => {
    const db = loadDB();
    return db.mindmaps ? db.mindmaps.filter(m => m.projectId === projectId) : [];
  },
  createMindmap: (m: Partial<Mindmap>) => {
    const db = loadDB();
    if (!db.mindmaps) db.mindmaps = []; // Migration safety
    const newMindmap: Mindmap = {
      id: `m-${Date.now()}`,
      projectId: m.projectId!,
      title: m.title || 'New Mindmap',
      root: m.root || { id: 'root', label: 'Central Topic', children: [] },
      createdAt: Date.now(),
      ...m
    };
    db.mindmaps.push(newMindmap);
    saveDB(db);
    return newMindmap;
  },
  updateMindmap: (id: string, updates: Partial<Mindmap>) => {
    const db = loadDB();
    if (!db.mindmaps) return;
    const idx = db.mindmaps.findIndex(m => m.id === id);
    if (idx > -1) {
      db.mindmaps[idx] = { ...db.mindmaps[idx], ...updates };
      saveDB(db);
    }
  },
  deleteMindmap: (id: string) => {
    const db = loadDB();
    if (!db.mindmaps) return;
    db.mindmaps = db.mindmaps.filter(m => m.id !== id);
    saveDB(db);
  },

  // ─── Deck Protocol ──────────────────────────────────────────
  getDecks: (projectId?: string) => {
    const db = loadDB();
    if (!db.decks) db.decks = []; // Migration safety
    return projectId ? db.decks.filter(d => d.projectId === projectId) : db.decks;
  },
  createDeck: (d: Partial<Deck>) => {
    const db = loadDB();
    if (!db.decks) db.decks = [];
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      deckId: d.deckId || `deck-${Date.now()}`,
      projectId: d.projectId!,
      who: d.who || { tool: 'Unknown', id: 'unknown', color: '#6366f1' },
      slides: d.slides || [],
      timestamp: d.timestamp || new Date().toISOString(),
      createdAt: Date.now(),
      ...d
    };
    db.decks.push(newDeck);
    saveDB(db);
    return newDeck;
  },
  deleteDeck: (id: string) => {
    const db = loadDB();
    if (!db.decks) return;
    db.decks = db.decks.filter(d => d.id !== id);
    saveDB(db);
  },

  search: (query: string) => {
    const db = loadDB();
    const q = query.toLowerCase();
    return {
      projects: db.projects.filter(p => !p.archived && p.title.toLowerCase().includes(q)),
      tasks: db.tasks.filter(t => t.title.toLowerCase().includes(q)),
      notes: db.notes.filter(n => n.title.toLowerCase().includes(q))
    };
  }
};
