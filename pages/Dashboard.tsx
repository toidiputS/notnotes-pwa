
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, MoreVertical, Clock, Flag, Edit3, Trash2, Archive, Copy, CheckCircle, Calendar } from '../components/ui/Icons';
import { api } from '../services/db';
import { Project, ProjectStatus, Priority, Task, TaskStatus } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { QuickCapture } from '../components/QuickCapture';
import { useToast } from '../components/ui/Toast';

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const colors = {
    [ProjectStatus.IDEA]: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    [ProjectStatus.PLANNING]: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    [ProjectStatus.IN_PROGRESS]: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    [ProjectStatus.PAUSED]: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
    [ProjectStatus.COMPLETE]: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${colors[status]} flex items-center space-x-1.5`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      <span>{status}</span>
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        [Priority.LOW]: 'text-slate-500',
        [Priority.MEDIUM]: 'text-amber-500',
        [Priority.HIGH]: 'text-rose-500'
    };
    return (
        <div className={`flex items-center space-x-1 ${colors[priority]} font-bold text-[10px] uppercase tracking-wider`}>
            <Flag size={10} fill="currentColor" />
            <span>{priority}</span>
        </div>
    );
};

interface ProjectCardProps {
    project: Project;
    onRefresh: () => void;
    onEdit: (p: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onRefresh, onEdit }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(api.getTasks(project.id));
  }, [project.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (e: React.MouseEvent, action: 'duplicate' | 'archive' | 'delete' | 'edit') => {
    e.preventDefault();
    e.stopPropagation(); 
    
    setIsMenuOpen(false);
    
    if (action === 'duplicate') {
        api.duplicateProject(project.id);
        showToast('Project duplicated');
        onRefresh();
    } else if (action === 'archive') {
        if (window.confirm(`Archive "${project.title}"?`)) {
            api.archiveProject(project.id);
            showToast('Project archived');
            onRefresh();
        }
    } else if (action === 'delete') {
        if (window.confirm(`Permanently delete "${project.title}"? This cannot be undone.`)) {
            api.deleteProject(project.id);
            showToast('Project deleted forever', 'success');
            onRefresh();
        }
    } else if (action === 'edit') {
        onEdit(project);
    }
  };

  const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const upcomingTasks = tasks
    .filter(t => t.status !== TaskStatus.DONE && t.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 2);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div 
      onClick={() => navigate(`/project/${project.id}`)}
      className={`group bg-[#0B0E14] rounded-[3rem] border border-white/5 p-10 cursor-pointer transition-all duration-700 hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] hover:-translate-y-4 relative flex flex-col h-full hover:border-white/10 ${isMenuOpen ? 'z-30 ring-2 ring-white/10' : 'z-0 shadow-2xl'}`}
    >
      {/* Subtle indicator dot */}
      <div className="absolute top-10 right-10 w-1.5 h-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ backgroundColor: project.color }}></div>

      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
            <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-1">Status</div>
            <StatusBadge status={project.status} />
        </div>
        
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className={`p-3 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-white/10 text-white' : 'text-slate-700 hover:text-white hover:bg-white/5'}`}
            >
                <MoreVertical size={20} />
            </button>
            
            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 glass rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-2">
                    <button onClick={(e) => handleAction(e, 'edit')} className="w-full text-left px-5 py-4 text-xs text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl flex items-center space-x-4 transition-all uppercase tracking-widest font-bold">
                        <Edit3 size={16} className="opacity-30" /> <span>Edit Vault</span>
                    </button>
                    <button onClick={(e) => handleAction(e, 'duplicate')} className="w-full text-left px-5 py-4 text-xs text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl flex items-center space-x-4 transition-all uppercase tracking-widest font-bold">
                        <Copy size={16} className="opacity-30" /> <span>Duplicate</span>
                    </button>
                    <button onClick={(e) => handleAction(e, 'archive')} className="w-full text-left px-5 py-4 text-xs text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl flex items-center space-x-4 transition-all uppercase tracking-widest font-bold">
                        <Archive size={16} className="opacity-30" /> <span>Archive</span>
                    </button>
                    <div className="border-t border-white/5 my-2 mx-3"></div>
                    <button onClick={(e) => handleAction(e, 'delete')} className="w-full text-left px-5 py-4 text-xs text-rose-500 hover:bg-rose-500/10 rounded-2xl flex items-center space-x-4 transition-all uppercase tracking-widest font-bold group/item">
                        <Trash2 size={16} className="opacity-30 group-hover/item:opacity-100" /> <span>Destroy</span>
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-4xl font-serif italic text-slate-200 mb-4 group-hover:text-white transition-all duration-500 leading-[1] tracking-tight lowercase">
            {project.title}
        </h3>
        <p className="text-sm text-slate-600 mb-10 line-clamp-2 leading-relaxed font-medium italic font-serif">
            {project.description || "No description provided."}
        </p>

        <div className="space-y-6 mb-10">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                <span>Progress</span>
                <span className="text-slate-500 tabular-nums">{progress}%</span>
            </div>
            <div className="h-[1px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-[1.5s] ease-[cubic-bezier(0.2,0,0,1)]" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        {upcomingTasks.length > 0 && (
            <div className="mb-10 space-y-4">
                <div className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.4em]">Milestones</div>
                {upcomingTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-[1.5rem] px-5 py-4 text-xs hover:border-white/10 transition-all group/task">
                        <div className="flex items-center space-x-4 truncate">
                            <div className={`w-1 h-1 rounded-full flex-shrink-0 ${t.status === TaskStatus.IN_PROGRESS ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-slate-800'}`}></div>
                            <span className="truncate text-slate-500 font-serif italic text-base group-hover/task:text-slate-200 transition-colors">{t.title.toLowerCase()}</span>
                        </div>
                        <span className={`flex-shrink-0 ml-4 font-mono text-[9px] ${t.dueDate && t.dueDate < today ? 'text-rose-500' : 'text-slate-700'}`}>
                            {t.dueDate?.split('-').slice(1).join('/')}
                        </span>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] pt-8 border-t border-white/5 mt-auto">
        <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
                <CheckCircle size={14} className="text-slate-800 group-hover:text-white transition-colors" />
                <span className="group-hover:text-slate-400 transition-colors">{doneTasks.length} Done</span>
            </div>
            <div className="flex items-center space-x-3">
                <Clock size={14} className="text-slate-800" />
                <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
        </div>
        <PriorityBadge priority={project.priority} />
      </div>
    </div>
  );
};

interface DashboardProps {
    onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onRefresh }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const refreshProjects = () => {
    setProjects(api.getProjects());
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleCreateNew = () => {
    setEditingProject(undefined);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setIsProjectModalOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 scroll-smooth">
      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32">
        {/* Hero Section - Editorial Style */}
        <div className="relative pt-16 pb-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-8">
              <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">
                <span className="w-12 h-[1px] bg-white/10"></span>
                <span>Private Production Vault</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-serif italic text-white tracking-tight leading-[0.8] lowercase">
                Active <br />
                <span className="text-slate-700 ml-12">Vaults</span>
              </h1>
              <p className="text-slate-500 font-medium text-xl max-w-lg leading-relaxed font-serif italic">
                A sophisticated environment for deep work. Track your most ambitious projects with absolute clarity.
              </p>
            </div>
            <div className="flex flex-col items-end gap-8">
              <button 
                onClick={handleCreateNew}
                className="group flex items-center justify-center space-x-4 bg-white text-slate-950 px-10 py-5 rounded-full hover:scale-[1.05] transition-all duration-500 active:scale-[0.98] shadow-[0_30px_60px_rgba(255,255,255,0.1)] font-bold text-xs tracking-[0.2em] uppercase"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                <span>Initiate</span>
              </button>
              <div className="flex items-center space-x-10 text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-white text-lg font-serif italic lowercase">{projects.length}</span>
                  <span>Total</span>
                </div>
                <div className="w-[1px] h-8 bg-white/5"></div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-white text-lg font-serif italic lowercase">{projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length}</span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-900 rounded-3xl border border-dashed border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-700">
              <FolderOpen size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Your workspace is quiet</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-center">Start a new production vault to track tasks, docs, and your project timeline.</p>
            <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 border border-indigo-500">
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(p => (
              <ProjectCard 
                  key={p.id} 
                  project={p} 
                  onRefresh={refreshProjects}
                  onEdit={handleEditProject}
              />
            ))}
          </div>
        )}

        <ProjectModal 
          isOpen={isProjectModalOpen} 
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={refreshProjects}
          project={editingProject}
        />
      </div>
    </div>
  );
};

export default Dashboard;
