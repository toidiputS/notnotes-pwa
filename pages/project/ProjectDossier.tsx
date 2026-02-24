import React, { useState, useMemo } from 'react';
import { Project, Deck, DeckSlide } from '../../types';
import { api } from '../../services/db';
import { DownloadCloud, Printer, Layers, Zap, Trash2, ChevronRight } from '../../components/ui/Icons';
import { DeckSlideRenderer } from '../../components/DeckSlideRenderer';
import { exportHelpers } from '../../utils/exportHelpers';

type ViewMode = 'decks' | 'dossier';

export default function ProjectDossier({ project }: { project: Project }) {
    const [mode, setMode] = useState<ViewMode>('decks');
    const [refreshKey, setRefreshKey] = useState(0);

    const decks = useMemo(() => api.getDecks(project.id), [project.id, refreshKey]);
    const notes = api.getNotes(project.id);
    const tasks = api.getTasks(project.id);

    const handleDeleteDeck = (id: string) => {
        if (window.confirm('Remove this deck?')) {
            api.deleteDeck(id);
            setRefreshKey(k => k + 1);
        }
    };

    const handleBuildDossier = () => {
        setMode('dossier');
    };

    const handleDownloadMd = () => {
        const md = generateDossierMarkdown(decks, project);
        exportHelpers.downloadAsMarkdown(`Dossier_${project.title}`, md);
    };

    const handlePrintPdf = () => {
        exportHelpers.printAsPDF();
    };

    // ─── Dossier Mode ───
    if (mode === 'dossier' && decks.length >= 2) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-1000">
                {/* Dossier Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 print:hidden">
                    <div>
                        <h2 className="text-5xl font-serif italic text-white tracking-tighter lowercase">youniverse report</h2>
                        <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">
                            Cross-Territory Intelligence // {decks.length} Solutions // {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setMode('decks')}
                            className="px-6 py-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                            ← Back to Decks
                        </button>
                        <button onClick={handleDownloadMd}
                            className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl text-slate-300 hover:text-indigo-400 transition-all text-xs font-bold uppercase tracking-widest">
                            <DownloadCloud size={16} /><span>Export .MD</span>
                        </button>
                        <button onClick={handlePrintPdf}
                            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-xl text-white transition-all text-xs font-bold uppercase tracking-widest">
                            <Printer size={16} /><span>Save PDF</span>
                        </button>
                    </div>
                </div>

                {/* Youniverse Report Content */}
                <div className="space-y-12 print:space-y-6">
                    {/* Master Cover */}
                    <div className="relative rounded-[3rem] p-16 md:p-20 overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent print:border-slate-300">
                        <div className="absolute top-0 left-0 w-full h-full">
                            {decks.map((d, i) => (
                                <div key={d.id} className="absolute rounded-full blur-[120px] opacity-10"
                                    style={{
                                        background: d.who.color,
                                        width: '300px', height: '300px',
                                        top: `${20 + i * 15}%`, left: `${10 + i * 25}%`
                                    }} />
                            ))}
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-bold uppercase tracking-[0.5em] mb-8 text-indigo-400">The Youniverse Report</div>
                            <h1 className="text-6xl md:text-8xl font-serif italic text-white tracking-tight leading-[0.85] mb-8 lowercase">
                                {project.title.toLowerCase()}
                            </h1>
                            <div className="flex items-center space-x-6 text-sm text-slate-500">
                                <span>{decks.length} intelligence sources</span>
                                <span>•</span>
                                <span>{decks.reduce((acc, d) => acc + d.slides.length, 0)} total slides</span>
                                <span>•</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-3 mt-8">
                                {decks.map(d => (
                                    <div key={d.id} className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                        style={{
                                            color: d.who.color,
                                            borderColor: d.who.color + '33',
                                            background: d.who.color + '0D'
                                        }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.who.color }} />
                                        <span>{d.who.tool}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tool Sections */}
                    {decks.map((deck, deckIdx) => (
                        <div key={deck.id} className="space-y-6">
                            {/* Section Divider */}
                            <div className="flex items-center space-x-4 py-8">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_12px]" style={{ background: deck.who.color, boxShadow: `0 0 12px ${deck.who.color}` }} />
                                <div className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: deck.who.color }}>{deck.who.tool}</div>
                                <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, ${deck.who.color}33, transparent)` }} />
                                <div className="text-[10px] font-mono text-slate-600">{deck.slides.length} slides</div>
                            </div>

                            {/* Deck Slides */}
                            <div className="space-y-6">
                                {deck.slides.map((slide, i) => (
                                    <DeckSlideRenderer key={i} slide={slide} brandColor={deck.who.color} index={i} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Synthesis Page */}
                    <div className="rounded-[3rem] p-16 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] to-purple-500/[0.03] print:border-slate-300">
                        <div className="text-[10px] font-bold uppercase tracking-[0.5em] mb-8 text-indigo-400">Youniverse Synthesis</div>
                        <h2 className="text-4xl font-serif italic text-white tracking-tight leading-tight mb-8 lowercase">cross-territory intelligence summary</h2>
                        <div className="space-y-6">
                            {decks.map(deck => {
                                const coverSlide = deck.slides.find(s => s.type === 'cover');
                                const keyPoints = deck.slides
                                    .filter(s => s.type === 'statement' || s.type === 'bullets')
                                    .slice(0, 2);
                                return (
                                    <div key={deck.id} className="rounded-2xl p-6 border bg-black/20" style={{ borderColor: deck.who.color + '20' }}>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-2 h-2 rounded-full" style={{ background: deck.who.color }} />
                                            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: deck.who.color }}>{deck.who.tool}</span>
                                        </div>
                                        <h3 className="text-xl font-serif italic text-white mb-3">{coverSlide?.title || 'Untitled Deck'}</h3>
                                        {keyPoints.map((kp, i) => (
                                            <p key={i} className="text-sm text-slate-400 leading-relaxed mb-2">
                                                <ChevronRight size={12} className="inline mr-1 opacity-40" />
                                                {kp.heading}: {kp.body || (kp.items || []).slice(0, 2).join(', ')}
                                            </p>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mb-4">End of Youniverse Report</div>
                            <p className="text-sm text-slate-500 font-serif italic">
                                Compiled from {decks.length} Solutions across The Youniverse.
                                All Humanot node memory has been securely wiped. No persistent context retained.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Decks Mode (default) ───
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 print:hidden">
                <div>
                    <h2 className="text-5xl font-serif italic text-white tracking-tighter lowercase">youniverse report</h2>
                    <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">
                        {decks.length === 0 ? 'Awaiting Intelligence' : `${decks.length} deck${decks.length !== 1 ? 's' : ''} received`} // {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {decks.length >= 2 && (
                        <button onClick={handleBuildDossier}
                            className="group flex items-center space-x-3 bg-white text-slate-950 px-8 py-4 rounded-full hover:scale-[1.03] transition-all duration-500 active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-bold text-xs tracking-[0.2em] uppercase">
                            <Layers size={18} className="group-hover:rotate-12 transition-transform duration-500" />
                            <span>Generate Report</span>
                        </button>
                    )}

                    {decks.length > 0 && (
                        <>
                            <button onClick={handleDownloadMd}
                                className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl text-slate-300 hover:text-indigo-400 transition-all text-xs font-bold uppercase tracking-widest">
                                <DownloadCloud size={16} /><span>.MD</span>
                            </button>
                            <button onClick={handlePrintPdf}
                                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-xl text-white transition-all text-xs font-bold uppercase tracking-widest">
                                <Printer size={16} /><span>PDF</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {decks.length === 0 && notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-[#0B0E14] rounded-[3rem] border border-dashed border-white/5">
                    <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                        <Layers size={36} className="text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-serif italic text-slate-300 mb-3">awaiting solutions</h3>
                    <p className="text-slate-600 max-w-md text-center text-sm leading-relaxed">
                        When Solutions across The Youniverse commit their findings, decks will appear here.
                        Queue two or more to generate a Youniverse Report.
                    </p>
                </div>
            )}

            {/* Individual Decks */}
            {decks.length > 0 && (
                <div className="space-y-16">
                    {decks.map(deck => (
                        <div key={deck.id} className="space-y-6">
                            {/* Deck Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-4 h-4 rounded-full shadow-[0_0_16px]"
                                        style={{ background: deck.who.color, boxShadow: `0 0 16px ${deck.who.color}` }} />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{deck.who.tool}</h3>
                                        <span className="text-[10px] font-mono text-slate-600 uppercase">
                                            {deck.who.id} • {deck.slides.length} slides • {new Date(deck.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteDeck(deck.id)}
                                    className="p-2.5 text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all print:hidden">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Slides */}
                            <div className="space-y-4">
                                {deck.slides.map((slide, i) => (
                                    <DeckSlideRenderer key={i} slide={slide} brandColor={deck.who.color} index={i} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Legacy notes fallback (for non-deck commits) */}
            {notes.length > 0 && decks.length === 0 && (
                <div className="mt-16 space-y-8">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4">Legacy Artifacts</div>
                    {notes.map(note => (
                        <div key={note.id} className="space-y-3 rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
                            <h3 className="text-lg font-serif italic text-white">{note.title}</h3>
                            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{note.content}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Markdown Export ───
function generateDossierMarkdown(decks: Deck[], project: Project): string {
    let md = `# YOUNIVERSE REPORT: ${project.title.toUpperCase()}\n\n`;
    md += `**Sources:** ${decks.length} | **Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;

    for (const deck of decks) {
        md += `## 🔹 ${deck.who.tool}\n\n`;
        md += `*Source ID: \`${deck.who.id}\` | Received: ${deck.timestamp}*\n\n`;

        for (const slide of deck.slides) {
            switch (slide.type) {
                case 'cover':
                    md += `# ${slide.title || ''}\n*${slide.subtitle || ''}*\n\n`;
                    break;
                case 'statement':
                    md += `### ${slide.heading || ''}\n${slide.body || ''}\n\n`;
                    break;
                case 'bullets':
                    md += `### ${slide.heading || ''}\n${(slide.items || []).map(b => `- ${b}`).join('\n')}\n\n`;
                    break;
                case 'warning':
                    md += `> ⚠️ **${slide.heading || 'Warning'}**: ${slide.body || ''}\n\n`;
                    break;
                case 'roadmap':
                    md += `### ${slide.heading || ''}\n${(slide.phases || []).map((p, i) => `${i + 1}. **${p.name}** — ${p.description || ''}`).join('\n')}\n\n`;
                    break;
                case 'quote':
                    md += `> *"${slide.body || ''}"*\n> — ${slide.attribution || slide.heading || ''}\n\n`;
                    break;
                default:
                    md += `### ${slide.heading || ''}\n${slide.body || ''}\n\n`;
            }
        }
        md += `---\n\n`;
    }

    md += `## Synthesis\n\n`;
    md += `Compiled from ${decks.length} Solutions across The Youniverse.\n`;
    md += `All Humanot node memory has been securely wiped. No persistent context retained.\n\n`;
    md += `**[ END OF YOUNIVERSE REPORT ]**\n`;
    return md;
}
