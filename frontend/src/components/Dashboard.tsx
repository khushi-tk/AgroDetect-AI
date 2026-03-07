import React from 'react';
import { Droplets, Thermometer, FlaskConical, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { TelemetryData } from '../types';

interface DashboardProps {
  data: TelemetryData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const metrics = [
    { label: 'Soil pH', value: data.soilPh, unit: 'pH', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Moisture', value: data.moisture, unit: '%', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Nitrogen', value: data.nitrogen, unit: 'PPM', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Temperature', value: data.temperature, unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Field Telemetry
        </h3>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Live Status</span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 flex flex-col justify-between"
          >
            <div className={`w-10 h-10 ${metric.bg} rounded-lg flex items-center justify-center mb-2`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-xs text-slate-500">{metric.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
