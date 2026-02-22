
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Calendar as CalendarIcon, Search, Zap,
  Menu, X, PanelLeftClose, PanelLeftOpen
} from './components/ui/Icons';
import { ToastProvider } from './components/ui/Toast';
import { LayoutContext } from './context/LayoutContext';

// Pages
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import CalendarPage from './pages/CalendarPage';
import { QuickCapture } from './components/QuickCapture';
import { api } from './services/db';
import { OracleListener } from './components/OracleListener';
import { tierService } from './services/tierService';
import { TierOverlay } from './components/TierOverlay';

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium ${isActive
        ? 'bg-indigo-500/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:shadow-sm'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="truncate">{label}</span>
      </>
    )}
  </NavLink>
);

const Layout: React.FC<{ children: React.ReactNode, onGlobalRefresh: () => void }> = ({ children, onGlobalRefresh }) => {
  const [isQuickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGlobalTrigger, setShowGlobalTrigger] = useState(true);
  const navigate = useNavigate();

  // Handle Search Overlay
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ projects: any[], tasks: any[] } | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const res = api.search(searchQuery);
      setSearchResults(res);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const handleQuickCaptureSuccess = () => {
    onGlobalRefresh();
  };

  const currentTier = tierService.getCurrentTier();
  const hasAccess = tierService.hasNotNotesAccess(currentTier);

  if (!hasAccess) {
    return <TierOverlay />;
  }

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, setSidebarCollapsed, showGlobalTrigger, setShowGlobalTrigger }}>
      <OracleListener />
      <div className="flex h-screen print:h-auto bg-slate-950 overflow-hidden print:overflow-visible text-slate-50 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          print:hidden fixed md:relative z-50 bg-[#020617] border-r border-white/5 h-full flex flex-col shadow-2xl md:shadow-none
          transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]
          ${isMobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0' : 'md:w-80 md:opacity-100'}
        `}>
          <div className="p-10 flex items-center justify-between">
            <div className="flex items-center space-x-4 font-black text-white text-2xl tracking-tighter overflow-hidden whitespace-nowrap uppercase">
              <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-1 ring-white/20">
                <span className="font-serif italic text-3xl leading-none pt-1">N</span>
              </div>
              <span className="font-serif italic tracking-tight lowercase text-slate-200">notnotes</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-300 transition-colors">
              <X size={24} />
            </button>
            <button onClick={() => setSidebarCollapsed(true)} className="hidden md:block text-slate-800 hover:text-indigo-400 transition-all p-2 hover:bg-white/5 rounded-full shadow-none">
              <PanelLeftClose size={20} />
            </button>
          </div>

          <nav className="flex-1 px-8 space-y-12 overflow-y-auto overflow-x-hidden custom-scrollbar py-6">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-6 px-4">Management</div>
              <SidebarLink to="/" icon={LayoutGrid} label="Dashboard" />
              <SidebarLink to="/calendar" icon={CalendarIcon} label="Calendar" />
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] mb-6 px-4">Collections</div>
              <div className="space-y-1">
                {api.getProjects().slice(0, 10).map(p => (
                  <NavLink
                    key={p.id}
                    to={`/project/${p.id}`}
                    className={({ isActive }) => `block px-4 py-3 text-sm rounded-2xl truncate transition-all duration-500 group ${isActive
                      ? 'bg-white/5 text-white shadow-2xl ring-1 ring-white/10 font-semibold'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-1 h-1 rounded-full inline-block mr-4 transition-all duration-500 group-hover:scale-[3] group-hover:mr-6`} style={{ backgroundColor: p.color }}></span>
                      <span className="truncate tracking-wide font-serif italic text-base">{p.title.toLowerCase()}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-8 m-8 glass rounded-[2.5rem] shadow-2xl">
            <button
              onClick={() => setQuickCaptureOpen(true)}
              className="flex items-center justify-center w-full space-x-3 bg-white text-slate-950 py-4 rounded-full shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all active:scale-[0.98] font-bold text-[10px] uppercase tracking-[0.2em] border border-white/20"
            >
              <Zap size={14} className="fill-slate-950" />
              <span>Capture</span>
            </button>

            <div className="mt-6 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-700 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search vaults..."
                className="w-full pl-12 pr-5 py-4 bg-black/40 text-slate-300 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-black/60 focus:border-white/20 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults && (
                <div className="absolute bottom-full left-0 w-full mb-4 glass rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 max-h-72 overflow-y-auto z-50 p-3">
                  {searchResults.projects.length > 0 && (
                    <div className="p-2">
                      <div className="text-[9px] font-bold text-slate-600 px-4 py-3 uppercase tracking-[0.3em]">Vaults</div>
                      {searchResults.projects.map(p => (
                        <div key={p.id} onClick={() => { navigate(`/project/${p.id}`); setSearchQuery(''); }} className="px-4 py-3 hover:bg-white/5 cursor-pointer rounded-2xl text-xs text-slate-400 hover:text-white truncate font-serif italic text-base flex items-center transition-all">
                          <span className="w-1 h-1 rounded-full mr-4" style={{ backgroundColor: p.color }}></span>
                          {p.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-2 border-t border-white/5 mt-2">
                      <div className="text-[9px] font-bold text-slate-600 px-4 py-3 uppercase tracking-[0.3em]">Tasks</div>
                      {searchResults.tasks.map(t => (
                        <div key={t.id} onClick={() => { navigate(`/project/${t.projectId}/tasks`); setSearchQuery(''); }} className="px-4 py-3 hover:bg-white/5 cursor-pointer rounded-2xl text-xs text-slate-400 hover:text-white truncate font-medium transition-all">
                          {t.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full print:h-auto overflow-hidden print:overflow-visible relative bg-slate-950">
          <header className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 md:hidden z-10 sticky top-0">
            <div className="flex items-center space-x-2 font-bold text-slate-100">
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-indigo-400 text-xs font-serif italic border border-slate-700">N</div>
              <span>NotNotes</span>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400">
              <Menu size={24} />
            </button>
          </header>

          {/* Desktop Collapsed Trigger */}
          {isSidebarCollapsed && showGlobalTrigger && (
            <div className="hidden md:block absolute top-6 left-6 z-40 animate-in fade-in duration-300">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all hover:-translate-y-0.5"
                title="Open Sidebar"
              >
                <PanelLeftOpen size={20} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden print:overflow-visible print:h-auto relative">
            {children}
          </div>
        </main>

        <QuickCapture
          isOpen={isQuickCaptureOpen}
          onClose={() => setQuickCaptureOpen(false)}
          onSuccess={handleQuickCaptureSuccess}
        />
      </div>
    </LayoutContext.Provider>
  );
};

const App = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleGlobalRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  return (
    <ToastProvider>
      <Router>
        <Layout onGlobalRefresh={handleGlobalRefresh}>
          <Routes>
            <Route path="/" element={<Dashboard onRefresh={handleGlobalRefresh} />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/project/:projectId/*" element={<ProjectView />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
};

export default App;
