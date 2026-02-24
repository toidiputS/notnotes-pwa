import React from 'react';
import { DeckSlide } from '../types';
import { AlertTriangle, ArrowRight, Quote } from 'lucide-react';

interface SlideProps {
    slide: DeckSlide;
    brandColor: string;
    index: number;
}

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DeckSlideRenderer: React.FC<SlideProps> = ({ slide, brandColor, index }) => {
    const accentBg = hexToRgba(brandColor, 0.08);
    const accentBorder = hexToRgba(brandColor, 0.2);
    const accentGlow = hexToRgba(brandColor, 0.15);

    switch (slide.type) {
        case 'cover':
            return (
                <div
                    className="relative rounded-[2.5rem] p-12 md:p-16 overflow-hidden border"
                    style={{ background: `linear-gradient(135deg, ${hexToRgba(brandColor, 0.12)}, ${hexToRgba(brandColor, 0.03)})`, borderColor: accentBorder }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-30" style={{ background: brandColor }} />
                    <div className="relative z-10">
                        {slide.meta && (
                            <div className="text-[10px] font-bold uppercase tracking-[0.5em] mb-6 opacity-50" style={{ color: brandColor }}>{slide.meta}</div>
                        )}
                        <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tight leading-[0.9] mb-6 lowercase">{slide.title}</h1>
                        {slide.subtitle && (
                            <p className="text-xl text-slate-400 font-serif italic max-w-2xl leading-relaxed">{slide.subtitle}</p>
                        )}
                    </div>
                </div>
            );

        case 'statement':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border" style={{ background: accentBg, borderColor: accentBorder }}>
                    <div className="w-12 h-[2px] mb-8" style={{ background: brandColor }} />
                    <h2 className="text-3xl md:text-4xl font-serif italic text-white tracking-tight leading-[1.1] mb-6 lowercase">{slide.heading}</h2>
                    <p className="text-lg text-slate-300 leading-relaxed font-light max-w-3xl">{slide.body}</p>
                </div>
            );

        case 'bullets':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border" style={{ background: accentBg, borderColor: accentBorder }}>
                    <h2 className="text-2xl font-serif italic text-white tracking-tight mb-8 lowercase">{slide.heading}</h2>
                    <div className="space-y-4">
                        {(slide.items || []).map((item, i) => (
                            <div key={i} className="flex items-start space-x-4 group">
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all duration-500 group-hover:scale-150 group-hover:shadow-[0_0_12px]"
                                    style={{ background: brandColor, boxShadow: `0 0 8px ${accentGlow}` }} />
                                <span className="text-slate-300 text-base leading-relaxed">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'warning':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 bg-amber-500" />
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-6">
                            <AlertTriangle size={24} className="text-amber-400" />
                            <h2 className="text-2xl font-serif italic text-amber-300 tracking-tight lowercase">{slide.heading}</h2>
                        </div>
                        <p className="text-base text-amber-200/80 leading-relaxed">{slide.body}</p>
                    </div>
                </div>
            );

        case 'roadmap':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border" style={{ background: accentBg, borderColor: accentBorder }}>
                    <h2 className="text-2xl font-serif italic text-white tracking-tight mb-10 lowercase">{slide.heading}</h2>
                    <div className="space-y-0">
                        {(slide.phases || []).map((phase, i) => (
                            <div key={i} className="flex items-start group">
                                {/* Timeline connector */}
                                <div className="flex flex-col items-center mr-6 flex-shrink-0">
                                    <div className="w-4 h-4 rounded-full border-2 transition-all duration-300 group-hover:scale-125"
                                        style={{ borderColor: brandColor, background: i === 0 ? brandColor : 'transparent' }} />
                                    {i < (slide.phases || []).length - 1 && (
                                        <div className="w-[2px] h-16 opacity-20" style={{ background: brandColor }} />
                                    )}
                                </div>
                                <div className="pb-8">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{phase.name}</h3>
                                        {phase.status && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                                style={{ background: accentBg, color: brandColor, border: `1px solid ${accentBorder}` }}>
                                                {phase.status}
                                            </span>
                                        )}
                                    </div>
                                    {phase.description && <p className="text-sm text-slate-400 leading-relaxed">{phase.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'chart':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border flex items-center justify-center min-h-[200px]" style={{ background: accentBg, borderColor: accentBorder }}>
                    <div className="text-center">
                        {slide.heading && <h2 className="text-2xl font-serif italic text-white tracking-tight mb-4 lowercase">{slide.heading}</h2>}
                        <div className="flex items-end justify-center space-x-3 h-32">
                            {[40, 65, 85, 55, 90, 70, 95].map((h, i) => (
                                <div key={i} className="w-8 rounded-t-lg transition-all duration-700 hover:opacity-100 opacity-60"
                                    style={{ height: `${h}%`, background: `linear-gradient(to top, ${hexToRgba(brandColor, 0.3)}, ${brandColor})` }} />
                            ))}
                        </div>
                        {slide.body && <p className="text-sm text-slate-500 mt-6">{slide.body}</p>}
                    </div>
                </div>
            );

        case 'comparison':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border" style={{ background: accentBg, borderColor: accentBorder }}>
                    {slide.heading && <h2 className="text-2xl font-serif italic text-white tracking-tight mb-8 lowercase">{slide.heading}</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(slide.columns || []).map((col, i) => (
                            <div key={i} className="rounded-2xl p-6 border bg-black/20" style={{ borderColor: accentBorder }}>
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: brandColor }}>{col.label}</h3>
                                <div className="space-y-3">
                                    {col.items.map((item, j) => (
                                        <div key={j} className="flex items-center space-x-3">
                                            <ArrowRight size={12} style={{ color: brandColor }} className="flex-shrink-0" />
                                            <span className="text-sm text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'quote':
            return (
                <div className="rounded-[2rem] p-10 md:p-14 border relative overflow-hidden" style={{ background: accentBg, borderColor: accentBorder }}>
                    <Quote size={80} className="absolute top-6 right-8 opacity-[0.04] text-white" />
                    <div className="relative z-10">
                        <p className="text-2xl md:text-3xl font-serif italic text-white leading-snug mb-6">"{slide.body}"</p>
                        {(slide.attribution || slide.heading) && (
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-[1px]" style={{ background: brandColor }} />
                                <span className="text-sm font-medium" style={{ color: brandColor }}>{slide.attribution || slide.heading}</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        default:
            return (
                <div className="rounded-[2rem] p-10 border border-white/5 bg-white/[0.02]">
                    <p className="text-slate-500 text-sm">Unknown slide type: {slide.type}</p>
                </div>
            );
    }
};
