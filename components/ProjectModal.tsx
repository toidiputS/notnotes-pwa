
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/db';
import { Project, ProjectStatus, Priority } from '../types';
import { CheckCircle, X } from './ui/Icons';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project; // If provided, we are in Edit mode
}

const PROJECT_COLORS = [
  '#64748b', // Slate
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
];

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: Priority.MEDIUM,
    tags: [],
    color: '#3b82f6'
  });
  const [tagInput, setTagInput] = useState('');

  // Reset or Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          tags: project.tags || [],
          startDate: project.startDate,
          targetDate: project.targetDate,
          color: project.color || '#3b82f6'
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: ProjectStatus.PLANNING,
          priority: Priority.MEDIUM,
          tags: [],
          startDate: '',
          targetDate: '',
          color: '#3b82f6'
        });
      }
      setTagInput('');
    }
  }, [isOpen, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    if (project) {
      api.updateProject(project.id, formData);
    } else {
      api.createProject(formData);
    }

    onSuccess();
    onClose();
  };

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!tagInput.trim()) return;
      
      const newTag = tagInput.trim();
      const currentTags = formData.tags || [];
      
      if (!currentTags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...currentTags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  const inputClasses = "w-full px-3 py-2 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder-slate-600 hover:border-slate-600 transition-colors";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={project ? "Edit Project" : "New Project"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Project Name</label>
          <input
            autoFocus
            type="text"
            className={inputClasses}
            placeholder="e.g. Q4 Marketing Campaign"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Description</label>
          <textarea
            rows={3}
            className={`${inputClasses} resize-none`}
            placeholder="Briefly describe the goals..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
            {formData.tags && formData.tags.length > 0 ? (
              formData.tags.map(tag => (
                <span key={tag} className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md text-xs font-medium flex items-center border border-slate-700">
                  #{tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)} 
                    className="ml-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-600 italic py-1">No tags added</span>
            )}
          </div>
          <input
            type="text"
            className={inputClasses}
            placeholder="Type tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Status</label>
            <select
              className={inputClasses}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
            >
              {Object.values(ProjectStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Priority</label>
            <select
              className={inputClasses}
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as Priority)}
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Project Color</label>
          <div className="flex flex-wrap gap-3">
            {PROJECT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-transparent ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {formData.color === color && <CheckCircle size={16} className="text-white drop-shadow-sm" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              className={inputClasses}
              value={formData.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Target Date</label>
            <input
              type="date"
              className={inputClasses}
              value={formData.targetDate || ''}
              onChange={(e) => handleChange('targetDate', e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
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
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
