import { useState } from 'react';
import type { AIExplanation } from '../types';

type ViewMode = 'original' | 'explanation' | 'overlay';

export default function HeatmapViewer({ explanation }: { explanation: AIExplanation }) {
  const [mode, setMode] = useState<ViewMode>('overlay');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const showHeat = mode !== 'original';
  const heatOpacity = mode === 'overlay' ? 0.55 : 0.9;

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-navy-900 ring-1 ring-navy-800">
        <img
          src={explanation.originalImage}
          alt="Original retinal scan"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: mode === 'explanation' ? 0.35 : 1 }}
        />

        {showHeat && (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: heatOpacity, mixBlendMode: 'screen' }}
          >
            {explanation.features.map((f) => (
              <div
                key={f.id}
                className="absolute rounded-full blur-xl transition-transform duration-200"
                style={{
                  left: `${f.region.x}%`,
                  top: `${f.region.y}%`,
                  width: `${f.region.radius * 3.2}%`,
                  height: `${f.region.radius * 3.2}%`,
                  transform: `translate(-50%, -50%) scale(${activeFeature === f.id ? 1.25 : 1})`,
                  background: `radial-gradient(circle, rgba(255,90,60,${0.85 * (f.confidence / 100)}) 0%, rgba(255,190,60,${0.55 * (f.confidence / 100)}) 45%, rgba(255,90,60,0) 75%)`,
                }}
              />
            ))}
          </div>
        )}

        {/* markers, always on top and clickable */}
        {mode !== 'original' &&
          explanation.features.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
              className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform ${
                activeFeature === f.id ? 'scale-125 border-white bg-teal-400' : 'border-white/70 bg-white/30'
              }`}
              style={{ left: `${f.region.x}%`, top: `${f.region.y}%` }}
              aria-label={f.label}
            />
          ))}
      </div>

      {/* mode controls */}
      <div className="mx-auto mt-4 flex w-full max-w-md rounded-xl bg-sand-100 p-1">
        {(
          [
            ['original', 'Original'],
            ['explanation', 'AI Explanation'],
            ['overlay', 'Overlay'],
          ] as [ViewMode, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === value ? 'bg-white text-navy-800 shadow-soft' : 'text-navy-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* legend */}
      <div className="mx-auto mt-4 flex max-w-md items-center gap-3">
        <div className="h-2.5 flex-1 rounded-full bg-gradient-to-r from-amber-500/40 via-amber-500 to-coral-500" />
        <span className="text-xs text-navy-500">Low → High influence</span>
      </div>
    </div>
  );
}
