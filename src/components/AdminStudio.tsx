import React, { useState } from 'react';
import { CadItem, MepCategory } from '../types/cad';
import { 
  PlusCircle, 
  Upload, 
  CheckCircle2, 
  Database,
  Eye
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AdminStudioProps {
  user: User | null;
  onSignInRequired: () => void;
  catalog: CadItem[];
  onAddNewCadItem: (item: CadItem) => void;
  onOpenViewer: (item: CadItem) => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({
  user,
  catalog,
  onAddNewCadItem,
  onOpenViewer,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<MepCategory>('Mechanical (HVAC)');
  const [subCategory, setSubCategory] = useState('Chilled Water & Ductwork');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('29');
  const [pricePkr, setPricePkr] = useState('8000');
  const [isFree, setIsFree] = useState(false);
  const [fileFormat, setFileFormat] = useState('DWG, DXF, PDF Plot');
  const [fileSize, setFileSize] = useState('34.2 MB');
  const [dwgVersion, setDwgVersion] = useState('AutoCAD 2018 - 2024');
  const [layersCount, setLayersCount] = useState(24);
  const [standards, setStandards] = useState('ASHRAE / SMACNA / CIBSE');
  const [scale, setScale] = useState('1:50 & 1:100');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePublishCadDrawing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSaving(true);
      const newItem: CadItem = {
        id: `cad-user-${Date.now()}`,
        title,
        subtitle: subtitle.trim() || undefined,
        category,
        subCategory,
        description,
        price: isFree ? 0 : Number(price) || 0,
        originalPrice: isFree ? 15 : (Number(price) || 0) + 20,
        pricePkr: isFree ? 0 : Number(pricePkr) || 0,
        isFree,
        featured: true,
        fileFormat,
        fileSize,
        dwgVersion,
        layersCount: Number(layersCount) || 16,
        rating: 5.0,
        reviewsCount: 1,
        downloadsCount: 0,
        tags: [category.split(' ')[0], subCategory.split(' ')[0], 'AutoCAD', 'DWG'],
        software: ['AutoCAD', 'AutoCAD MEP', 'Revit'],
        author: user?.displayName || 'Engr. Raja Dawood',
        authorId: user?.uid,
        previewType: category.includes('HVAC')
          ? 'hvac'
          : category.includes('Electrical')
          ? 'electrical'
          : category.includes('Plumbing')
          ? 'plumbing'
          : category.includes('Fire')
          ? 'fire'
          : category.includes('ELV')
          ? 'elv'
          : 'block',
        specs: {
          units: 'Millimeters (Metric)',
          scale,
          standards,
          ctbIncluded: true,
          sheetsCount: 4,
        },
        layers: [
          { name: 'M-MAIN-DRAW', color: '#00f0ff', lineType: 'Continuous', visible: true, elementCount: 85 },
          { name: 'M-EQUIP-TAG', color: '#f59e0b', lineType: 'Continuous', visible: true, elementCount: 40 },
          { name: 'A-WALL-GRID', color: '#64748b', lineType: 'Grid', visible: true, elementCount: 60 },
          { name: 'M-ANNO-DIMS', color: '#ffffff', lineType: 'Continuous', visible: true, elementCount: 95 },
        ],
        createdAt: new Date().toISOString(),
      };

      // 1. Save to local state
      onAddNewCadItem(newItem);

      // 2. Persist to Firestore if signed in
      if (user) {
        try {
          await addDoc(collection(db, 'cad_items'), {
            ...newItem,
            savedBy: user.email,
          });
        } catch (err) {
          console.warn('Cad item cloud save note:', err);
        }
      }

      setSuccessMessage('AutoCAD drawing package published to RajaCAD catalog successfully!');
      setTitle('');
      setSubtitle('');
      setDescription('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalDownloads = catalog.reduce((sum, item) => sum + item.downloadsCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h1 className="text-2xl font-black text-white font-mono">
              RajaCAD Seller Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Publish your AutoCAD drawings, set commercial pricing, and manage your MEP marketplace inventory
          </p>
        </div>

        {/* Studio Summary Metrics */}
        <div className="flex items-center gap-3 font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#09152b] border border-cyan-900/50 text-right">
            <span className="text-[10px] text-slate-400 block">Catalog Inventory:</span>
            <span className="text-sm font-bold text-cyan-400">{catalog.length} DWG Packages</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#09152b] border border-cyan-900/50 text-right">
            <span className="text-[10px] text-slate-400 block">Total Downloads:</span>
            <span className="text-sm font-bold text-emerald-400">{totalDownloads.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload & Add Drawing Form */}
        <div className="lg:col-span-7 bg-[#091426] p-6 sm:p-8 rounded-3xl border border-cyan-800/60 shadow-xl">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-cyan-900/40">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-mono">
              Upload New AutoCAD Drawing Package
            </h3>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handlePublishCadDrawing} className="space-y-4 font-mono text-xs">
            {/* Drawing Title */}
            <div>
              <label className="text-slate-300 block mb-1">Drawing Package Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hospital 1000 Bed Chilled Water AHU & VAV System Layout"
                className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Subtitle / Scope Tagline */}
            <div>
              <label className="text-slate-300 block mb-1">Subtitle / Scope Summary:</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Primary Loop Piping, VAV Sizing & SMACNA Ducting GA"
                className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Discipline Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1">MEP Discipline Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MepCategory)}
                  className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Mechanical (HVAC)">Mechanical (HVAC)</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing & Drainage">Plumbing & Drainage</option>
                  <option value="Fire Fighting">Fire Fighting</option>
                  <option value="ELV & Telecom">ELV & Telecom</option>
                  <option value="Coordination & Blocks">Coordination & Blocks</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Sub-Category:</label>
                <input
                  type="text"
                  required
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Primary Chilled Water Loops"
                  className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Pricing Controls */}
            <div className="p-4 rounded-2xl bg-[#060c18] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Pricing Model:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-emerald-400 font-bold">Free Starter Download</span>
                </label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Price in USD ($):</label>
                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setPricePkr(String(Number(e.target.value) * 278));
                      }}
                      className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Price in PKR (Rs):</label>
                    <input
                      type="number"
                      value={pricePkr}
                      onChange={(e) => setPricePkr(e.target.value)}
                      className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specs: DWG Version, Standards, File Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">DWG Version:</label>
                <input
                  type="text"
                  value={dwgVersion}
                  onChange={(e) => setDwgVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Archive Size:</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Layer Count:</label>
                <input
                  type="number"
                  value={layersCount}
                  onChange={(e) => setLayersCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Scope / Description */}
            <div>
              <label className="text-slate-300 block mb-1">Description & Engineering Scope:</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include equipment schedules, standards (ASHRAE, NFPA, IEC), layer naming, and drawing contents..."
                className="w-full px-3 py-2 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Publishing to RajaCAD Catalog...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish AutoCAD Drawing to Store</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Store Inventory Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Active Listings ({catalog.length})
            </h4>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {catalog.map((cad) => (
              <div
                key={cad.id}
                className="p-4 rounded-2xl bg-[#091426] border border-cyan-900/40 font-mono text-xs space-y-2 hover:border-cyan-600/60 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {cad.category}
                    </span>
                    <h5 className="font-bold text-white mt-1 line-clamp-1">{cad.title}</h5>
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    {cad.isFree ? 'FREE' : `$${cad.price}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>{cad.fileSize} • {cad.layersCount} Layers</span>
                  <button
                    onClick={() => onOpenViewer(cad)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
