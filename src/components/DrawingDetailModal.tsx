import React from 'react';
import { CadItem } from '../types/cad';
import { 
  X, 
  Download, 
  ShoppingCart, 
  Layers, 
  FileText, 
  CheckCircle, 
  HardDrive, 
  Star, 
  Eye, 
  Cpu, 
  ShieldCheck,
  Check
} from 'lucide-react';

interface DrawingDetailModalProps {
  item: CadItem | null;
  onClose: () => void;
  onOpenViewer: (item: CadItem) => void;
  onAddToCart: (item: CadItem) => void;
  onDownload: (item: CadItem) => void;
  isOwned?: boolean;
  isInCart?: boolean;
  currency: 'USD' | 'PKR';
}

export const DrawingDetailModal: React.FC<DrawingDetailModalProps> = ({
  item,
  onClose,
  onOpenViewer,
  onAddToCart,
  onDownload,
  isOwned = false,
  isInCart = false,
  currency,
}) => {
  if (!item) return null;

  const displayPrice = currency === 'USD' 
    ? `$${item.price}` 
    : `Rs ${(item.pricePkr || item.price * 278).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-4xl bg-[#091426] border border-cyan-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
              {item.category}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-cyan-400">{item.subCategory}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{item.dwgVersion}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {item.title}
          </h2>

          {item.subtitle && (
            <p className="text-sm text-cyan-300 font-mono mt-1">
              {item.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              {item.rating} ({item.reviewsCount} verified reviews)
            </span>
            <span>•</span>
            <span>{item.downloadsCount} total downloads</span>
            <span>•</span>
            <span className="text-cyan-300">Draughtsman: {item.author}</span>
          </div>
        </div>

        {/* Main Grid: Blueprint Preview & Detailed Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column: Interactive CAD Preview Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div 
              onClick={() => onOpenViewer(item)}
              className="relative h-64 sm:h-72 w-full rounded-2xl bg-[#060c18] cad-grid-pattern-lg border border-cyan-900/50 flex flex-col items-center justify-center p-4 group cursor-pointer overflow-hidden shadow-inner"
            >
              <div className="text-center z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition shadow-lg shadow-cyan-500/20">
                  <Eye className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  Launch Interactive AutoCAD Viewport
                </p>
                <p className="text-xs text-cyan-400/80 font-mono mt-1">
                  Inspect layers, zoom, pan, switch Model/Paper space
                </p>
              </div>

              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500">
                AutoCAD 2024 Engine Ready
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Click to inspect
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#060d1b] p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Drawing Specification & Scope
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Right Column: Technical Spec Sheet */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Engineering Specs Table */}
            <div className="bg-[#060d1b] p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="font-bold uppercase tracking-wider text-cyan-400 pb-2 border-b border-slate-800">
                Technical Data Sheet
              </h4>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">File Formats:</span>
                <span className="text-white font-semibold">{item.fileFormat}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Archive Size:</span>
                <span className="text-white font-semibold">{item.fileSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Drawing Units:</span>
                <span className="text-white font-semibold">{item.specs.units}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Scale:</span>
                <span className="text-white font-semibold">{item.specs.scale}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Standard Code:</span>
                <span className="text-cyan-300 font-semibold">{item.specs.standards}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Plot Styles (.CTB):</span>
                <span className="text-emerald-400 font-semibold">
                  {item.specs.ctbIncluded ? 'Included in Package' : 'Standard Acad.ctb'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Layout Sheets:</span>
                <span className="text-white font-semibold">{item.specs.sheetsCount} Ready to Plot</span>
              </div>
            </div>

            {/* Software Compatibility */}
            <div className="bg-[#060d1b] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                Supported Software & CAD Platforms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.software.map((sw) => (
                  <span
                    key={sw}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Box & Action Buttons */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1e38] to-[#081324] border border-cyan-700/60 shadow-xl">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs font-mono text-cyan-300">Commercial License Price:</span>
                <div className="text-right">
                  {item.isFree ? (
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      FREE DOWNLOAD
                    </span>
                  ) : (
                    <span className="text-2xl font-black text-white font-mono">
                      {displayPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {isOwned || item.isFree ? (
                  <button
                    onClick={() => {
                      onDownload(item);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CAD Package Now</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onAddToCart(item);
                        onClose();
                      }}
                      disabled={isInCart}
                      className={`w-full py-3 rounded-xl font-black text-sm font-mono flex items-center justify-center gap-2 transition cursor-pointer ${
                        isInCart
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <Check className="w-4 h-4 text-cyan-400" />
                          <span>Already In Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart & Checkout</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    onOpenViewer(item);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open 2D CAD Blueprint Viewport</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CAD Layers Breakdown */}
        <div className="border-t border-cyan-900/40 pt-6">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Included AutoCAD Layers Table ({item.layers.length} Layers)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {item.layers.map((layer) => (
              <div
                key={layer.name}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#060c18] border border-slate-800 text-xs font-mono"
              >
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                ></span>
                <span className="truncate text-slate-300 text-[11px]">{layer.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
