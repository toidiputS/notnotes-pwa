
import React, { useState } from 'react';
import { api } from '../../services/db';
import { Note } from '../../types';
import { FileText, Plus, PanelLeftClose, PanelLeftOpen, Trash2 } from '../../components/ui/Icons';
import { useToast } from '../../components/ui/Toast';

export default function ProjectDocs({ projectId }: { projectId: string }) {
  const [notes, setNotes] = useState(api.getNotes(projectId));
  const [activeNote, setActiveNote] = useState<Note | null>(notes.length > 0 ? notes[0] : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isListOpen, setIsListOpen] = useState(true);
  const { showToast } = useToast();

  const refresh = () => {
    const updated = api.getNotes(projectId);
    setNotes(updated);
    if (activeNote) {
      const fresh = updated.find(n => n.id === activeNote.id);
      if (fresh) setActiveNote(fresh);
      else setActiveNote(null); // Clear active note if it was deleted
    }
  };

  const handleCreate = () => {
    const n = api.createNote({ projectId, title: 'Untitled Doc', content: '# New Doc\nStart typing...' });
    refresh();
    setActiveNote(n);
    startEdit(n);
    if (!isListOpen) setIsListOpen(true);
    showToast('Document created');
  };

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    // Immediate deletion without confirmation to ensure responsiveness
    api.deleteNote(noteId);
    
    // If we deleted the active note, clear selection immediately
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setIsEditing(false);
    }
    
    // Refresh the list
    refresh();
    showToast('Document deleted', 'success');
  };

  const startEdit = (n: Note) => {
    setActiveNote(n);
    setEditTitle(n.title);
    setEditContent(n.content);
    setIsEditing(true);
  };

  const save = () => {
    if (activeNote) {
      api.updateNote(activeNote.id, { title: editTitle, content: editContent });
      setIsEditing(false);
      refresh();
      showToast('Document saved');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] border border-slate-800 rounded-xl overflow-hidden relative">
      {/* List Sidebar */}
      <div className={`
        bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out
        ${isListOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center whitespace-nowrap overflow-hidden">
          <h3 className="font-semibold text-slate-300">Docs</h3>
          <div className="flex items-center space-x-1">
             <button onClick={handleCreate} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300" title="New Doc">
                <Plus size={18} />
             </button>
             <button onClick={() => setIsListOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-600 hover:text-indigo-400" title="Hide List">
                <PanelLeftClose size={16} />
             </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`group flex items-center w-full rounded-lg ${activeNote?.id === note.id ? 'bg-slate-800 shadow ring-1 ring-slate-700' : 'hover:bg-slate-800/50'}`}
            >
              <button
                onClick={() => { setActiveNote(note); setIsEditing(false); }}
                className={`flex-1 text-left px-3 py-2 text-sm flex items-center space-x-2 overflow-hidden ${activeNote?.id === note.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
              >
                <FileText size={14} className="flex-shrink-0" />
                <span className="truncate font-medium">{note.title}</span>
              </button>
              <button
                onClick={(e) => handleDelete(e, note.id)}
                className={`p-1.5 mr-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-slate-700/50 transition-opacity ${activeNote?.id === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                title="Delete Doc"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-600">
              No docs yet.
            </div>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0 relative">
        {!isListOpen && (
           <button 
             onClick={() => setIsListOpen(true)}
             className="absolute top-4 left-4 z-10 p-1.5 bg-slate-800 border border-slate-700 rounded shadow-sm text-slate-500 hover:text-indigo-400 transition"
             title="Show List"
           >
             <PanelLeftOpen size={16} />
           </button>
        )}

        {activeNote ? (
          <>
            <div className={`border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900 ${!isListOpen ? 'pl-14' : ''}`}>
              {isEditing ? (
                 <input 
                   type="text" 
                   value={editTitle} 
                   onChange={e => setEditTitle(e.target.value)}
                   className="font-bold text-xl text-slate-100 border-none focus:ring-0 w-full bg-transparent p-0"
                 />
              ) : (
                <h2 className="font-bold text-xl text-slate-100 truncate">{activeNote.title}</h2>
              )}
              
              <div className="flex-shrink-0 ml-4">
                {isEditing ? (
                  <button onClick={save} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-500 shadow-sm border border-indigo-500">Save</button>
                ) : (
                  <button onClick={() => startEdit(activeNote)} className="px-4 py-1.5 text-slate-500 hover:text-indigo-400 text-sm font-medium hover:bg-slate-800 rounded">Edit</button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isEditing ? (
                <textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full h-full resize-none border-none outline-none text-slate-300 font-mono text-sm leading-relaxed bg-transparent p-0"
                  placeholder="Type markdown here..."
                />
              ) : (
                <div className="prose prose-invert prose-slate max-w-none">
                  {/* Simple text display preserving whitespace */}
                  <pre className="whitespace-pre-wrap font-sans text-slate-300">{activeNote.content}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600">
            Select or create a document
          </div>
        )}
      </div>
    </div>
  );
}
