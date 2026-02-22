import React, { useMemo } from 'react';
import { Project, TaskStatus } from '../../types';
import { api } from '../../services/db';
import { DownloadCloud, Printer, CheckCircle, Circle, FileText } from '../../components/ui/Icons';
import { exportHelpers } from '../../utils/exportHelpers';

export default function ProjectPacket({ project }: { project: Project }) {
    const tasks = api.getTasks(project.id);
    const notes = api.getNotes(project.id);

    const markdownContent = useMemo(() => {
        return exportHelpers.generateMarkdownDossier(project, tasks, notes);
    }, [project, tasks, notes]);

    const handleDownloadMd = () => {
        exportHelpers.downloadAsMarkdown(`Final_Packet_${project.title}`, markdownContent);
    };

    const handlePrintPdf = () => {
        exportHelpers.printAsPDF();
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-1000">
            {/* Dossier Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 print:hidden">
                <div>
                    <h2 className="text-5xl font-serif italic text-white tracking-tighter lowercase">
                        final packet
                    </h2>
                    <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">
                        Compiled Dossier // {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleDownloadMd}
                        className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl text-slate-300 hover:text-indigo-400 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <DownloadCloud size={16} />
                        <span>Download .MD</span>
                    </button>

                    <button
                        onClick={handlePrintPdf}
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-xl text-white transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Printer size={16} />
                        <span>Save PDF</span>
                    </button>
                </div>
            </div>

            {/* The Printable Dossier Container */}
            <div className="glass rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl print:shadow-none print:border-none print:p-0 print:bg-transparent">

                {/* Mission Brief */}
                <div className="mb-16 print:mb-8">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-4">Mission Briefing</div>
                    <h1 className="text-4xl font-serif italic text-white mb-6 tracking-tight lowercase">{project.title}</h1>
                    <p className="text-lg text-slate-400 leading-relaxed font-serif italic">
                        {project.description || "No mission description provided."}
                    </p>
                </div>

                {/* Task Summary */}
                {tasks.length > 0 && (
                    <div className="mb-16 print:mb-8">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-4">Task Operations</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-start space-x-4 bg-black/20 p-4 rounded-2xl border border-white/5 print:border-slate-300">
                                    <div className="mt-1">
                                        {task.status === TaskStatus.DONE ?
                                            <CheckCircle size={18} className="text-emerald-500" /> :
                                            <Circle size={18} className="text-slate-600" />
                                        }
                                    </div>
                                    <div>
                                        <div className={`font-medium ${task.status === TaskStatus.DONE ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-100'}`}>
                                            {task.title}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Status: {task.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Artifacts Compilation */}
                <div>
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-4">Gathered Artifacts</div>

                    {notes.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-serif italic">No artifacts have been collected for this project yet.</div>
                    ) : (
                        <div className="space-y-12">
                            {notes.map((note, idx) => (
                                <div key={note.id} className="space-y-4">
                                    <div className="flex items-center space-x-3 text-slate-300">
                                        <FileText size={18} className="text-indigo-400" />
                                        <h3 className="text-xl font-serif italic tracking-tight">{note.title}</h3>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-widest pl-7">
                                        Collected: {new Date(note.createdAt).toLocaleString()}
                                    </div>
                                    <div className="pl-7 pt-4 text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                        {note.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
