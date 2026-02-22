import React from 'react';
import { Zap, ShieldAlert } from 'lucide-react';

export const TierOverlay = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                        <ShieldAlert size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Upgrade Required</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    NotNotes synchronization is a premium feature. To unlock your personal vault and automatically sync Oracle OS artifacts, you need to be on the <strong>NODE</strong>, <strong>SQUAD+</strong>, or <strong>PLATOON</strong> tier.
                </p>

                <div className="space-y-4">
                    <button className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                        <Zap size={18} />
                        <span>Upgrade to Node ($19/mo)</span>
                    </button>
                    <button className="w-full py-4 text-slate-400 hover:text-white font-medium text-sm transition-colors" onClick={() => window.location.href = 'https://itsyouonline.com'}>
                        View All Plans
                    </button>
                </div>
            </div>
        </div>
    );
};
