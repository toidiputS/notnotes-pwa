
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../types';
import { api } from '../../services/db';
import { Plus, MoreVertical, Calendar, X, Edit3, CheckSquare, Search, Filter, FileText } from '../../components/ui/Icons';
import { TaskNotesModal } from '../../components/TaskNotesModal';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onStatusChange: (id: string, s: TaskStatus) => void;
  onRefresh: () => void;
}

const isOverdue = (dateStr?: string, status?: TaskStatus) => {
  if (!dateStr || status === TaskStatus.DONE) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onUpdate, 
  onStatusChange,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.dueDate || '');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    setNotesCount(api.getNotesByTask(task.id).length);
  }, [task.id, isNotesOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onUpdate(task.id, { title, dueDate: date });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTitle(task.title);
    setDate(task.dueDate || '');
    setIsEditing(false);
  };

  const overdue = isOverdue(task.dueDate, task.status);

  if (isEditing) {
    return (
      <div className="bg-slate-800 p-3 rounded-xl shadow-lg border border-indigo-500/30 ring-2 ring-indigo-500/20 z-10 relative animate-in fade-in zoom-in duration-200">
        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Title</label>
        <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full text-sm bg-slate-900 text-slate-100 border border-slate-700 rounded-lg mb-2 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-900 transition-all"
            autoFocus
            onKeyDown={(e) => { if(e.key === 'Enter') handleSave(); if(e.key === 'Escape') cancelEdit(); }}
        />
        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Due</label>
        <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-lg mb-3 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-900 transition-all"
        />
        <div className="flex justify-end space-x-2">
            <button onClick={cancelEdit} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition"><X size={14} /></button>
            <button onClick={handleSave} className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition text-xs font-medium shadow-sm border border-indigo-500">
              <span>Save</span>
            </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-slate-800 p-4 rounded-xl border transition-all duration-200 group relative ${overdue ? 'border-red-900/50 shadow-sm bg-red-950/10' : 'border-slate-700 shadow-[0_2px_8px_rgb(0,0,0,0.2)] hover:shadow-lg hover:border-indigo-500/30'}`}>
          <div className="flex justify-between items-start gap-2">
              <p className={`text-sm font-medium mb-2 leading-relaxed break-words ${task.status === TaskStatus.DONE ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                {task.title}
              </p>
              <button 
                onClick={() => setIsEditing(true)} 
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 transition flex-shrink-0 p-1"
                title="Edit Task"
              >
                  <Edit3 size={12} />
              </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between min-h-[20px]">
              <div className="flex items-center space-x-2">
                  {task.dueDate ? (
                      <div className={`flex items-center text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                          overdue 
                            ? 'text-red-400 bg-red-500/10 border-red-500/20 font-bold' 
                            : 'text-slate-400 bg-slate-900/50 border-slate-700'
                      }`}>
                          <Calendar size={10} className={`mr-1 ${overdue ? 'text-red-400' : 'text-slate-500'}`} />
                          <span>{task.dueDate}</span>
                      </div>
                  ) : null}
                  
                  {notesCount > 0 && (
                    <button 
                      onClick={() => setIsNotesOpen(true)}
                      className="flex items-center text-[10px] px-1.5 py-0.5 rounded border text-indigo-400 bg-indigo-500/10 border-indigo-500/20 font-medium"
                    >
                      <FileText size={10} className="mr-1" />
                      <span>{notesCount}</span>
                    </button>
                  )}
                  {notesCount === 0 && (
                     <button 
                     onClick={() => setIsNotesOpen(true)}
                     className="opacity-0 group-hover:opacity-100 flex items-center text-[10px] px-1.5 py-0.5 rounded border text-slate-500 bg-slate-800 border-slate-700 hover:text-slate-300"
                   >
                     <FileText size={10} />
                   </button>
                  )}
              </div>
              
              <div className="flex space-x-1 ml-auto pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.status !== TaskStatus.BACKLOG && (
                    <button onClick={() => onStatusChange(task.id, TaskStatus.BACKLOG)} className="w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-slate-500 ring-1 ring-slate-800" title="Move to Backlog" />
                  )}
                  {task.status !== TaskStatus.IN_PROGRESS && (
                    <button onClick={() => onStatusChange(task.id, TaskStatus.IN_PROGRESS)} className="w-2.5 h-2.5 rounded-full bg-blue-600 hover:bg-blue-500 ring-1 ring-slate-800" title="Move to In Progress" />
                  )}
                  {task.status !== TaskStatus.DONE && (
                    <button onClick={() => onStatusChange(task.id, TaskStatus.DONE)} className="w-2.5 h-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 ring-1 ring-slate-800" title="Move to Done" />
                  )}
              </div>
          </div>
      </div>
      <TaskNotesModal 
        isOpen={isNotesOpen} 
        onClose={() => setIsNotesOpen(false)} 
        task={task} 
        onRefreshTask={onRefresh}
      />
    </>
  )
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, s: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onRefresh: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  status, 
  tasks, 
  onStatusChange,
  onUpdateTask,
  onRefresh
}) => {
  return (
    <div className="flex-1 min-w-[280px] flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="font-bold text-slate-500 text-xs flex items-center space-x-2 tracking-widest uppercase">
          <span>{status}</span>
        </h4>
        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">{tasks.length}</span>
      </div>
      <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar px-1 pb-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 p-2">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange} 
            onUpdate={onUpdateTask}
            onRefresh={onRefresh}
          />
        ))}
        {tasks.length === 0 && (
            <div className="h-24 flex items-center justify-center text-slate-600 text-xs font-medium italic">
                Empty
            </div>
        )}
      </div>
    </div>
  );
};

export default function ProjectTasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState(api.getTasks(projectId));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  const refreshTasks = () => setTasks(api.getTasks(projectId));

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    api.updateTask(taskId, { status: newStatus });
    refreshTasks();
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    api.updateTask(taskId, updates);
    refreshTasks();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    api.createTask({ 
      projectId, 
      title: newTaskTitle, 
      status: TaskStatus.BACKLOG, 
      dueDate: newTaskDate || undefined
    });
    setNewTaskTitle('');
    setNewTaskDate('');
    setIsAdding(false);
    refreshTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterDate !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (filterDate === 'no-date') return !task.dueDate;
        if (!task.dueDate) return false;
        if (filterDate === 'overdue') return task.dueDate < today && task.status !== TaskStatus.DONE;
        if (filterDate === 'today') return task.dueDate === today;
        if (filterDate === 'week') {
            const nextWeek = new Date();
            nextWeek.setDate(new Date().getDate() + 7);
            return task.dueDate >= today && task.dueDate <= nextWeek.toISOString().split('T')[0];
        }
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">Task Board</h3>
                <p className="text-sm text-slate-400 mt-1">Manage project deliverables.</p>
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium shadow-lg shadow-black/20 active:scale-95 border border-slate-700"
            >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Task</span>
            </button>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-slate-900 focus:border-indigo-500/50 transition-all shadow-sm"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                <div className="relative flex-shrink-0">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm cursor-pointer hover:border-slate-700 transition-all appearance-none"
                    >
                        <option value="all">All Status</option>
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="relative flex-shrink-0">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                        value={filterDate} 
                        onChange={e => setFilterDate(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm cursor-pointer hover:border-slate-700 transition-all appearance-none"
                    >
                        <option value="all">Any Date</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Due Today</option>
                        <option value="week">Due This Week</option>
                        <option value="no-date">No Date</option>
                    </select>
                </div>
                
                {(searchQuery || filterStatus !== 'all' || filterDate !== 'all') && (
                    <button 
                        onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterDate('all'); }}
                        className="px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
      </div>

      {isAdding && (
        <div className="mb-8 bg-slate-900 border border-indigo-500/20 p-5 rounded-2xl animate-in slide-in-from-top-2 shadow-xl shadow-black/20 ring-1 ring-indigo-500/10">
           <h4 className="text-sm font-bold text-slate-200 mb-3">Create New Task</h4>
           <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                className="w-full px-4 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder-slate-600"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full md:w-auto px-4 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2 md:pt-0">
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition border border-indigo-500">Add Task</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex space-x-6 h-[calc(100vh-340px)] min-h-[400px] min-w-max pb-4">
          {[TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.DONE].map(status => (
            <KanbanColumn 
              key={status}
              status={status} 
              tasks={filteredTasks.filter(t => t.status === status)} 
              onStatusChange={handleStatusChange}
              onUpdateTask={handleUpdateTask}
              onRefresh={refreshTasks}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
