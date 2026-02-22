
import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  FileText, CheckSquare, Paperclip, BrainCircuit, Calendar,
  Archive, AlignLeft, PanelLeftClose, PanelLeftOpen, Package
} from '../components/ui/Icons';
import { api } from '../services/db';
import { Project, ProjectStatus } from '../types';
import { useLayout } from '../context/LayoutContext';

// Sub-views are located in the 'project' subfolder
import ProjectOverview from './project/ProjectOverview';
import ProjectDocs from './project/ProjectDocs';
import ProjectTasks from './project/ProjectTasks';
import ProjectFiles from './project/ProjectFiles';
import ProjectTimeline from './project/ProjectTimeline';
import ProjectMindmaps from './project/ProjectMindmaps';
import ProjectArchive from './project/ProjectArchive';
import ProjectPacket from './project/ProjectPacket';

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
    // Hide global sidebar trigger when inside project view to use the local one
    setShowGlobalTrigger(false);
    return () => setShowGlobalTrigger(true);
  }, [setShowGlobalTrigger]);

  if (!project) return null;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]';
      case ProjectStatus.PLANNING: return 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]';
      case ProjectStatus.COMPLETE: return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
      case ProjectStatus.PAUSED: return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full print:h-auto print:block flex flex-col md:flex-row animate-in fade-in duration-500 relative bg-slate-950">
      {/* Local Sidebar Open Trigger */}
      {!isSidebarOpen && (
        <div className="absolute top-6 left-6 z-30 hidden md:block">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all hover:-translate-y-0.5"
            title="Show Project Menu"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}

      {/* Project Sidebar */}
      <div className={`
          print:hidden flex-shrink-0 flex flex-col transition-all duration-700 overflow-hidden border-r border-white/5 bg-[#020617]
          ${isSidebarOpen ? 'w-full md:w-80 opacity-100' : 'md:w-0 md:opacity-0 md:h-0 md:border-r-0'}
      `}>
        <div className="p-10 space-y-12 h-full flex flex-col">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="p-2 -ml-2 hover:bg-white/5 rounded-full text-slate-600 hover:text-white transition flex-shrink-0"
                    title="Open Main Sidebar"
                  >
                    <PanelLeftOpen size={14} />
                  </button>
                )}
                <button onClick={() => navigate('/')} className="hover:text-slate-400 transition-colors">Vaults</button>
                <span className="text-slate-900">/</span>
                <span className="text-slate-500 truncate max-w-[120px] font-serif italic lowercase text-base">{project.title}</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-800 hover:text-white hidden md:block p-2 hover:bg-white/5 rounded-full transition-all"
                title="Hide Menu"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-serif italic text-white leading-[0.9] tracking-tight lowercase" title={project.title}>
                {project.title}
              </h2>

              <div className="flex items-center space-x-4 bg-white/5 border border-white/5 rounded-full px-5 py-2.5 w-fit">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(project.status)}`}></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">{project.status}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4">
            <div className="space-y-2">
              <div className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.4em] mb-6 px-4">Navigation</div>
              <TabLink to={`/project/${project.id}/overview`} icon={AlignLeft} label="Overview" />
              <TabLink to={`/project/${project.id}/tasks`} icon={CheckSquare} label="Tasks" />
              <TabLink to={`/project/${project.id}/docs`} icon={FileText} label="Docs" />
              <TabLink to={`/project/${project.id}/files`} icon={Paperclip} label="Files" />
              <TabLink to={`/project/${project.id}/timeline`} icon={Calendar} label="Timeline" />
              <TabLink to={`/project/${project.id}/packet`} icon={Package} label="Final Packet" />
            </div>

            <div className="pt-12">
              <div className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.4em] mb-6 px-4">Extensions</div>
              <div className="space-y-2">
                <TabLink to={`/project/${project.id}/mindmaps`} icon={BrainCircuit} label="Mindmaps" />
                <TabLink to={`/project/${project.id}/archive`} icon={Archive} label="Archive" />
              </div>
            </div>
          </nav>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">
              <span>Priority</span>
              <span className={`px-3 py-1 rounded-full bg-white/5 border border-white/5 ${project.priority === 'HIGH' ? 'text-rose-500' : 'text-slate-500'}`}>{project.priority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Project Content Area */}
      <div className="flex-1 min-w-0 p-4 md:p-12 h-full print:h-auto print:block overflow-hidden bg-slate-950 print:p-0 print:overflow-visible">
        <div
          key={project.id}
          className="bg-[#0B0E14] print:bg-transparent print:block print:p-0 rounded-[3.5rem] border border-white/5 print:border-none print:shadow-none shadow-[0_64px_128px_-32px_rgba(0,0,0,0.9)] p-8 md:p-20 overflow-y-auto h-full print:h-auto relative scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent text-slate-200 print:overflow-visible print:rounded-none"
        >
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverview project={project} />} />
            <Route path="tasks" element={<ProjectTasks projectId={project.id} />} />
            <Route path="docs" element={<ProjectDocs projectId={project.id} />} />
            <Route path="files" element={<ProjectFiles projectId={project.id} />} />
            <Route path="timeline" element={<ProjectTimeline projectId={project.id} />} />
            <Route path="packet" element={<ProjectPacket project={project} />} />
            <Route path="mindmaps" element={<ProjectMindmaps />} />
            <Route path="archive" element={<ProjectArchive />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
