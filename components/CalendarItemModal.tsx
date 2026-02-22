
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/db';
import { CalendarItem, Project, Task } from '../types';
import { Trash2 } from './ui/Icons';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/Toast';

interface CalendarItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: CalendarItem; // Edit mode
  initialDate?: Date; // For clicking a date
  initialRange?: { start: Date; end: Date }; // For dragging
  projectId?: string; // Pre-select project if in project view
}

export const CalendarItemModal: React.FC<CalendarItemModalProps> = ({ 
  isOpen, onClose, onSuccess, item, initialDate, initialRange, projectId 
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const projects = api.getProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [formData, setFormData] = useState<Partial<CalendarItem>>({
    title: '',
    projectId: projectId || (projects[0]?.id || ''),
    taskId: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    isAllDay: false
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
            title: item.title,
            projectId: item.projectId,
            taskId: item.taskId,
            description: item.description,
            startDatetime: item.startDatetime.slice(0, 16), // datetime-local format yyyy-MM-ddThh:mm
            endDatetime: item.endDatetime.slice(0, 16),
            isAllDay: item.isAllDay
        });
      } else {
        // Create mode
        const start = initialRange ? initialRange.start : (initialDate || new Date());
        // Default end is 1 hour later
        const end = initialRange ? initialRange.end : new Date(start.getTime() + 60 * 60 * 1000);
        
        // Format for input[type="datetime-local"]
        const toLocalISO = (d: Date) => {
            const pad = (n: number) => n < 10 ? '0' + n : n;
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setFormData({
          title: '',
          projectId: projectId || projects[0]?.id || '',
          taskId: '',
          description: '',
          startDatetime: toLocalISO(start),
          endDatetime: toLocalISO(end),
          isAllDay: false
        });
      }
    }
  }, [isOpen, item, initialDate, initialRange, projectId]);

  // Update tasks dropdown when project changes
  useEffect(() => {
      if (formData.projectId) {
          setTasks(api.getTasks(formData.projectId));
      } else {
          setTasks([]);
      }
  }, [formData.projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.projectId) return;

    const payload = {
        ...formData,
        startDatetime: new Date(formData.startDatetime!).toISOString(),
        endDatetime: new Date(formData.endDatetime!).toISOString(),
    };

    if (item) {
      api.updateCalendarItem(item.id, payload);
      showToast('Event updated successfully');
    } else {
      api.createCalendarItem(payload);
      showToast('Event created successfully');
    }
    onSuccess();
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent any parent clicks
      e.preventDefault(); // Prevent form submission
      
      if (!item) return;

      if (window.confirm('Are you sure you want to delete this event?')) {
          try {
              api.deleteCalendarItem(item.id);
              showToast('Event deleted.');
              onSuccess();
              onClose();
          } catch (error) {
              console.error(error);
              showToast('Failed to delete event', 'error');
          }
      }
  };

  const handleNavigateToProject = () => {
    if (formData.projectId) {
        navigate(`/project/${formData.projectId}`);
        onClose();
    }
  };

  const inputClasses = "w-full px-3 py-2 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-slate-600 hover:border-slate-600 transition-colors";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? "Edit Event" : "New Event"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Title</label>
          <input
            autoFocus
            type="text"
            className={inputClasses}
            placeholder="Event title"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Project</label>
                <select
                    className={inputClasses}
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                    disabled={!!projectId && !item} // Lock if creating from project view
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
                {item && (
                   <button 
                     type="button" 
                     onClick={handleNavigateToProject}
                     className="text-xs text-indigo-400 hover:underline mt-1"
                   >
                     Go to Project
                   </button>
                )}
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Link Task (Opt)</label>
                <select
                    className={inputClasses}
                    value={formData.taskId}
                    onChange={e => setFormData({...formData, taskId: e.target.value})}
                >
                    <option value="">None</option>
                    {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Start</label>
                <input 
                    type="datetime-local" 
                    className={inputClasses}
                    value={formData.startDatetime}
                    onChange={e => setFormData({...formData, startDatetime: e.target.value})}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">End</label>
                <input 
                    type="datetime-local" 
                    className={inputClasses}
                    value={formData.endDatetime}
                    onChange={e => setFormData({...formData, endDatetime: e.target.value})}
                    required
                />
            </div>
        </div>

        <div className="flex items-center">
             <input 
                type="checkbox" 
                id="isAllDay" 
                checked={formData.isAllDay} 
                onChange={e => setFormData({...formData, isAllDay: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-slate-700 rounded focus:ring-indigo-500 bg-slate-900"
             />
             <label htmlFor="isAllDay" className="ml-2 text-sm text-slate-300">All Day Event</label>
        </div>

        <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Description</label>
            <textarea
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Details..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-800 mt-2">
            {item ? (
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Delete</span>
                </button>
            ) : <div />}
            
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 font-medium rounded-lg hover:bg-slate-700 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition shadow-sm border border-indigo-500"
                >
                    {item ? 'Save Changes' : 'Create Event'}
                </button>
            </div>
        </div>
      </form>
    </Modal>
  );
};
