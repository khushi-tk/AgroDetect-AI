import React from 'react';
import { ShieldCheck, Info, FlaskConical, Leaf, CheckCircle } from 'lucide-react';
import { CropDisease } from '../types';

interface ResultCardProps {
  result: CropDisease;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // Backend sends confidence as 0–100 already (e.g. 94.2)
  const confidenceDisplay = result.confidence > 1
    ? result.confidence.toFixed(1)
    : (result.confidence * 100).toFixed(1);

  return (
    <div className="h-full w-full p-6 flex flex-col overflow-y-auto scrollbar-hide">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
              Diagnosis Result
            </span>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
              Confidence: {confidenceDisplay}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">{result.name}</h2>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Info className="w-3 h-3" />
            Pathological Etiology
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {result.description} {result.etiology}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Leaf className="w-3 h-3" />
              Organic Remediation
            </h4>
            <ul className="space-y-2">
              {result.treatment.organic.length > 0 ? result.treatment.organic.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                  {item}
                </li>
              )) : (
                <li className="text-xs text-slate-500 italic">No organic treatment data available</li>
              )}
            </ul>
          </section>

          <section className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <FlaskConical className="w-3 h-3" />
              Precision Chemical
            </h4>
            <ul className="space-y-2">
              {result.treatment.chemical.length > 0 ? result.treatment.chemical.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                  {item}
                </li>
              )) : (
                <li className="text-xs text-slate-500 italic">No chemical treatment data available</li>
              )}
            </ul>
          </section>
        </div>

        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <CheckCircle className="w-3 h-3" />
            Prevention Roadmap
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {result.prevention.length > 0 ? result.prevention.map((step, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-300">{step}</p>
              </div>
            )) : (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                <p className="text-xs text-slate-500 italic">No prevention data available</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
