
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/db';
import { Task, Note } from '../types';
import { FileText, Plus, Trash2, Clock } from './ui/Icons';
import { useToast } from './ui/Toast';

interface TaskNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onRefreshTask: () => void;
}

export const TaskNotesModal: React.FC<TaskNotesModalProps> = ({ isOpen, onClose, task, onRefreshTask }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { showToast } = useToast();

  const loadNotes = () => {
    setNotes(api.getNotesByTask(task.id));
  };

  useEffect(() => {
    if (isOpen) loadNotes();
  }, [isOpen, task.id]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    api.createNote({
      projectId: task.projectId,
      taskId: task.id,
      title: `Note for ${task.title}`,
      content: newNoteContent,
    });
    setNewNoteContent('');
    loadNotes();
    onRefreshTask();
    showToast('Note added');
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) return;
    api.updateNote(id, { content: editContent });
    setEditingNoteId(null);
    loadNotes();
    showToast('Note updated');
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Delete this note?')) {
      api.deleteNote(id);
      loadNotes();
      onRefreshTask();
      showToast('Note removed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Notes: ${task.title}`}>
      <div className="space-y-6">
        {/* Quick Add */}
        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none placeholder-slate-600 min-h-[80px] resize-none"
            placeholder="Add a quick note or update..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNoteContent.trim()}
              className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition border border-indigo-500"
            >
              <Plus size={14} />
              <span>Add Note</span>
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Activity Logs</h4>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-600 italic text-sm">
                No notes found for this task.
              </div>
            ) : (
              notes.sort((a, b) => b.createdAt - a.createdAt).map(note => (
                <div key={note.id} className="group bg-slate-800/50 rounded-lg p-3 border border-slate-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-[10px] text-slate-500">
                      <Clock size={10} className="mr-1" />
                      {new Date(note.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); }} className="text-slate-500 hover:text-indigo-400">
                        <FileText size={12} />
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full px-2 py-1.5 text-sm bg-slate-900 border border-indigo-500/50 text-slate-200 rounded focus:outline-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setEditingNoteId(null)} className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-300">Cancel</button>
                        <button onClick={() => handleUpdateNote(note.id)} className="text-[10px] font-bold text-indigo-400 uppercase hover:text-indigo-300">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
