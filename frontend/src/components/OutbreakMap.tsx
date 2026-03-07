import React from 'react';
import { Map as MapIcon, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { OutbreakPoint } from '../types';

interface OutbreakMapProps {
  points: OutbreakPoint[];
}

export const OutbreakMap: React.FC<OutbreakMapProps> = ({ points }) => {
  return (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-emerald-400" />
          Outbreak Tracking
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Medium</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-emerald-950/20 rounded-xl border border-emerald-500/10 overflow-hidden">
        {/* Stylized Grid Background */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Simulated Map Contours */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <path d="M50,150 Q100,100 200,150 T350,150" fill="none" stroke="#10b981" strokeWidth="2" />
          <path d="M80,200 Q150,250 250,200 T320,180" fill="none" stroke="#10b981" strokeWidth="2" />
        </svg>

        {/* Outbreak Points */}
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute cursor-pointer group"
            style={{ left: `${point.lng}%`, top: `${point.lat}%` }}
          >
            <div className={`relative w-4 h-4 rounded-full flex items-center justify-center ${
              point.severity === 'high' ? 'bg-red-500' : 
              point.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                point.severity === 'high' ? 'bg-red-500' : 
                point.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg whitespace-nowrap">
                <p className="text-xs font-bold text-white">{point.disease}</p>
                <p className="text-[10px] text-slate-400 capitalize">Severity: {point.severity}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Spread Velocity</p>
              <p className="text-xs font-bold text-white">0.8km / Day</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Regional Threat</p>
              <p className="text-xs font-bold text-white">Moderate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
