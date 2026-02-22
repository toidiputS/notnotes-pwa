
import React, { useState, useEffect } from 'react';
import { api } from '../services/db';
import { CalendarItem, Project } from '../types';
import { CalendarItemModal } from '../components/CalendarItemModal';
import { ChevronRight, ChevronDown, Plus, LayoutGrid, List, Clock, Calendar as CalIcon } from '../components/ui/Icons';

type ViewMode = 'month' | 'week' | 'list';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<{start: Date, end: Date} | undefined>(undefined);

  const refresh = () => {
      setItems(api.getCalendarItems());
      setProjects(api.getProjects());
  };

  useEffect(() => {
    refresh();
  }, []);

  // -- Navigation Helpers --
  const next = () => {
      const d = new Date(currentDate);
      if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
      else if (viewMode === 'week') d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1); // List view jumps by month too
      setCurrentDate(d);
  };
  
  const prev = () => {
      const d = new Date(currentDate);
      if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
      else if (viewMode === 'week') d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const getMonthTitle = (d: Date) => d.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // -- Utilities --
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getProjectColor = (pid: string) => {
      // Deterministic pseudo-random color based on project ID char code sum
      if (!pid) return 'bg-slate-800 text-slate-300 border-slate-700';
      const sum = pid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hues = [
        'bg-blue-500/10 text-blue-400 border-blue-500/20', 
        'bg-green-500/10 text-green-400 border-green-500/20', 
        'bg-purple-500/10 text-purple-400 border-purple-500/20', 
        'bg-orange-500/10 text-orange-400 border-orange-500/20', 
        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        'bg-rose-500/10 text-rose-400 border-rose-500/20'
      ];
      return hues[sum % hues.length];
  };

  // -- Event Handling --
  const handleDayClick = (date: Date) => {
      setSelectedDate(date);
      setEditingItem(undefined);
      setSelectedRange(undefined);
      setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, item: CalendarItem) => {
      e.stopPropagation();
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      
      setSelectedRange({ start, end });
      setEditingItem(undefined);
      setIsModalOpen(true);
  };

  // -- Renderers --

  const MonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay(); // 0 = Sun

      const days = [];
      // Empty slots
      for (let i = 0; i < startDayOfWeek; i++) {
          days.push(null);
      }
      // Days
      for (let i = 1; i <= daysInMonth; i++) {
          days.push(new Date(year, month, i));
      }

      return (
          <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-lg overflow-hidden border border-slate-800 shadow-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-900 p-2 text-xs font-semibold text-center text-slate-500 uppercase tracking-wide">{d}</div>
              ))}
              {days.map((d, idx) => {
                  if (!d) return <div key={`empty-${idx}`} className="bg-slate-900/50 h-28 md:h-32" />;
                  
                  const dayEvents = items.filter(i => isSameDay(new Date(i.startDatetime), d));
                  const isToday = isSameDay(d, new Date());

                  return (
                      <div 
                        key={d.toISOString()} 
                        className={`bg-slate-900 h-28 md:h-32 p-1 relative hover:bg-slate-800 transition cursor-pointer group`}
                        onClick={() => handleDayClick(d)}
                      >
                          <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                              {d.getDate()}
                          </div>
                          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-30px)] custom-scrollbar">
                              {dayEvents.map(ev => (
                                  <div 
                                    key={ev.id} 
                                    onClick={(e) => handleEventClick(e, ev)}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer hover:brightness-125 transition ${getProjectColor(ev.projectId)}`}
                                  >
                                      {ev.title}
                                  </div>
                              ))}
                          </div>
                          {/* Quick add + button on hover */}
                          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition">
                              <div className="bg-slate-700 text-indigo-400 p-1 rounded hover:bg-slate-600"><Plus size={14} /></div>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  const WeekView = () => {
    // Calculate start of week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for(let i=0; i<7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
    }
    const hours = Array.from({length: 24}, (_, i) => i);

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] overflow-hidden bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-slate-800 flex-shrink-0 bg-slate-900">
                <div className="p-2 border-r border-slate-800/50"></div> {/* Time col header */}
                {weekDays.map(d => {
                    const isToday = isSameDay(d, new Date());
                    return (
                        <div key={d.toISOString()} className={`p-2 text-center border-r border-slate-800/50 last:border-0 ${isToday ? 'bg-indigo-500/10' : ''}`}>
                            <div className="text-xs text-slate-500 uppercase font-bold">{d.toLocaleString('en-us', {weekday: 'short'})}</div>
                            <div className={`text-sm font-semibold inline-block w-7 h-7 leading-7 rounded-full mt-1 ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-200'}`}>{d.getDate()}</div>
                        </div>
                    );
                })}
            </div>

            {/* Scrollable Grid */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-8 relative">
                     {/* Time Labels */}
                     <div className="border-r border-slate-800 bg-slate-900/50">
                         {hours.map(h => (
                             <div key={h} className="h-12 border-b border-slate-800 text-[10px] text-slate-500 text-right pr-2 pt-1 relative -top-2">
                                 {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
                             </div>
                         ))}
                     </div>
                     
                     {/* Days Columns */}
                     {weekDays.map(d => {
                         const dayEvents = items.filter(i => isSameDay(new Date(i.startDatetime), d));

                         return (
                             <div key={d.toISOString()} className="relative border-r border-slate-800 last:border-0 min-w-0">
                                 {/* Time slots backgrounds */}
                                 {hours.map(h => (
                                     <div 
                                        key={h} 
                                        className="h-12 border-b border-slate-800 hover:bg-slate-800/30 cursor-pointer"
                                        onClick={() => handleTimeSlotClick(d, h)}
                                     ></div>
                                 ))}
                                 
                                 {/* Events Overlay */}
                                 {dayEvents.map(ev => {
                                     const start = new Date(ev.startDatetime);
                                     const end = new Date(ev.endDatetime);
                                     // Simple positioning logic: relative to start of day
                                     const startMins = start.getHours() * 60 + start.getMinutes();
                                     let durationMins = (end.getTime() - start.getTime()) / (1000 * 60);
                                     if (durationMins < 30) durationMins = 30; // Min visual height

                                     const top = (startMins / 60) * 48; // 48px is height of 1 hour (h-12)
                                     const height = (durationMins / 60) * 48; 

                                     return (
                                         <div 
                                            key={ev.id}
                                            onClick={(e) => handleEventClick(e, ev)}
                                            className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-[10px] border shadow-sm cursor-pointer hover:brightness-125 overflow-hidden z-10 ${getProjectColor(ev.projectId)}`}
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            title={`${ev.title} (${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})`}
                                         >
                                             <div className="font-semibold truncate leading-tight">{ev.title}</div>
                                             {height > 30 && (
                                                <div className="opacity-75 truncate">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         );
                     })}
                </div>
            </div>
        </div>
    );
  };

  const ListView = () => {
    // Group items by month/day for the selected month
    const filteredItems = items
        .filter(i => {
            const d = new Date(i.startDatetime);
            return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        })
        .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime());
    
    return (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden min-h-[500px] shadow-sm">
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="bg-slate-800 p-4 rounded-full mb-4 border border-slate-700">
                        <CalIcon size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No events for {getMonthTitle(currentDate)}</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs">
                        Your schedule is clear. Click "Today" to see current events or switch views to add one.
                    </p>
                    <button onClick={() => { setEditingItem(undefined); setIsModalOpen(true); }} className="mt-4 text-indigo-400 font-medium text-sm hover:underline">
                        Create an event
                    </button>
                </div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {filteredItems.map(item => {
                        const start = new Date(item.startDatetime);
                        const end = new Date(item.endDatetime);
                        const project = projects.find(p => p.id === item.projectId);
                        return (
                            <div key={item.id} onClick={(e) => handleEventClick(e, item)} className="flex items-center p-4 hover:bg-slate-800 cursor-pointer group transition">
                                <div className="w-16 text-center flex-shrink-0">
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">{start.toLocaleString('en-us', {weekday:'short'})}</div>
                                    <div className={`text-xl font-bold ${isSameDay(start, new Date()) ? 'text-indigo-400' : 'text-slate-200'}`}>{start.getDate()}</div>
                                </div>
                                <div className="mx-4 w-1 h-10 bg-slate-800 rounded-full group-hover:bg-indigo-500/50 transition"></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-200 text-sm truncate">{item.title}</h4>
                                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                                        <Clock size={12} />
                                        <span>
                                            {item.isAllDay ? 'All Day' : `${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
                                        </span>
                                    </div>
                                    {item.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>}
                                </div>
                                <div className="ml-4">
                                    <span className={`text-[10px] px-2 py-1 rounded border font-medium whitespace-nowrap ${getProjectColor(item.projectId)}`}>
                                        {project?.title || 'Unknown Project'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full space-y-6 flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center">
                <CalIcon className="mr-3 text-indigo-500" size={28} />
                Calendar
            </h1>
            <div className="flex items-center bg-slate-800 rounded-lg p-1 text-sm font-medium border border-slate-700">
                <button 
                  onClick={() => setViewMode('month')} 
                  className={`px-3 py-1 rounded-md transition ${viewMode === 'month' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                >Month</button>
                <button 
                  onClick={() => setViewMode('week')} 
                  className={`px-3 py-1 rounded-md transition ${viewMode === 'week' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                >Week</button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`px-3 py-1 rounded-md transition ${viewMode === 'list' ? 'bg-slate-700 shadow text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                >List</button>
            </div>
        </div>

        <div className="flex items-center space-x-3">
             {/* Navigation */}
             <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg shadow-sm">
                <button onClick={prev} className="p-1.5 hover:bg-slate-700 text-slate-400 border-r border-slate-700"><ChevronDown size={18} className="rotate-90" /></button>
                <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium hover:bg-slate-700 text-slate-300">Today</button>
                <button onClick={next} className="p-1.5 hover:bg-slate-700 text-slate-400 border-l border-slate-700"><ChevronRight size={18} /></button>
             </div>
             
             <div className="text-lg font-semibold text-slate-200 w-40 text-center">
                 {getMonthTitle(currentDate)}
             </div>

             <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="hidden md:block text-xs font-medium text-slate-500 hover:text-indigo-400 hover:underline">
                Google Calendar ↗
             </a>
        </div>
      </div>

      <div className="flex-1 min-h-0">
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'list' && <ListView />}
      </div>

      <CalendarItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        item={editingItem}
        initialDate={selectedDate}
        initialRange={selectedRange}
      />
    </div>
  );
}
