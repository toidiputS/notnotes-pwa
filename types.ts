export enum SubscriptionTier {
  FREE = 'Free',
  NODE = 'Node',
  SQUAD = 'Squad',
  SQUAD_PLUS = 'Squad+',
  PLATOON = 'Platoon'
}

export enum ProjectStatus {
  IDEA = 'Idea',
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  PAUSED = 'Paused',
  COMPLETE = 'Complete'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum TaskStatus {
  BACKLOG = 'Backlog',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  DONE = 'Done'
}

export enum ArtifactType {
  PDF = 'pdf',
  MARKDOWN = 'markdown',
  IMAGE = 'image',
  ZIP = 'zip',
  GENERIC = 'generic'
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  tags: string[];
  color?: string;
  startDate?: string;
  targetDate?: string;
  createdAt: number;
  archived?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: number;
}

export interface Artifact {
  id: string;
  projectId: string;
  title: string;
  type: ArtifactType;
  size: number; // bytes
  url?: string; // simplified for MVP
  createdAt: number;
}

export interface Note {
  id: string;
  projectId?: string; // Global project note
  artifactId?: string; // Attached to file
  taskId?: string; // Attached to task
  title: string;
  content: string; // Markdown/Text
  pinned: boolean;
  createdAt: number;
}

export interface CalendarItem {
  id: string;
  projectId: string;
  taskId?: string;
  title: string;
  description?: string;
  startDatetime: string; // ISO 8601
  endDatetime: string;   // ISO 8601
  isAllDay: boolean;
  type?: 'milestone' | 'task_due' | 'event';
}

export interface MindmapNode {
  id: string;
  label: string;
  children: MindmapNode[];
}

export interface Mindmap {
  id: string;
  projectId: string;
  title: string;
  root: MindmapNode;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  action: string;
  timestamp: number;
}
