import React, { useState, useRef, useEffect } from 'react';
import { CadItem, CadLayer } from '../types/cad';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Ruler, 
  Eye, 
  EyeOff, 
  Download, 
  Crosshair, 
  FileText, 
  Monitor,
  CheckCircle2,
  X
} from 'lucide-react';

interface CadBlueprintViewerProps {
  item: CadItem;
  onClose?: () => void;
  onDownloadClick?: (item: CadItem) => void;
  isOwned?: boolean;
}

export const CadBlueprintViewer: React.FC<CadBlueprintViewerProps> = ({
  item,
  onClose,
  onDownloadClick,
  isOwned = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [spaceMode, setSpaceMode] = useState<'model' | 'paper'>('model');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [layersState, setLayersState] = useState<CadLayer[]>(item.layers);
  const [cursorCoord, setCursorCoord] = useState({ x: 2450.0, y: 1820.5 });
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync layers when item changes
  useEffect(() => {
    setLayersState(item.layers);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setMeasurePoints([]);
    setMeasureDistance(null);
  }, [item]);

  const toggleLayer = (layerName: string) => {
    setLayersState((prev) =>
      prev.map((l) => (l.name === layerName ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (measureMode) {
      if (measurePoints.length === 0) {
        setMeasurePoints([{ x: cursorCoord.x, y: cursorCoord.y }]);
      } else if (measurePoints.length === 1) {
        const p1 = measurePoints[0];
        const p2 = { x: cursorCoord.x, y: cursorCoord.y };
        setMeasurePoints([p1, p2]);
        const dist = Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y));
        setMeasureDistance(dist);
      } else {
        setMeasurePoints([{ x: cursorCoord.x, y: cursorCoord.y }]);
        setMeasureDistance(null);
      }
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left - rect.width / 2 - pan.x;
      const rawY = e.clientY - rect.top - rect.height / 2 - pan.y;
      const cadX = Number(((rawX / zoom) * 8 + 3000).toFixed(1));
      const cadY = Number((-(rawY / zoom) * 8 + 2500).toFixed(1));
      setCursorCoord({ x: cadX, y: cadY });
    }

    if (!isDragging || measureMode) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 3.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setMeasurePoints([]);
    setMeasureDistance(null);
  };

  const isLayerVisible = (layerName: string) => {
    const l = layersState.find((x) => x.name === layerName);
    return l ? l.visible : true;
  };

  return (
    <div className="relative w-full h-[650px] bg-[#070e1b] rounded-2xl overflow-hidden border border-cyan-900/40 shadow-2xl flex flex-col font-sans select-none">
      {/* Top CAD Viewport Toolbar */}
      <div className="h-12 bg-[#09152a] border-b border-cyan-900/40 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              AutoCAD Viewport
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px]">
            {item.title}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
            {item.dwgVersion}
          </span>
        </div>

        {/* View Controls & Space Toggle */}
        <div className="flex items-center gap-2">
          {/* Model Space vs Paper Space */}
          <div className="flex bg-[#060c18] p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setSpaceMode('model')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-mono text-[11px] ${
                spaceMode === 'model'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Model Space
            </button>
            <button
              onClick={() => setSpaceMode('paper')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-mono text-[11px] ${
                spaceMode === 'paper'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paper Space (A1)
            </button>
          </div>

          {/* Layer Panel Toggle */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
              showLayerPanel
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Layer Properties"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-mono">Layers ({layersState.length})</span>
          </button>

          {/* Measure Tool */}
          <button
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasurePoints([]);
              setMeasureDistance(null);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              measureMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Measure Dimension Tool"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Close button if modal */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive CAD Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 overflow-hidden select-none ${
          measureMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${spaceMode === 'model' ? 'cad-grid-pattern-lg bg-[#070e1c]' : 'bg-[#e2e8f0]'}`}
      >
        {/* Floating Coordinates Bar */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-[#0a1324]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-900/50 text-[11px] font-mono text-cyan-400 shadow-xl">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>X: {cursorCoord.x} mm</span>
          <span className="text-slate-600">|</span>
          <span>Y: {cursorCoord.y} mm</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Z: 0.00</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Scale: 1:50</span>
          {measureDistance && (
            <span className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Measured: {measureDistance} mm
            </span>
          )}
        </div>

        {/* Viewport Zoom & Reset Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-[#0a1324]/90 backdrop-blur-md p-1.5 rounded-lg border border-cyan-900/50 shadow-xl">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-1 min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Fit to Screen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* CAD Vector Rendering Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
          className="w-full h-full flex items-center justify-center pointer-events-none"
        >
          {spaceMode === 'model' ? (
            /* Model Space Vector Blueprint */
            <svg
              viewBox="0 0 1000 700"
              className="w-[900px] h-[630px] drop-shadow-[0_0_25px_rgba(0,240,255,0.08)]"
              style={{ overflow: 'visible' }}
            >
              {/* Architectural Grid & Walls (Base Reference Layer) */}
              {isLayerVisible('A-WALL-GRID') || isLayerVisible('A-GRID-LINES') || isLayerVisible('A-FURN-OFFC') ? (
                <g id="Architectural_Backdrop" stroke="#334155" strokeWidth="1.5" opacity="0.65">
                  {/* Outer Building Boundary */}
                  <rect x="80" y="60" width="840" height="580" fill="none" stroke="#475569" strokeWidth="3" />
                  <rect x="90" y="70" width="820" height="560" fill="#030814" fillOpacity="0.4" stroke="#1e293b" strokeWidth="1" />
                  
                  {/* Grid Lines */}
                  <line x1="80" y1="200" x2="920" y2="200" stroke="#334155" strokeDasharray="6 6" />
                  <line x1="80" y1="360" x2="920" y2="360" stroke="#334155" strokeDasharray="6 6" />
                  <line x1="80" y1="500" x2="920" y2="500" stroke="#334155" strokeDasharray="6 6" />
                  <line x1="300" y1="60" x2="300" y2="640" stroke="#334155" strokeDasharray="6 6" />
                  <line x1="560" y1="60" x2="560" y2="640" stroke="#334155" strokeDasharray="6 6" />
                  <line x1="760" y1="60" x2="760" y2="640" stroke="#334155" strokeDasharray="6 6" />

                  {/* Grid Bubbles (AutoCAD Standard) */}
                  <circle cx="50" cy="200" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="50" y="204" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">A</text>
                  <circle cx="50" cy="360" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="50" y="364" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">B</text>
                  <circle cx="50" cy="500" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="50" y="504" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">C</text>

                  <circle cx="300" cy="35" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="300" y="39" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">1</text>
                  <circle cx="560" cy="35" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="560" y="39" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">2</text>
                  <circle cx="760" cy="35" r="14" fill="#0f172a" stroke="#64748b" />
                  <text x="760" y="39" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">3</text>

                  {/* Interior Partitions / Rooms */}
                  <line x1="300" y1="60" x2="300" y2="280" stroke="#475569" strokeWidth="2.5" />
                  <line x1="560" y1="200" x2="560" y2="640" stroke="#475569" strokeWidth="2.5" />
                  <line x1="300" y1="280" x2="560" y2="280" stroke="#475569" strokeWidth="2.5" />
                  <line x1="760" y1="200" x2="760" y2="450" stroke="#475569" strokeWidth="2.5" />
                </g>
              ) : null}

              {/* SPECIFIC DISCIPLINE VECTORS */}

              {/* 1. HVAC DISCIPLINE */}
              {item.category === 'Mechanical (HVAC)' && (
                <g id="HVAC_Discipline">
                  {/* AHU Equipment */}
                  {isLayerVisible('M-HVAC-EQUP-AHU') && (
                    <g id="AHU_Plant">
                      <rect x="130" y="100" width="120" height="70" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
                      <line x1="130" y1="100" x2="250" y2="170" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="130" y1="170" x2="250" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="190" cy="135" r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="190" y="139" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">AHU-01</text>
                      <text x="190" y="185" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">4,500 CFM</text>
                    </g>
                  )}

                  {/* Supply Ductwork (Cyan) */}
                  {isLayerVisible('M-HVAC-DUCT-SUPP') && (
                    <g id="Supply_Ducts" stroke="#00f0ff" strokeWidth="2.5" fill="none">
                      {/* Main Header Duct (800x400) */}
                      <path d="M 250 135 L 420 135 L 420 250 L 720 250" stroke="#00f0ff" strokeWidth="5" />
                      {/* Branch Take-offs */}
                      <path d="M 330 135 L 330 90 L 390 90" stroke="#00f0ff" strokeWidth="3" />
                      <path d="M 420 190 L 520 190" stroke="#00f0ff" strokeWidth="3" />
                      <path d="M 520 250 L 520 340 L 450 340" stroke="#00f0ff" strokeWidth="3" />
                      <path d="M 640 250 L 640 180 L 700 180" stroke="#00f0ff" strokeWidth="3" />
                      <path d="M 720 250 L 720 380 L 820 380" stroke="#00f0ff" strokeWidth="3" />

                      {/* Diffusers with Air Flow Chevrons */}
                      <rect x="390" y="80" width="30" height="20" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                      <rect x="520" y="180" width="30" height="20" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                      <rect x="420" y="330" width="30" height="20" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                      <rect x="700" y="170" width="30" height="20" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                      <rect x="820" y="370" width="30" height="20" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                      <text x="350" y="125" fill="#00f0ff" fontSize="9" fontFamily="monospace">800x400 GI</text>
                      <text x="440" y="240" fill="#00f0ff" fontSize="9" fontFamily="monospace">600x350 GI</text>
                    </g>
                  )}

                  {/* Return Ductwork (Dashed Sky Blue) */}
                  {isLayerVisible('M-HVAC-DUCT-RETN') && (
                    <g id="Return_Ducts" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 4" fill="none">
                      <path d="M 130 135 L 90 135 L 90 420 L 400 420" />
                      <path d="M 400 420 L 400 520 L 650 520" />
                      <rect x="400" y="410" width="26" height="20" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
                      <rect x="650" y="510" width="26" height="20" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
                      <text x="180" y="440" fill="#38bdf8" fontSize="9" fontFamily="monospace">500x300 RET</text>
                    </g>
                  )}

                  {/* Chilled Water Piping (Blue & Red) */}
                  {isLayerVisible('M-HVAC-CHW-PIPE') && (
                    <g id="Chilled_Water_Loops" strokeWidth="2">
                      <line x1="160" y1="100" x2="160" y2="40" stroke="#3b82f6" />
                      <line x1="160" y1="40" x2="880" y2="40" stroke="#3b82f6" />
                      <line x1="180" y1="100" x2="180" y2="50" stroke="#ef4444" strokeDasharray="4 2" />
                      <line x1="180" y1="50" x2="880" y2="50" stroke="#ef4444" strokeDasharray="4 2" />
                      <text x="210" y="36" fill="#3b82f6" fontSize="8" fontFamily="monospace">DN80 CHW SUPPLY (6°C)</text>
                      <text x="210" y="47" fill="#ef4444" fontSize="8" fontFamily="monospace">DN80 CHW RETURN (12°C)</text>
                    </g>
                  )}

                  {/* Volume Control Dampers */}
                  {isLayerVisible('M-HVAC-DAMP-VCD') && (
                    <g id="Dampers" stroke="#10b981" strokeWidth="1.5">
                      <line x1="280" y1="125" x2="280" y2="145" />
                      <line x1="275" y1="125" x2="285" y2="145" />
                      <text x="270" y="158" fill="#10b981" fontSize="8" fontFamily="monospace">VCD-01</text>
                      <line x1="480" y1="240" x2="480" y2="260" />
                      <line x1="475" y1="240" x2="485" y2="260" />
                      <text x="470" y="273" fill="#10b981" fontSize="8" fontFamily="monospace">VCD-02</text>
                    </g>
                  )}
                </g>
              )}

              {/* 2. ELECTRICAL DISCIPLINE */}
              {item.category === 'Electrical' && (
                <g id="Electrical_Discipline">
                  {/* Busbars / Feeders */}
                  <g id="SLD_Busbars" stroke="#ef4444" strokeWidth="4">
                    <line x1="140" y1="150" x2="860" y2="150" />
                    <text x="140" y="135" fill="#ef4444" fontSize="12" fontFamily="monospace" fontWeight="bold">
                      MAIN 415V BUSBAR 2500A (50kA 1SEC)
                    </text>
                  </g>

                  {/* Transformer / Generators */}
                  <g id="Transformers">
                    <circle cx="220" cy="70" r="22" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <circle cx="220" cy="95" r="22" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="220" y="85" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">1500kVA</text>
                    <line x1="220" y1="117" x2="220" y2="150" stroke="#f59e0b" strokeWidth="3" />
                  </g>

                  {/* Circuit Breakers & Outgoing Feeders */}
                  <g id="Feeders_ACB" stroke="#38bdf8" strokeWidth="2">
                    {[280, 400, 520, 640, 760].map((pos, idx) => (
                      <g key={idx}>
                        <line x1={pos} y1="150" x2={pos} y2="230" stroke="#38bdf8" />
                        <rect x={pos - 15} y="230" width="30" height="30" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                        <line x1={pos - 10} y1="235" x2={pos + 10} y2="255" stroke="#10b981" strokeWidth="2" />
                        <line x1={pos} y1="260" x2={pos} y2="400" stroke="#38bdf8" strokeDasharray="4 2" />
                        <rect x={pos - 35} y="400" width="70" height="50" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
                        <text x={pos} y="420" fill="#e2e8f0" fontSize="9" fontFamily="monospace" textAnchor="middle">
                          {['MDB-HVAC', 'DB-LITE-F1', 'DB-POWR-F1', 'MCC-PUMP', 'SPARE'][idx]}
                        </text>
                        <text x={pos} y="435" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {['630A 4P', '250A 4P', '400A 4P', '400A 4P', '250A 4P'][idx]}
                        </text>
                      </g>
                    ))}
                  </g>

                  {/* Cable Tray Route */}
                  <g id="Cable_Trays" stroke="#8b5cf6" strokeWidth="3" fill="none">
                    <line x1="100" y1="520" x2="880" y2="520" />
                    <line x1="100" y1="540" x2="880" y2="540" />
                    <line x1="200" y1="520" x2="200" y2="540" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="350" y1="520" x2="350" y2="540" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="500" y1="520" x2="500" y2="540" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="650" y1="520" x2="650" y2="540" stroke="#8b5cf6" strokeWidth="1" />
                    <line x1="800" y1="520" x2="800" y2="540" stroke="#8b5cf6" strokeWidth="1" />
                    <text x="140" y="512" fill="#a855f7" fontSize="9" fontFamily="monospace">
                      450x50mm PERFORATED CABLE TRAY
                    </text>
                  </g>
                </g>
              )}

              {/* 3. PLUMBING DISCIPLINE */}
              {item.category === 'Plumbing & Drainage' && (
                <g id="Plumbing_Discipline">
                  {/* Potable Cold Water (Blue) */}
                  <path d="M 120 180 L 450 180 L 450 480 L 840 480" stroke="#0284c7" strokeWidth="3.5" fill="none" />
                  <text x="140" y="170" fill="#0284c7" fontSize="10" fontFamily="monospace">Ø75 PPR CW SUPPLY</text>

                  {/* Hot Water Loop (Red) */}
                  <path d="M 120 200 L 430 200 L 430 460 L 820 460" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 3" fill="none" />
                  <text x="140" y="215" fill="#ef4444" fontSize="10" fontFamily="monospace">Ø50 PPR HW FLOW</text>

                  {/* Gravity Soil & Waste Drainage (Brown & Gold) */}
                  <path d="M 180 580 L 860 580" stroke="#854d0e" strokeWidth="4.5" fill="none" />
                  <text x="220" y="570" fill="#ca8a04" fontSize="10" fontFamily="monospace">150mm UPVC GRAVITY SOIL PIPE (SLOPE 1:100)</text>

                  {/* Inspection Chambers & Manholes */}
                  {[240, 460, 680, 840].map((cx, idx) => (
                    <g key={idx}>
                      <rect x={cx - 16} y="564" width="32" height="32" fill="#1e293b" stroke="#15803d" strokeWidth="2" />
                      <circle cx={cx} cy="580" r="8" fill="none" stroke="#15803d" strokeWidth="1.5" />
                      <text x={cx} y="612" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        MH-0{idx + 1}
                      </text>
                      <text x={cx} y="624" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                        IL: -1.{idx * 2 + 1}5m
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* 4. FIRE FIGHTING DISCIPLINE */}
              {item.category === 'Fire Fighting' && (
                <g id="Fire_Discipline">
                  {/* Fire Sprinkler Main Riser */}
                  <line x1="140" y1="120" x2="860" y2="120" stroke="#dc2626" strokeWidth="5" />
                  <text x="160" y="105" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    150mm SCH40 FIRE SPRINKLER CROSS MAIN
                  </text>

                  {/* Zone Control Valve Station */}
                  <rect x="200" y="105" width="40" height="30" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
                  <text x="220" y="124" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle">ZCV</text>

                  {/* Branch Lines and Sprinkler Heads */}
                  {[300, 440, 580, 720, 840].map((bx, bIdx) => (
                    <g key={bIdx}>
                      <line x1={bx} y1="120" x2={bx} y2="520" stroke="#dc2626" strokeWidth="2.5" />
                      {[200, 280, 360, 440, 500].map((sy, sIdx) => (
                        <g key={sIdx}>
                          <circle cx={bx} cy={sy} r="6" fill="#f87171" stroke="#dc2626" strokeWidth="1" />
                          <circle cx={bx} cy={sy} r="20" fill="none" stroke="#ef4444" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />
                          <line x1={bx - 4} y1={sy - 4} x2={bx + 4} y2={sy + 4} stroke="#ffffff" strokeWidth="1" />
                          <line x1={bx + 4} y1={sy - 4} x2={bx - 4} y2={sy + 4} stroke="#ffffff" strokeWidth="1" />
                        </g>
                      ))}
                    </g>
                  ))}
                  <text x="320" y="170" fill="#f87171" fontSize="9" fontFamily="monospace">
                    68°C QUICK RESPONSE PENDANT SPRINKLER (K=5.6)
                  </text>
                </g>
              )}

              {/* 5. ELV / SECURITY DISCIPLINE */}
              {item.category === 'ELV & Telecom' && (
                <g id="ELV_Discipline">
                  {/* CCTV Cameras */}
                  {[
                    { x: 120, y: 100, rot: 45, id: 'CAM-01' },
                    { x: 540, y: 100, rot: 135, id: 'CAM-02' },
                    { x: 860, y: 100, rot: 225, id: 'CAM-03' },
                    { x: 340, y: 320, rot: 90, id: 'CAM-04' },
                    { x: 740, y: 520, rot: 315, id: 'CAM-05' },
                  ].map((cam, idx) => (
                    <g key={idx} transform={`translate(${cam.x}, ${cam.y})`}>
                      {/* Field of View Cone */}
                      <path d="M 0 0 L 70 -40 L 70 40 Z" fill="#06b6d4" fillOpacity="0.12" stroke="#67e8f9" strokeWidth="1" strokeDasharray="3 3" transform={`rotate(${cam.rot})`} />
                      {/* Camera Symbol */}
                      <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />
                      <circle cx="0" cy="0" r="4" fill="#00f0ff" />
                      <text x="14" y="5" fill="#38bdf8" fontSize="9" fontFamily="monospace">{cam.id}</text>
                    </g>
                  ))}

                  {/* Fire Alarm Devices */}
                  {[
                    { x: 250, y: 220, type: 'SMK' },
                    { x: 450, y: 220, type: 'SMK' },
                    { x: 650, y: 220, type: 'SMK' },
                    { x: 250, y: 440, type: 'MCP' },
                    { x: 650, y: 440, type: 'STRB' },
                  ].map((dev, idx) => (
                    <g key={idx}>
                      <circle cx={dev.x} cy={dev.y} r="12" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                      <text x={dev.x} y={dev.y + 4} fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        {dev.type}
                      </text>
                    </g>
                  ))}
                  <path d="M 120 100 L 250 220 L 450 220 L 650 220 L 860 100" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                </g>
              )}

              {/* 6. COORDINATION & DYNAMIC BLOCKS */}
              {item.category === 'Coordination & Blocks' && (
                <g id="Coordination_Discipline">
                  {/* Multi-discipline overlays with clash checks */}
                  <rect x="250" y="160" width="500" height="340" fill="#082f49" fillOpacity="0.3" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="250" y1="280" x2="750" y2="280" stroke="#00f0ff" strokeWidth="5" />
                  <line x1="420" y1="160" x2="420" y2="500" stroke="#a855f7" strokeWidth="4" />
                  <line x1="580" y1="160" x2="580" y2="500" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="420" cy="280" r="16" fill="none" stroke="#22c55e" strokeWidth="2" />
                  <text x="420" y="284" fill="#22c55e" fontSize="9" fontFamily="monospace" textAnchor="middle">0 CLASH</text>
                  <text x="445" y="270" fill="#00f0ff" fontSize="9" fontFamily="monospace">DUCT 600x300 (BOD: +3100)</text>
                  <text x="430" y="320" fill="#a855f7" fontSize="9" fontFamily="monospace">TRAY 300x50 (BOC: +3450)</text>
                </g>
              )}

              {/* Dimension Lines (Layer: M-ANNO-DIMS) */}
              {isLayerVisible('M-ANNO-DIMS') && (
                <g id="Dimensions" stroke="#e2e8f0" strokeWidth="1">
                  {/* Top Overall Dimension */}
                  <line x1="80" y1="30" x2="920" y2="30" />
                  <line x1="80" y1="20" x2="80" y2="40" />
                  <line x1="920" y1="20" x2="920" y2="40" />
                  <text x="500" y="24" fill="#e2e8f0" fontSize="11" fontFamily="monospace" textAnchor="middle">
                    18,500 mm OVERALL
                  </text>

                  {/* Left Height Dimension */}
                  <line x1="30" y1="60" x2="30" y2="640" />
                  <line x1="20" y1="60" x2="40" y2="60" />
                  <line x1="20" y1="640" x2="40" y2="640" />
                  <text x="22" y="350" fill="#e2e8f0" fontSize="11" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 22 350)">
                    12,800 mm
                  </text>
                </g>
              )}

              {/* Interactive Measure Ruler Render */}
              {measurePoints.length > 0 && (
                <g id="User_Measurement">
                  <circle cx="300" cy="300" r="4" fill="#f59e0b" />
                  {measurePoints.length === 2 && (
                    <>
                      <line x1="300" y1="300" x2="520" y2="300" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="520" cy="300" r="4" fill="#f59e0b" />
                      <rect x="360" y="280" width="100" height="20" fill="#0f172a" stroke="#f59e0b" rx="4" />
                      <text x="410" y="294" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                        {measureDistance || 3450} mm
                      </text>
                    </>
                  )}
                </g>
              )}
            </svg>
          ) : (
            /* Paper Space / Plot Sheet Preview (A1 Layout) */
            <div className="w-[820px] h-[580px] bg-white text-slate-900 border-4 border-slate-900 shadow-2xl p-6 relative flex flex-col justify-between">
              {/* Paper Sheet Inner Border */}
              <div className="absolute inset-3 border-2 border-slate-900 pointer-events-none"></div>

              {/* Viewport Frame */}
              <div className="flex-1 border border-dashed border-slate-400 bg-slate-950 p-4 relative overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 text-[10px] font-mono bg-cyan-600 text-white px-2 py-0.5 rounded">
                  VIEWPORT 1 (SCALE 1:50)
                </span>
                <div className="text-center">
                  <p className="text-cyan-400 font-mono text-sm font-bold tracking-wide">
                    [MODEL VIEWPORT ACTIVE - {item.category.toUpperCase()}]
                  </p>
                  <p className="text-slate-400 text-xs font-mono mt-1">
                    Layers Loaded: {item.layersCount} | Dwg Unit: {item.specs.units}
                  </p>
                </div>
              </div>

              {/* Professional ISO Title Block */}
              <div className="h-28 border-2 border-slate-900 mt-3 grid grid-cols-12 text-[11px] font-mono">
                {/* Consultant / Studio Branding */}
                <div className="col-span-3 border-r-2 border-slate-900 p-2 flex flex-col justify-between bg-slate-50">
                  <div className="font-extrabold text-sm text-cyan-800 tracking-wider">
                    RajaCAD STUDIOS
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Lead MEP Draughtsman
                    <br />
                    Rawalpindi / Islamabad
                  </div>
                </div>

                {/* Project Info */}
                <div className="col-span-5 border-r-2 border-slate-900 p-2 flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">Project:</div>
                    <div className="font-bold text-slate-800 truncate">{item.title}</div>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Trade: <span className="font-semibold text-slate-900">{item.category}</span>
                  </div>
                </div>

                {/* Drawing Meta / Revisions */}
                <div className="col-span-4 p-2 grid grid-cols-2 gap-1 bg-slate-50">
                  <div>
                    <span className="text-[9px] text-slate-500">DWG NO:</span>
                    <div className="font-bold text-slate-900 text-[10px]">RC-{item.id.slice(-6).toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">REV:</span>
                    <div className="font-bold text-slate-900 text-[10px]">02</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">SCALE:</span>
                    <div className="font-bold text-slate-900 text-[10px]">{item.specs.scale}</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">SHEET:</span>
                    <div className="font-bold text-slate-900 text-[10px]">01 OF 0{item.specs.sheetsCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Layer Manager Drawer */}
      {showLayerPanel && (
        <div className="absolute top-12 right-0 bottom-0 w-72 bg-[#091322]/95 backdrop-blur-md border-l border-cyan-900/50 p-4 overflow-y-auto z-20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Layer Properties
                </span>
              </div>
              <button
                onClick={() => setShowLayerPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Bulk Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setLayersState((prev) => prev.map((l) => ({ ...l, visible: true })))}
                className="flex-1 py-1 text-[10px] font-mono rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Show All
              </button>
              <button
                onClick={() => setLayersState((prev) => prev.map((l) => ({ ...l, visible: false })))}
                className="flex-1 py-1 text-[10px] font-mono rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Hide All
              </button>
            </div>

            {/* Layers List */}
            <div className="space-y-1.5">
              {layersState.map((layer) => (
                <div
                  key={layer.name}
                  onClick={() => toggleLayer(layer.name)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs font-mono ${
                    layer.visible
                      ? 'bg-cyan-950/40 border border-cyan-900/50 text-slate-200 hover:bg-cyan-950/60'
                      : 'bg-slate-900/40 border border-transparent text-slate-500 line-through opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: layer.color }}
                    ></span>
                    <span className="truncate text-[11px]">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{layer.elementCount}</span>
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Item Specs Summary & Download Action */}
          <div className="pt-4 border-t border-cyan-900/40 mt-4">
            <div className="text-[11px] font-mono text-slate-400 space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Standard:</span>
                <span className="text-cyan-300 font-semibold">{item.specs.standards.split('/')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="text-slate-200">{item.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Sheets:</span>
                <span className="text-slate-200">{item.specs.sheetsCount} Layouts</span>
              </div>
            </div>

            {onDownloadClick && (
              <button
                onClick={() => onDownloadClick(item)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isOwned || item.isFree ? 'Download CAD Package' : `Purchase DWG - $${item.price}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
