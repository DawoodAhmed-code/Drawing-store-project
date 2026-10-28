import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CadItem, PurchasedDownload, CustomDrawingRequest } from '../types/cad';
import { 
  DownloadCloud, 
  FileText, 
  CheckCircle2, 
  HardDrive, 
  Key, 
  Download, 
  Calendar, 
  Send, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { downloadCadPackage } from '../utils/fileDownloader';

interface UserDashboardProps {
  user: User | null;
  onSignInRequired: () => void;
  allCatalogItems: CadItem[];
  onOpenViewer: (item: CadItem) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSignInRequired,
  allCatalogItems,
  onOpenViewer,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'custom-requests'>('downloads');
  const [downloads, setDownloads] = useState<PurchasedDownload[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomDrawingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom request form states
  const [projectType, setProjectType] = useState('HVAC Ducting & Plant Room GA');
  const [scope, setScope] = useState('');
  const [urgency, setUrgency] = useState<'Standard (3-5 days)' | 'Urgent (24-48 hours)' | 'Immediate'>('Standard (3-5 days)');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState(false);

  // Fetch user's purchased downloads from Firestore
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const downloadsRef = collection(db, 'downloads');
    const q = query(downloadsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PurchasedDownload[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<PurchasedDownload, 'id'>) });
        });
        setDownloads(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, 'downloads');
      }
    );

    // Also fetch custom requests
    const reqRef = collection(db, 'custom_requests');
    const reqQuery = query(reqRef, where('userId', '==', user.uid));
    const unsubReq = onSnapshot(
      reqQuery,
      (snapshot) => {
        const reqList: CustomDrawingRequest[] = [];
        snapshot.forEach((d) => {
          reqList.push({ id: d.id, ...(d.data() as Omit<CustomDrawingRequest, 'id'>) });
        });
        setCustomRequests(reqList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'custom_requests');
      }
    );

    return () => {
      unsubscribe();
      unsubReq();
    };
  }, [user]);

  const handleDownloadFile = async (dl: PurchasedDownload) => {
    if (!user) {
      onSignInRequired();
      return;
    }

    const matchedItem = allCatalogItems.find((i) => i.id === dl.itemId) || {
      id: dl.itemId,
      title: dl.itemTitle,
      category: dl.category as any,
      subCategory: 'AutoCAD Package',
      description: 'Standard CAD drawing package',
      price: 0,
      fileFormat: dl.fileFormat,
      fileSize: dl.fileSize,
      dwgVersion: dl.dwgVersion,
      layersCount: 20,
      rating: 5,
      reviewsCount: 1,
      downloadsCount: 10,
      tags: [],
      software: ['AutoCAD'],
      author: 'RajaCAD',
      previewType: 'block' as const,
      layers: [
        { name: '0', color: '#ffffff', lineType: 'Continuous', visible: true, elementCount: 50 },
        { name: 'M-ANNO-TEXT', color: '#00f0ff', lineType: 'Continuous', visible: true, elementCount: 30 },
      ],
      specs: {
        units: 'Millimeters',
        scale: '1:50',
        standards: 'ISO / ASHRAE',
        ctbIncluded: true,
        sheetsCount: 3,
      },
    };

    // Trigger file download
    downloadCadPackage(matchedItem, dl.licenseKey, user.email || 'client@rajacad.com', user.displayName || 'Valued Client');

    // Increment download count in Firestore
    try {
      const docRef = doc(db, 'downloads', dl.id);
      await updateDoc(docRef, {
        downloadCount: increment(1),
        lastDownloadedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Update download count warning:', e);
    }
  };

  const handleCreateCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignInRequired();
      return;
    }
    if (!scope.trim()) return;

    try {
      setSubmittingRequest(true);
      const newRequest = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Client',
        projectType,
        scope,
        urgency,
        phone: phoneNumber,
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'custom_requests'), newRequest);
      setRequestSubmittedSuccess(true);
      setScope('');
      setPhoneNumber('');
      setTimeout(() => setRequestSubmittedSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'custom_requests');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto mb-4">
          <DownloadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 font-mono">
          Sign In to Access Your AutoCAD Library
        </h2>
        <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto font-mono">
          Access your purchased AutoCAD DWG drawings, direct DXF exports, commercial license keys, and unlimited re-downloads.
        </p>
        <button
          onClick={onSignInRequired}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition cursor-pointer"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* User Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1f3d] via-[#09152b] to-[#060c18] border border-cyan-800/50 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-16 h-16 rounded-2xl border-2 border-cyan-400 object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-xl font-mono font-bold shadow-lg">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user.displayName || 'Engineering Client'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Account
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                {user.email}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Client ID: <span className="text-slate-300">{user.uid.slice(0, 14)}...</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 font-mono text-center">
            <div className="px-4 py-3 rounded-2xl bg-[#060c18]/80 border border-cyan-900/40 min-w-[100px]">
              <div className="text-xl font-black text-cyan-400">{downloads.length}</div>
              <div className="text-[10px] text-slate-400 uppercase">Licensed Files</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#060c18]/80 border border-cyan-900/40 min-w-[100px]">
              <div className="text-xl font-black text-amber-400">{customRequests.length}</div>
              <div className="text-[10px] text-slate-400 uppercase">Custom Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-900/40 mb-8 font-mono text-xs overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('downloads')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>My Purchased Library ({downloads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom-requests')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'custom-requests'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Request Custom MEP CAD Drawing</span>
        </button>
      </div>

      {/* TAB 1: DOWNLOADS LIBRARY */}
      {activeTab === 'downloads' && (
        <div>
          {loading ? (
            <div className="py-16 text-center font-mono">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">Syncing your licensed CAD files from Firestore...</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-16 bg-[#091426] rounded-3xl border border-cyan-900/40 p-8 font-mono">
              <DownloadCloud className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No drawings in your library yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                You have not purchased or downloaded any AutoCAD files yet. Check out our free starter templates or commercial drawings.
              </p>
              <button
                onClick={() => {
                  const freeItem = allCatalogItems.find((i) => i.isFree);
                  if (freeItem) {
                    handleDownloadFile({
                      id: 'dl-free-' + Date.now(),
                      userId: user.uid,
                      itemId: freeItem.id,
                      itemTitle: freeItem.title,
                      category: freeItem.category,
                      dwgVersion: freeItem.dwgVersion,
                      fileFormat: freeItem.fileFormat,
                      fileSize: freeItem.fileSize,
                      licenseKey: 'FREE-STARTER-RC',
                      orderId: 'FREE-ORD-01',
                      downloadCount: 0,
                      createdAt: new Date().toISOString(),
                    });
                  }
                }}
                className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Download Free ISO Title Block Starter Pack
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloads.map((dl) => {
                const matchedItem = allCatalogItems.find((i) => i.id === dl.itemId);

                return (
                  <div
                    key={dl.id}
                    className="p-5 rounded-2xl bg-[#091426] border border-cyan-900/40 hover:border-cyan-500/60 transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {dl.category}
                        </span>
                        <span className="text-slate-400">{dl.dwgVersion}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 font-mono">
                        {dl.itemTitle}
                      </h4>

                      <div className="bg-[#060c18] p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Key className="w-3 h-3 text-amber-400" />
                            License:
                          </span>
                          <span className="text-amber-300 font-bold truncate max-w-[140px]">
                            {dl.licenseKey}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Archive:</span>
                          <span>{dl.fileFormat} ({dl.fileSize})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Downloads:</span>
                          <span className="text-emerald-400 font-bold">
                            {dl.downloadCount || 0} times
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 font-mono">
                      <button
                        onClick={() => handleDownloadFile(dl)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Instant Download DXF/DWG</span>
                      </button>

                      {matchedItem && (
                        <button
                          onClick={() => onOpenViewer(matchedItem)}
                          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-[11px] flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Inspect in 2D Viewport</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST CUSTOM CAD MEP DRAWING */}
      {activeTab === 'custom-requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Form */}
          <div className="lg:col-span-7 bg-[#091426] p-6 sm:p-8 rounded-3xl border border-cyan-800/60 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-mono">
                  Commission Custom MEP Draughting Service
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Submit architectural plans, heat load sheets, or markups for custom CAD conversion
                </p>
              </div>
            </div>

            {requestSubmittedSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>
                  Request submitted successfully! Our lead MEP draughtsman will review your requirements and follow up within 24 hours.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateCustomRequest} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1.5">Trade / Project Discipline:</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="HVAC Ducting & Plant Room GA">HVAC Ducting, Chillers & AHU Equipment</option>
                  <option value="Electrical SLD & Power Distribution">Electrical 11kV Substation & Panel SLD</option>
                  <option value="Lighting Layout & Cable Tray Routing">Lighting, Power & Cable Tray Routing</option>
                  <option value="Plumbing Booster System & Sewerage">Plumbing Water Supply & Gravity Sewerage</option>
                  <option value="NFPA Fire Sprinkler & Pump Station">NFPA-13 Fire Sprinklers & Fire Pump Room</option>
                  <option value="ELV IP-CCTV & Fire Alarm FAS">ELV CCTV, FAS Fire Alarm & Access Control</option>
                  <option value="CSD / SEM Clash-Free Coordination">CSD Combined Services Clash Coordination</option>
                  <option value="Hand-Drawn Sketch to AutoCAD Conversion">Hand-Drawn Blueprint to 2D CAD Conversion</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5">Project Scope & Specifications (Detailed):</label>
                <textarea
                  rows={4}
                  required
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. 5-story commercial building, need complete HVAC layout with 1200 CFM diffusers, 800x400 GI ducting, SMACNA standards, and A1 title block layout..."
                  className="w-full px-3 py-2.5 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1.5">Delivery Timeline Urgency:</label>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Standard (3-5 days)">Standard (3-5 days)</option>
                    <option value="Urgent (24-48 hours)">Urgent (24-48 hours)</option>
                    <option value="Immediate">Immediate Priority (Same Day)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5">Contact Phone / WhatsApp:</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2.5 bg-[#060c18] border border-cyan-900/50 rounded-xl text-white focus:outline-none focus:border-cyan-400 placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {submittingRequest ? (
                  <span>Submitting Drawing Brief...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Drawing Brief to RajaCAD Draughtsman</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Previous Requests List */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Your Custom Drawing Orders ({customRequests.length})
            </h4>

            {customRequests.length === 0 ? (
              <div className="bg-[#091426] p-6 rounded-2xl border border-cyan-900/40 text-center font-mono text-xs text-slate-400">
                No custom drawing orders yet. Fill out the project brief form to commission tailored CAD drawings.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {customRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#091426] border border-cyan-900/40 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 truncate">{req.projectType}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-3">
                      {req.scope}
                    </p>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                      <span>Timeline: {req.urgency}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
