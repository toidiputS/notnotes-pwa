
import React from 'react';
import { Project, Task, TaskStatus } from '../../types';
import { api } from '../../services/db';
import { Clock } from '../../components/ui/Icons';

export default function ProjectOverview({ project }: { project: Project }) {
  const tasks = api.getTasks(project.id);
  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const totalCount = tasks.length;
  
  // Logic for next up: In Progress first, then Backlog
  const upcomingTasks = tasks
    .filter(t => t.status !== TaskStatus.DONE)
    .sort((a, b) => {
        if (a.status === TaskStatus.IN_PROGRESS && b.status !== TaskStatus.IN_PROGRESS) return -1;
        if (a.status !== TaskStatus.IN_PROGRESS && b.status === TaskStatus.IN_PROGRESS) return 1;
        return 0;
    })
    .slice(0, 3);

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-6xl animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="mb-24 space-y-10">
        <div className="flex items-center space-x-4 text-[9px] font-bold text-slate-700 uppercase tracking-[0.5em]">
          <span className="w-16 h-[1px] bg-white/10"></span>
          <span>Project Specification</span>
        </div>
        <h1 className="text-8xl font-serif italic text-white tracking-tighter leading-[0.8] lowercase">
          Mission <br />
          <span className="text-slate-700 ml-16">Briefing</span>
        </h1>
        <p className="text-3xl text-slate-400 font-serif italic leading-relaxed max-w-4xl">
          {project.description || "No description provided for this project."}
        </p>
        <div className="flex flex-wrap gap-4 pt-8">
          {project.tags.map(tag => (
            <span key={tag} className="px-6 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] hover:border-white/20 hover:text-white transition-all cursor-default">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
        {/* Progress Card */}
        <div className="md:col-span-2 glass rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
             <div className="text-[12rem] font-serif italic text-white tabular-nums leading-none">{progress}%</div>
          </div>
          <div className="relative z-10 space-y-12">
            <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">Deployment Progress</div>
            <div className="flex items-end justify-between">
              <span className="text-9xl font-serif italic text-white tracking-tighter tabular-nums leading-none">{progress}%</span>
              <div className="text-right">
                <div className="text-3xl font-serif italic text-slate-400 tracking-tight lowercase">{completedCount} / {totalCount}</div>
                <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">Tasks Finalized</div>
              </div>
            </div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="bg-white h-full rounded-full transition-all duration-[2s] ease-[cubic-bezier(0.2,0,0,1)] shadow-[0_0_30px_rgba(255,255,255,0.3)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dates Card */}
        <div className="glass rounded-[3rem] p-12 shadow-2xl flex flex-col justify-between">
          <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-12">Timeline</div>
          <div className="space-y-12">
             <div className="space-y-3">
               <div className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.3em]">Commencement</div>
               <div className="font-mono text-2xl text-slate-400 tracking-tighter">{project.startDate || '--'}</div>
             </div>
             <div className="space-y-3 pt-10 border-t border-white/5">
               <div className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.3em]">Target Delivery</div>
               <div className="font-mono text-2xl text-white tracking-tighter">{project.targetDate || '--'}</div>
             </div>
          </div>
        </div>
      </section>

      {/* Next Up Section */}
      <section className="space-y-12">
        <div className="flex items-center justify-between">
          <h3 className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">Active Operations</h3>
          <div className="h-[1px] flex-1 bg-white/5 mx-10"></div>
        </div>
        
        {upcomingTasks.length === 0 ? (
          <div className="p-24 border border-dashed border-white/5 rounded-[3rem] text-center bg-white/[0.02]">
            <p className="text-slate-700 font-bold uppercase tracking-[0.4em] text-[10px]">All systems operational. No pending tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingTasks.map(task => (
              <div key={task.id} className="group p-8 glass rounded-[2.5rem] hover:border-white/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col justify-between min-h-[200px]">
                <div className="space-y-6">
                  <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${task.status === TaskStatus.IN_PROGRESS ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-slate-800'}`}></div>
                  <span className="text-slate-300 font-serif italic text-2xl leading-tight tracking-tight group-hover:text-white transition-all lowercase">{task.title}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] pt-6 mt-6 border-t border-white/5">
                    <Clock size={12} className="mr-3" />
                    {task.dueDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
