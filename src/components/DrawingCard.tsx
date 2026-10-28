import React from 'react';
import { CadItem } from '../types/cad';
import { 
  Eye, 
  Download, 
  ShoppingCart, 
  Star, 
  Layers, 
  HardDrive, 
  Check
} from 'lucide-react';

interface DrawingCardProps {
  item: CadItem;
  onInspect: (item: CadItem) => void;
  onAddToCart: (item: CadItem) => void;
  onDownload: (item: CadItem) => void;
  isOwned?: boolean;
  isInCart?: boolean;
  currency: 'USD' | 'PKR';
}

export const DrawingCard: React.FC<DrawingCardProps> = ({
  item,
  onInspect,
  onAddToCart,
  onDownload,
  isOwned = false,
  isInCart = false,
  currency,
}) => {
  const displayPrice = currency === 'USD' 
    ? `$${item.price}` 
    : `Rs ${(item.pricePkr || item.price * 278).toLocaleString()}`;

  const originalDisplayPrice = item.originalPrice 
    ? currency === 'USD'
      ? `$${item.originalPrice}`
      : `Rs ${(item.originalPrice * 278).toLocaleString()}`
    : null;

  return (
    <div className="group relative bg-[#091426] border border-cyan-900/40 hover:border-cyan-500/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/50 flex flex-col justify-between font-sans">
      
      {/* Top Card Media & Blueprint Thumbnail */}
      <div className="relative h-48 w-full bg-[#050b16] cad-grid-pattern overflow-hidden flex items-center justify-center p-3 border-b border-cyan-900/30">
        
        {/* Vector SVG Blueprint Representation */}
        <div className="w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 300 160" className="w-full h-full">
            {/* Grid & Wall Border */}
            <rect x="15" y="15" width="270" height="130" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="15" y1="80" x2="285" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="150" y1="15" x2="150" y2="145" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Discipline Vector Shapes */}
            {item.category === 'Mechanical (HVAC)' && (
              <g stroke="#00f0ff" strokeWidth="2.5" fill="none">
                <rect x="30" y="30" width="45" height="30" fill="#0c4a6e" stroke="#38bdf8" />
                <path d="M 75 45 L 170 45 L 170 100 L 250 100" />
                <rect x="160" y="35" width="20" height="15" fill="#00f0ff" />
                <rect x="240" y="90" width="20" height="15" fill="#00f0ff" />
                <line x1="75" y1="65" x2="260" y2="65" stroke="#ef4444" strokeDasharray="4 2" strokeWidth="1.5" />
              </g>
            )}

            {item.category === 'Electrical' && (
              <g stroke="#ef4444" strokeWidth="2" fill="none">
                <line x1="30" y1="50" x2="270" y2="50" strokeWidth="3" />
                <circle cx="60" cy="30" r="12" stroke="#f59e0b" />
                <circle cx="60" cy="42" r="12" stroke="#f59e0b" />
                <rect x="100" y="70" width="24" height="24" stroke="#10b981" fill="#064e3b" />
                <rect x="180" y="70" width="24" height="24" stroke="#10b981" fill="#064e3b" />
                <line x1="112" y1="50" x2="112" y2="70" stroke="#38bdf8" />
                <line x1="192" y1="50" x2="192" y2="70" stroke="#38bdf8" />
                <line x1="30" y1="120" x2="270" y2="120" stroke="#8b5cf6" strokeWidth="2.5" />
              </g>
            )}

            {item.category === 'Plumbing & Drainage' && (
              <g strokeWidth="2" fill="none">
                <path d="M 30 40 L 150 40 L 150 100 L 270 100" stroke="#0ea5e9" strokeWidth="3" />
                <path d="M 30 60 L 130 60 L 130 115 L 270 115" stroke="#ef4444" strokeDasharray="4 2" />
                <line x1="40" y1="135" x2="260" y2="135" stroke="#ca8a04" strokeWidth="4" />
                <circle cx="100" cy="135" r="8" stroke="#15803d" fill="#064e3b" />
                <circle cx="200" cy="135" r="8" stroke="#15803d" fill="#064e3b" />
              </g>
            )}

            {item.category === 'Fire Fighting' && (
              <g stroke="#dc2626" strokeWidth="2" fill="none">
                <line x1="40" y1="40" x2="260" y2="40" strokeWidth="4" />
                <line x1="80" y1="40" x2="80" y2="120" strokeWidth="2" />
                <line x1="160" y1="40" x2="160" y2="120" strokeWidth="2" />
                <line x1="240" y1="40" x2="240" y2="120" strokeWidth="2" />
                {[
                  [80, 80],
                  [80, 120],
                  [160, 80],
                  [160, 120],
                  [240, 80],
                  [240, 120],
                ].map(([x, y], idx) => (
                  <circle key={idx} cx={x} cy={y} r="5" stroke="#f87171" fill="#7f1d1d" />
                ))}
              </g>
            )}

            {item.category === 'ELV & Telecom' && (
              <g stroke="#06b6d4" strokeWidth="1.5" fill="none">
                <circle cx="60" cy="40" r="8" fill="#083344" />
                <circle cx="240" cy="40" r="8" fill="#083344" />
                <path d="M 60 40 L 120 70 L 120 10 Z" fill="#06b6d4" fillOpacity="0.15" />
                <circle cx="150" cy="90" r="10" stroke="#ef4444" fill="#7f1d1d" />
                <path d="M 60 40 L 150 90 L 240 40" stroke="#a855f7" strokeDasharray="3 3" />
              </g>
            )}

            {item.category === 'Coordination & Blocks' && (
              <g strokeWidth="2" fill="none">
                <line x1="30" y1="40" x2="270" y2="40" stroke="#00f0ff" strokeWidth="4" />
                <line x1="70" y1="20" x2="70" y2="140" stroke="#a855f7" strokeWidth="3" />
                <line x1="190" y1="20" x2="190" y2="140" stroke="#ef4444" strokeWidth="2.5" />
                <circle cx="70" cy="40" r="10" stroke="#22c55e" fill="#052e16" strokeWidth="2" />
                <circle cx="190" cy="40" r="10" stroke="#22c55e" fill="#052e16" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800 backdrop-blur-md">
            {item.dwgVersion.split(' ')[0]} {item.dwgVersion.split(' ')[1]}
          </span>
          {item.isFree ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800 backdrop-blur-md">
              FREE DWG
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-800 backdrop-blur-md">
              COMMERCIAL
            </span>
          )}
        </div>

        {/* Inspect Overlay Trigger */}
        <button
          onClick={() => onInspect(item)}
          className="absolute inset-0 bg-[#070e1c]/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-xs font-mono font-bold text-cyan-300 cursor-pointer"
        >
          <div className="px-3.5 py-2 rounded-xl bg-cyan-950 border border-cyan-500 shadow-lg flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Launch 2D AutoCAD Viewport</span>
          </div>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory & File details */}
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/90 mb-1">
            <span>{item.subCategory}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <HardDrive className="w-3 h-3" />
              {item.fileSize}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onInspect(item)}
            className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-2 mb-1"
          >
            {item.title}
          </h3>

          {/* English Subtitle */}
          {item.subtitle && (
            <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mb-2">
              {item.subtitle}
            </p>
          )}

          {/* Specs Mini Chips */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              {item.layersCount} Layers
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {item.rating} ({item.reviewsCount})
            </span>
            <span className="text-slate-600">|</span>
            <span>{item.downloadsCount} dl</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-cyan-900/30">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              {item.isFree ? (
                <span className="text-lg font-black text-emerald-400 font-mono">
                  FREE DOWNLOAD
                </span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-white font-mono">
                    {displayPrice}
                  </span>
                  {originalDisplayPrice && (
                    <span className="text-xs text-slate-500 line-through font-mono">
                      {originalDisplayPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {item.specs.standards.split('/')[0]} Standard
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onInspect(item)}
              className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect</span>
            </button>

            {isOwned || item.isFree ? (
              <button
                onClick={() => onDownload(item)}
                className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                disabled={isInCart}
                className={`py-2 px-2.5 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isInCart
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Buy DWG</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
