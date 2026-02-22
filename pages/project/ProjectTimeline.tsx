
import React, { useState } from 'react';
import { api } from '../../services/db';
import { CalendarItemModal } from '../../components/CalendarItemModal';
import { Calendar, Plus, Clock, CheckSquare } from '../../components/ui/Icons';
import { CalendarItem, Task, TaskStatus } from '../../types';

export default function ProjectTimeline({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<CalendarItem[]>(api.getCalendarItems(projectId));
  const [tasks, setTasks] = useState<Task[]>(api.getTasks(projectId).filter(t => t.dueDate));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | undefined>(undefined);

  const refresh = () => {
    setItems(api.getCalendarItems(projectId));
    setTasks(api.getTasks(projectId).filter(t => t.dueDate));
  };

  const handleEdit = (item: CalendarItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleCreate = () => {
      setEditingItem(undefined);
      setIsModalOpen(true);
  };

  // Combine CalendarItems and Tasks for the timeline
  const combinedItems = [
    ...items.map(i => ({ 
        ...i, 
        _source: 'calendar' as const,
        _sortDate: i.startDatetime 
    })),
    ...tasks.map(t => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: `Status: ${t.status}`,
      startDatetime: t.dueDate!,
      endDatetime: t.dueDate!,
      isAllDay: true,
      type: 'task',
      _source: 'task' as const,
      _sortDate: `${t.dueDate}T09:00:00`,
      _originalTask: t
    }))
  ].sort((a, b) => new Date(a._sortDate).getTime() - new Date(b._sortDate).getTime());

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-semibold text-slate-200">Project Timeline</h3>
            <p className="text-sm text-slate-500">Key dates, milestones, and task deadlines.</p>
         </div>
         <button onClick={handleCreate} className="flex items-center space-x-2 bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-sm">
            <Plus size={16} />
            <span>Add Event</span>
         </button>
      </div>
      
      {combinedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-900 rounded-xl border border-dashed border-slate-800 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Calendar size={24} className="text-slate-600" />
              </div>
              <h4 className="text-slate-400 font-medium mb-1">No items scheduled</h4>
              <p className="text-slate-600 text-sm mb-4">Add events or assign due dates to tasks to populate the timeline.</p>
              <button onClick={handleCreate} className="text-indigo-400 font-medium text-sm hover:underline">
                  Create first event
              </button>
          </div>
      ) : (
          <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 py-2">
            {combinedItems.map(item => {
              const start = new Date(item._source === 'calendar' ? item.startDatetime : item._sortDate);
              const isPast = start < now;
              const isTask = item._source === 'task';
              const isDone = isTask && item._originalTask?.status === TaskStatus.DONE;
              
              return (
                <div key={`${item._source}-${item.id}`} className={`relative pl-6 group ${!isTask ? 'cursor-pointer' : ''}`} onClick={() => !isTask && handleEdit(item as CalendarItem)}>
                  {/* Timeline Dot */}
                  <div className={`
                    absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 transition z-10 flex items-center justify-center
                    ${isTask 
                        ? (isDone ? 'bg-emerald-900 border-emerald-500' : 'bg-slate-900 border-indigo-400') 
                        : (isPast ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-indigo-500 group-hover:bg-indigo-500')
                    }
                  `}>
                      {isTask && <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>}
                  </div>

                  <div className={`
                    rounded-lg p-4 shadow-sm border transition
                    ${isTask 
                        ? 'bg-slate-900/30 border-dashed border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-900 border-slate-800 group-hover:shadow-md group-hover:border-indigo-500/30'
                    }
                  `}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                          {isTask && <CheckSquare size={16} className={isDone ? 'text-emerald-500' : 'text-slate-500'} />}
                          <h4 className={`text-base font-semibold ${isPast || isDone ? 'text-slate-500' : 'text-slate-200'} ${isDone ? 'line-through' : ''}`}>
                             {item.title}
                          </h4>
                      </div>
                      
                      <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${isPast ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        <Calendar size={12} className="mr-1" />
                        {start.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                       {!isTask && (
                           <div className="flex items-center">
                               <Clock size={12} className="mr-1" />
                               {item.isAllDay ? 'All Day' : `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(item.endDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                           </div>
                       )}
                       {isTask && (
                           <div className="flex items-center">
                               <span className={`uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded border ${
                                   isDone 
                                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                   : 'bg-slate-800 text-slate-400 border-slate-700'
                               }`}>
                                   {item._originalTask?.status}
                               </span>
                           </div>
                       )}
                       {item.type && item.type !== 'event' && !isTask && <span className="uppercase text-[10px] tracking-wide bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{item.type}</span>}
                    </div>
                    {item.description && <p className="text-sm text-slate-400 mt-2">{item.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
      )}

      <CalendarItemModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSuccess={refresh}
         item={editingItem}
         projectId={projectId}
      />
    </div>
  );
}
