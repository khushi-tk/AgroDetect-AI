import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  History, 
  Settings, 
  Bell, 
  Search, 
  Leaf, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { OutbreakMap } from './components/OutbreakMap';
import { ResultCard } from './components/ResultCard';
import { CropDisease, TelemetryData, OutbreakPoint } from './types';

export default function App() {
  const [activeResult, setActiveResult] = useState<CropDisease | null>(null);
  const [history, setHistory] = useState<CropDisease[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock Telemetry Data
  const [telemetry] = useState<TelemetryData>({
    soilPh: 6.8,
    moisture: 42,
    nitrogen: 120,
    temperature: 24.5
  });

  // Mock Outbreak Data
  const [outbreaks] = useState<OutbreakPoint[]>([
    { id: '1', lat: 30, lng: 40, disease: 'Late Blight', severity: 'high' },
    { id: '2', lat: 60, lng: 70, disease: 'Powdery Mildew', severity: 'medium' },
    { id: '3', lat: 45, lng: 20, disease: 'Leaf Rust', severity: 'low' },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('agrodetect_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleScanResult = (result: CropDisease) => {
    setActiveResult(result);
    const newHistory = [result, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('agrodetect_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="h-16 border-bottom border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AgroDetect <span className="text-emerald-400">AI</span></h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-none">Precision Agronomy</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search pathogens..." 
              className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-64"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0c10]" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 border border-white/20" />
          </div>
        </div>

        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-4 gap-4 h-full">
            
            {/* Scanner / Result Area */}
            <div className="md:col-span-2 md:row-span-3 glass-card relative group">
              <AnimatePresence mode="wait">
                {activeResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full relative"
                  >
                    <ResultCard result={activeResult} />
                    <button 
                      onClick={() => setActiveResult(null)}
                      className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="scanner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <Scanner onResult={handleScanResult} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Telemetry Dashboard */}
            <div className="md:col-span-2 md:row-span-2 glass-card">
              <Dashboard data={telemetry} />
            </div>

            {/* Outbreak Map */}
            <div className="md:col-span-2 md:row-span-2 glass-card">
              <OutbreakMap points={outbreaks} />
            </div>

            {/* AI Agronomist Chat */}
            <div className="md:col-span-1 md:row-span-2 glass-card">
              <Chat currentContext={activeResult || undefined} />
            </div>

            {/* Archive / History */}
            <div className="md:col-span-1 md:row-span-2 glass-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  Archive
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <History className="w-8 h-8 mb-2" />
                    <p className="text-xs">No scan history</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveResult(item)}
                      className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-emerald-900/20 shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0c10] border-l border-white/10 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="text-white" />
                </button>
              </div>
              {/* Mobile menu items could go here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
