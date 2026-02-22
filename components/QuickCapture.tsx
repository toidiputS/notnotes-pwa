
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { api } from '../services/db';
import { ProjectStatus, Priority, TaskStatus } from '../types';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [type, setType] = useState<'project' | 'task' | 'event'>('task');
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  
  // For Event
  const [startDatetime, setStartDatetime] = useState('');

  const projects = api.getProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'project') {
      const newProject = api.createProject({ 
        title, 
        status: ProjectStatus.PLANNING, 
        priority: Priority.MEDIUM 
      });
      // Navigate to the new project immediately
      navigate(`/project/${newProject.id}`);
      setTitle('');
      onClose();
      return; 
    } 
    
    if (type === 'task') {
      api.createTask({
        title,
        projectId: projectId || projects[0]?.id || '',
        status: TaskStatus.BACKLOG
      });
    } else if (type === 'event') {
        const start = startDatetime ? new Date(startDatetime) : new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default
        api.createCalendarItem({
            title,
            projectId: projectId || projects[0]?.id || '',
            startDatetime: start.toISOString(),
            endDatetime: end.toISOString(),
            isAllDay: false
        });
    }

    setTitle('');
    setStartDatetime('');
    if (onSuccess) onSuccess();
    onClose();
  };

  const inputClasses = "w-full px-3 py-2 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-slate-600 hover:border-slate-600 transition-colors";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Capture">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit border border-slate-700">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${type === 'task' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setType('task')}
          >
            Task
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${type === 'event' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setType('event')}
          >
            Event
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${type === 'project' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setType('project')}
          >
            Project
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Title</label>
          <input
            autoFocus
            type="text"
            className={inputClasses}
            placeholder={type === 'project' ? "Project Name" : "Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {(type === 'task' || type === 'event') && (
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Project</label>
            <select
              className={inputClasses}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.length === 0 && <option value="">No projects found</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        
        {type === 'event' && (
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Date & Time</label>
                <input
                    type="datetime-local"
                    className={inputClasses}
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                />
            </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition shadow-sm border border-indigo-500"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};
