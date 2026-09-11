'use client';

import React from 'react';
import { Segmented } from 'antd';
import { Utensils, Sun, Sunset, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';

export type LightingMode = 'daylight' | 'sunset' | 'candlelight';

interface FoodTableVisualPlateProps {
  item: MenuItem;
  lighting: LightingMode;
  onLightingChange: (mode: LightingMode) => void;
}

const AMBIANCE_MAP = {
  daylight: {
    tableBg: 'bg-gradient-to-b from-amber-50/90 via-slate-100 to-amber-100/80',
    plateShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.18)]',
    glow: 'from-amber-200/40 via-sky-100/30 to-transparent',
    rimColor: 'border-white/80',
    label: 'Natural Daylight',
  },
  sunset: {
    tableBg: 'bg-gradient-to-b from-amber-900/60 via-orange-950/70 to-slate-900',
    plateShadow: 'shadow-[0_25px_60px_rgba(234,88,12,0.35)]',
    glow: 'from-orange-500/30 via-amber-500/20 to-transparent',
    rimColor: 'border-amber-400/60',
    label: 'Golden Hour Sunset',
  },
  candlelight: {
    tableBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/60',
    plateShadow: 'shadow-[0_30px_70px_rgba(244,63,94,0.3)]',
    glow: 'from-rose-500/25 via-amber-600/20 to-transparent',
    rimColor: 'border-rose-400/40',
    label: 'Intimate Candlelight',
  },
};

export default function FoodTableVisualPlate({ item, lighting, onLightingChange }: FoodTableVisualPlateProps) {
  const config = AMBIANCE_MAP[lighting];

  return (
    <div className={`relative h-72 w-full ${config.tableBg} flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-500 border-b border-slate-200`}>
      <div className={`absolute inset-0 bg-gradient-to-t ${config.glow} pointer-events-none transition-all duration-500`} />
      <div className="absolute inset-x-8 inset-y-4 rounded-3xl border border-dashed border-slate-300/60 pointer-events-none opacity-60" />

      <div className="absolute top-4 right-4 z-20">
        <Segmented
          size="small"
          value={lighting}
          onChange={(val) => onLightingChange(val as LightingMode)}
          options={[
            { label: 'Day', value: 'daylight', icon: <Sun className="w-3.5 h-3.5" /> },
            { label: 'Sunset', value: 'sunset', icon: <Sunset className="w-3.5 h-3.5" /> },
            { label: 'Candle', value: 'candlelight', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
          ]}
          className="!bg-white/90 !backdrop-blur !p-0.5 !rounded-xl !shadow-md !border !border-slate-200 text-xs font-semibold"
        />
      </div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200">
        <Sparkles className="w-3 h-3 text-orange-500" />
        <span>Table Serving Preview</span>
      </div>

      <div className="relative z-10 group">
        <div className={`w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-white p-2.5 ${config.plateShadow} border-4 ${config.rimColor} flex items-center justify-center transition-all duration-500 hover:scale-105`}>
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-slate-100 flex items-center justify-center border border-slate-200">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 opacity-40">
              <Utensils className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-60 text-slate-400 font-serif text-xs select-none pointer-events-none">🍴</div>
        <div className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-60 text-slate-400 font-serif text-xs select-none pointer-events-none">🍷</div>
      </div>

      <div className="absolute bottom-2 z-10 text-center">
        <span className="text-[11px] font-semibold text-slate-500 bg-white/80 backdrop-blur px-2.5 py-0.5 rounded-full shadow-sm">
          Ambiance: {config.label}
        </span>
      </div>
    </div>
  );
}
