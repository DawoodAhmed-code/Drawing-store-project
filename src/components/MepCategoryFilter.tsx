import React from 'react';
import { MepCategory } from '../types/cad';
import { 
  Wind, 
  Zap, 
  Droplet, 
  Flame, 
  Radio, 
  LayoutGrid, 
  Sparkles 
} from 'lucide-react';

interface MepCategoryFilterProps {
  selectedCategory: MepCategory;
  onSelectCategory: (category: MepCategory) => void;
  counts: Record<string, number>;
}

export const MEP_CATEGORIES_INFO: {
  category: MepCategory;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  tagline: string;
  color: string;
}[] = [
  {
    category: 'All',
    icon: LayoutGrid,
    subtitle: 'All Disciplines',
    tagline: 'Complete Engineering Catalog',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    category: 'Mechanical (HVAC)',
    icon: Wind,
    subtitle: 'HVAC & Ductwork',
    tagline: 'Chillers, GI Ducts, AHU & VAV Systems',
    color: 'from-sky-400 to-cyan-600',
  },
  {
    category: 'Electrical',
    icon: Zap,
    subtitle: 'Power & SLDs',
    tagline: '11kV Substation, SLDs & Lighting Layouts',
    color: 'from-amber-400 to-yellow-600',
  },
  {
    category: 'Plumbing & Drainage',
    icon: Droplet,
    subtitle: 'Public Health',
    tagline: 'Booster Pumps, Sewerage & Stormwater',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    category: 'Fire Fighting',
    icon: Flame,
    subtitle: 'Fire Protection',
    tagline: 'NFPA Sprinklers, Fire Pumps & FM-200',
    color: 'from-red-500 to-rose-700',
  },
  {
    category: 'ELV & Telecom',
    icon: Radio,
    subtitle: 'Security & FAS',
    tagline: 'IP CCTV, Fire Alarm FAS & Access Control',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    category: 'Coordination & Blocks',
    icon: Sparkles,
    subtitle: 'BIM & Dynamic',
    tagline: 'CSD Clash-Free, 250+ Dynamic Blocks, Title Blocks',
    color: 'from-purple-400 to-violet-600',
  },
];

export const MepCategoryFilter: React.FC<MepCategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="w-full mb-8 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            MEP Draughtsman Specialized Trades
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Organized drawing packages and documentation for engineers and lead draughtsmen
          </p>
        </div>
      </div>

      {/* Horizontal scrolling category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {MEP_CATEGORIES_INFO.map((catInfo) => {
          const Icon = catInfo.icon;
          const isSelected = selectedCategory === catInfo.category;
          const count = counts[catInfo.category] || 0;

          return (
            <button
              key={catInfo.category}
              onClick={() => onSelectCategory(catInfo.category)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0e213d] to-[#09152b] border-cyan-400 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/50'
                  : 'bg-[#091426]/70 border-cyan-900/40 hover:border-cyan-700 hover:bg-[#0c1a32]'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-gradient-to-br ' + catInfo.color + ' text-slate-950 shadow'
                      : 'bg-[#060c18] border border-cyan-900/60 text-cyan-400 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                  {count}
                </span>
              </div>

              <div>
                <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {catInfo.category === 'Mechanical (HVAC)' ? 'HVAC' : catInfo.category}
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono truncate mt-0.5">
                  {catInfo.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
