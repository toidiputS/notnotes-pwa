
import React from 'react';
import { Archive, RotateCcw } from '../../components/ui/Icons';

export default function ProjectArchive() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
         <h3 className="text-lg font-semibold text-slate-200">Archive</h3>
         <p className="text-sm text-slate-500">View and restore archived items.</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        <div className="p-8 text-center text-slate-500">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto border border-slate-700">
             <Archive size={32} className="text-slate-600" />
           </div>
           <h4 className="text-slate-400 font-medium mb-1">No items in archive</h4>
           <p className="text-sm text-slate-600">Deleted items will appear here for 30 days.</p>
        </div>
      </div>
    </div>
  );
}
