
import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  FileText, CheckSquare, Paperclip, BrainCircuit, Calendar,
  Archive, AlignLeft, PanelLeftClose, PanelLeftOpen, Layers
} from '../../components/ui/Icons';
import { api } from '../../services/db';
import { Project, ProjectStatus } from '../../types';
import { useLayout } from '../../context/LayoutContext';

// Sub-views are in the same directory here
import ProjectOverview from './ProjectOverview';
import ProjectDocs from './ProjectDocs';
import ProjectTasks from './ProjectTasks';
import ProjectFiles from './ProjectFiles';
import ProjectTimeline from './ProjectTimeline';
import ProjectMindmaps from './ProjectMindmaps';
import ProjectArchive from './ProjectArchive';
import ProjectDossier from './ProjectDossier';

const TabLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    end={to.endsWith('overview')}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
        ? 'bg-slate-800 text-indigo-400 shadow-sm ring-1 ring-slate-700'
        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'} />
        <span className="truncate">{label}</span>
      </>
    )}
  </NavLink>
);

const ProjectView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Layout Context
  const { isSidebarCollapsed, setSidebarCollapsed, setShowGlobalTrigger } = useLayout();

  useEffect(() => {
    if (projectId) {
      const p = api.getProject(projectId);
      if (p) setProject(p);
      else navigate('/'); // Project not found
    }
  }, [projectId, navigate]);

  useEffect(() => {
    setShowGlobalTrigger(false);
    return () => setShowGlobalTrigger(true);
  }, [setShowGlobalTrigger]);

  if (!project) return null;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]';
      case ProjectStatus.PLANNING: return 'bg-blue-500';
      case ProjectStatus.COMPLETE: return 'bg-emerald-500';
      case ProjectStatus.PAUSED: return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row animate-in fade-in duration-300 relative bg-slate-950">
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-30 hidden md:block">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-md text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all hover:-translate-y-0.5"
            title="Show Project Menu"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      )}

      <div className={`
          flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden border-r border-slate-800 bg-[#0B0E14]
          ${isSidebarOpen ? 'w-full md:w-64 opacity-100' : 'md:w-0 md:opacity-0 md:h-0 md:border-r-0'}
      `}>
        <div className="p-6 space-y-8 h-full flex flex-col">
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium tracking-wide">
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="p-1 -ml-1 hover:bg-slate-800 rounded text-slate-500 hover:text-indigo-400 transition flex-shrink-0"
                    title="Open Main Sidebar"
                  >
                    <PanelLeftOpen size={14} />
                  </button>
                )}
                <button onClick={() => navigate('/')} className="hover:text-slate-300 transition-colors flex-shrink-0">Projects</button>
                <span className="text-slate-600">:</span>
                <span className="text-slate-400 truncate max-w-[90px]">{project.title}</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-600 hover:text-indigo-400 hidden md:block p-1 hover:bg-slate-800 rounded transition"
                title="Hide Menu"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 leading-tight truncate tracking-tight mb-3">{project.title}</h2>
            <div className="flex items-center space-x-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(project.status)}`}></div>
              <span className="text-sm font-medium text-slate-400">{project.status}</span>
            </div>
          </div>

          <nav className="space-y-1 pt-2 flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/50">
              <TabLink to={`/project/${project.id}/overview`} icon={AlignLeft} label="Overview" />
              <TabLink to={`/project/${project.id}/tasks`} icon={CheckSquare} label="Tasks" />
              <TabLink to={`/project/${project.id}/docs`} icon={FileText} label="Docs" />
              <TabLink to={`/project/${project.id}/files`} icon={Paperclip} label="Files" />
              <TabLink to={`/project/${project.id}/timeline`} icon={Calendar} label="Timeline" />
            </div>
            <div className="pt-6 px-2">
              <p className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Intelligence</p>
              <div className="space-y-1">
                <TabLink to={`/project/${project.id}/dossier`} icon={Layers} label="Dossier" />
                <TabLink to={`/project/${project.id}/mindmaps`} icon={BrainCircuit} label="Mindmaps" />
                <TabLink to={`/project/${project.id}/archive`} icon={Archive} label="Archive" />
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="flex-1 min-w-0 p-4 md:p-8 h-full overflow-hidden bg-slate-950">
        <div
          key={project.id}
          className="bg-slate-900 rounded-3xl border border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] p-8 md:p-12 overflow-y-auto h-full relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent text-slate-200"
        >
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverview project={project} />} />
            <Route path="tasks" element={<ProjectTasks projectId={project.id} />} />
            <Route path="docs" element={<ProjectDocs projectId={project.id} />} />
            <Route path="files" element={<ProjectFiles projectId={project.id} />} />
            <Route path="timeline" element={<ProjectTimeline projectId={project.id} />} />
            <Route path="dossier" element={<ProjectDossier project={project} />} />
            <Route path="mindmaps" element={<ProjectMindmaps />} />
            <Route path="archive" element={<ProjectArchive />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
