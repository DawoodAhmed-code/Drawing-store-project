import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CadItem, CartItem, MepCategory } from './types/cad';
import { INITIAL_CAD_ITEMS } from './data/initialCadCatalog';
import { Navbar } from './components/Navbar';
import { MepCategoryFilter } from './components/MepCategoryFilter';
import { DrawingCard } from './components/DrawingCard';
import { DrawingDetailModal } from './components/DrawingDetailModal';
import { CadBlueprintViewer } from './components/CadBlueprintViewer';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminStudio } from './components/AdminStudio';
import { AuthGateModal } from './components/AuthGateModal';
import { downloadCadPackage } from './utils/fileDownloader';
import { 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  CheckCircle2, 
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function App() {
  // Theme state: default dark as requested
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => true);

  // User auth state
  const [user, setUser] = useState<User | null>(null);

  // App Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<'store' | 'categories' | 'dashboard' | 'custom-request' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<MepCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dwgVersionFilter, setDwgVersionFilter] = useState<string>('All');
  const [freeOnlyFilter, setFreeOnlyFilter] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');

  // Catalog items
  const [catalogItems, setCatalogItems] = useState<CadItem[]>(INITIAL_CAD_ITEMS);

  // Modals state
  const [activeViewerItem, setActiveViewerItem] = useState<CadItem | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<CadItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [authGateMessage, setAuthGateMessage] = useState('Please sign in with Google to download AutoCAD drawings');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // User's owned download IDs
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);

  // 1. Sync theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 2. Auth State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen to user downloads to identify owned files
  useEffect(() => {
    if (!user) {
      setOwnedItemIds([]);
      return;
    }

    try {
      const q = collection(db, 'downloads');
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const ids: string[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            if (data.userId === user.uid && data.itemId) {
              ids.push(data.itemId);
            }
          });
          setOwnedItemIds(ids);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'downloads');
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Downloads listener catch:', e);
    }
  }, [user]);

  // 4. Listen to custom cad_items added dynamically in Firestore
  useEffect(() => {
    try {
      const cadItemsRef = collection(db, 'cad_items');
      const unsub = onSnapshot(
        cadItemsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const addedItems: CadItem[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data() as CadItem;
              if (!INITIAL_CAD_ITEMS.some((i) => i.id === data.id)) {
                addedItems.push({ ...data, id: doc.id });
              }
            });
            if (addedItems.length > 0) {
              setCatalogItems([...addedItems, ...INITIAL_CAD_ITEMS]);
            }
          }
        },
        (error) => {
          console.warn('Cad items sync:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Cad items init error:', e);
    }
  }, []);

  // Category counts
  const categoryCounts: Record<string, number> = {
    All: catalogItems.length,
    'Mechanical (HVAC)': catalogItems.filter((i) => i.category === 'Mechanical (HVAC)').length,
    Electrical: catalogItems.filter((i) => i.category === 'Electrical').length,
    'Plumbing & Drainage': catalogItems.filter((i) => i.category === 'Plumbing & Drainage').length,
    'Fire Fighting': catalogItems.filter((i) => i.category === 'Fire Fighting').length,
    'ELV & Telecom': catalogItems.filter((i) => i.category === 'ELV & Telecom').length,
    'Coordination & Blocks': catalogItems.filter((i) => i.category === 'Coordination & Blocks').length,
  };

  // Filtered Catalog
  const filteredCatalog = catalogItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubTitle = item.subtitle?.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const matchSub = item.subCategory.toLowerCase().includes(q);
      if (!matchTitle && !matchSubTitle && !matchTags && !matchSub) return false;
    }
    if (dwgVersionFilter !== 'All' && !item.dwgVersion.includes(dwgVersionFilter)) {
      return false;
    }
    if (freeOnlyFilter && !item.isFree) {
      return false;
    }
    return true;
  });

  // Add to cart handler
  const handleAddToCart = (item: CadItem) => {
    if (cartItems.some((ci) => ci.item.id === item.id)) return;
    setCartItems((prev) => [...prev, { item, quantity: 1 }]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Download Action with Strict Auth Gate
  const handleRequestDownload = (item: CadItem) => {
    if (!user) {
      setAuthGateMessage(`Please sign in to download "${item.title}".`);
      setIsAuthGateOpen(true);
      return;
    }

    const license = `RC-LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    downloadCadPackage(item, license, user.email || 'client@rajacad.com', user.displayName || 'Valued Client');

    if (!ownedItemIds.includes(item.id)) {
      setOwnedItemIds((prev) => [...prev, item.id]);
    }
  };

  const handleAddNewItem = (newItem: CadItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  const totalCartCount = cartItems.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#060c18] text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onSignInClick={() => setIsAuthGateOpen(true)}
        onSignOutClick={() => signOut(auth)}
        currency={currency}
        setCurrency={setCurrency}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* MAIN BODY SWITCH */}
      <main>
        {/* VIEWPORT 1: STORE / CATALOG / HOME */}
        {currentTab === 'store' && (
          <div>
            {/* Hero Banner with Deep Navy Blueprint Aesthetic */}
            <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-cyan-900/40 bg-gradient-to-b from-[#09152b] via-[#070e1c] to-[#060c18] cad-grid-pattern">
              {/* Subtle Ambient Navy Glow Orb */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-700/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-5xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs mb-6 shadow-lg shadow-cyan-950/50">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Professional MEP Draughtsman & AutoCAD Marketplace</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono leading-tight mb-4">
                  Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">AutoCAD & MEP</span> Drawings
                </h1>

                <p className="text-sm sm:text-base text-cyan-200/90 font-mono max-w-2xl mx-auto mb-3">
                  HVAC Ducting, 11kV Substation SLD, NFPA Fire Sprinklers, High-Rise Plumbing & 250+ Dynamic CAD Blocks.
                </p>

                <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-xl mx-auto mb-8">
                  Precision-engineered AutoCAD .DWG packages ready for instant 2D viewport inspection, purchase, and immediate download.
                </p>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-[#09152b]/80 px-3 py-1.5 rounded-xl border border-cyan-900/50">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>AutoCAD 2018 - 2024 DWG</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#09152b]/80 px-3 py-1.5 rounded-xl border border-cyan-900/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Commercial Multi-Seat License</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#09152b]/80 px-3 py-1.5 rounded-xl border border-cyan-900/50">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Standard ISO / ASHRAE Layers</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#09152b]/80 px-3 py-1.5 rounded-xl border border-cyan-900/50">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Instant Direct DXF/DWG Export</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Filter & Drawings Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              
              {/* Specialized MEP Trades Bar */}
              <MepCategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                counts={categoryCounts}
              />

              {/* Sub-filters & Search controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#091426] border border-cyan-900/40 mb-8 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Filters:
                  </span>

                  {/* DWG Version dropdown */}
                  <select
                    value={dwgVersionFilter}
                    onChange={(e) => setDwgVersionFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#060c18] border border-cyan-900/50 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="All">All AutoCAD Versions</option>
                    <option value="2024">AutoCAD 2024</option>
                    <option value="2022">AutoCAD 2022</option>
                    <option value="2018">AutoCAD 2018</option>
                  </select>

                  {/* Free Only Toggle */}
                  <button
                    onClick={() => setFreeOnlyFilter(!freeOnlyFilter)}
                    className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                      freeOnlyFilter
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Free DWGs Only
                  </button>

                  {(selectedCategory !== 'All' || dwgVersionFilter !== 'All' || freeOnlyFilter || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setDwgVersionFilter('All');
                        setFreeOnlyFilter(false);
                        setSearchQuery('');
                      }}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Reset filters
                    </button>
                  )}
                </div>

                <div className="text-slate-400 text-right">
                  Showing <span className="font-bold text-white">{filteredCatalog.length}</span> drawings
                </div>
              </div>

              {/* Cards Grid */}
              {filteredCatalog.length === 0 ? (
                <div className="py-20 text-center bg-[#091426] rounded-3xl border border-cyan-900/40 p-8 font-mono">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No AutoCAD drawings match your criteria</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Try adjusting your trade filters or search keyword.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setDwgVersionFilter('All');
                      setFreeOnlyFilter(false);
                      setSearchQuery('');
                    }}
                    className="py-2 px-4 rounded-xl bg-cyan-600 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    View All Drawings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.map((item) => (
                    <DrawingCard
                      key={item.id}
                      item={item}
                      onInspect={(i) => setDetailModalItem(i)}
                      onAddToCart={handleAddToCart}
                      onDownload={handleRequestDownload}
                      isOwned={ownedItemIds.includes(item.id)}
                      isInCart={cartItems.some((ci) => ci.item.id === item.id)}
                      currency={currency}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEWPORT 2: CATEGORIES BREAKDOWN VIEW */}
        {currentTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
                MEP Draughtsman Specialized Categories
              </h1>
              <p className="text-xs text-cyan-400 font-mono mt-1">
                Browse dedicated collections organized by engineering discipline
              </p>
            </div>

            <MepCategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setCurrentTab('store');
              }}
              counts={categoryCounts}
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((item) => (
                <DrawingCard
                  key={item.id}
                  item={item}
                  onInspect={(i) => setDetailModalItem(i)}
                  onAddToCart={handleAddToCart}
                  onDownload={handleRequestDownload}
                  isOwned={ownedItemIds.includes(item.id)}
                  isInCart={cartItems.some((ci) => ci.item.id === item.id)}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEWPORT 3: USER DASHBOARD / MY PURCHASED CAD LIBRARY */}
        {currentTab === 'dashboard' && (
          <UserDashboard
            user={user}
            onSignInRequired={() => setIsAuthGateOpen(true)}
            allCatalogItems={catalogItems}
            onOpenViewer={(item) => setActiveViewerItem(item)}
          />
        )}

        {/* VIEWPORT 4: CUSTOM DRAWING ORDER REQUEST */}
        {currentTab === 'custom-request' && (
          <UserDashboard
            user={user}
            onSignInRequired={() => setIsAuthGateOpen(true)}
            allCatalogItems={catalogItems}
            onOpenViewer={(item) => setActiveViewerItem(item)}
          />
        )}

        {/* VIEWPORT 5: SELLER / ADMIN STUDIO */}
        {currentTab === 'admin' && (
          <AdminStudio
            user={user}
            onSignInRequired={() => setIsAuthGateOpen(true)}
            catalog={catalogItems}
            onAddNewCadItem={handleAddNewItem}
            onOpenViewer={(item) => setActiveViewerItem(item)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-cyan-900/40 bg-[#050b16] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span className="text-lg font-black text-white">RajaCAD</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading marketplace for high-accuracy AutoCAD .DWG/.DXF drawings, MEP draughtsman packages, and dynamic block libraries.
            </p>
            <p className="text-[11px] text-cyan-400">
              Trusted engineering drawings & draughting solutions.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              MEP Disciplines
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setSelectedCategory('Mechanical (HVAC)'); setCurrentTab('store'); }} className="hover:text-cyan-400 transition cursor-pointer">
                  Mechanical / HVAC Ducts & Chillers
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Electrical'); setCurrentTab('store'); }} className="hover:text-cyan-400 transition cursor-pointer">
                  11kV Substation & Panel SLDs
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Plumbing & Drainage'); setCurrentTab('store'); }} className="hover:text-cyan-400 transition cursor-pointer">
                  Booster Pumps & Gravity Drainage
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategory('Fire Fighting'); setCurrentTab('store'); }} className="hover:text-cyan-400 transition cursor-pointer">
                  NFPA Fire Sprinkler & Pump Station
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('custom-request')} className="hover:text-cyan-400 transition cursor-pointer">
                  Request Custom CAD MEP Plan
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('dashboard')} className="hover:text-cyan-400 transition cursor-pointer">
                  My Purchased Library & Licenses
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('admin')} className="hover:text-amber-400 transition cursor-pointer">
                  Seller Studio Uploads
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Engineering Office
            </h4>
            <p className="text-slate-400 leading-relaxed">
              RajaCAD Draughtsman Studio
              <br />
              Rawalpindi / Islamabad
              <br />
              Contact: dawoodahmed0175@gmail.com
            </p>
            <div className="mt-3 flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Firebase Auth & Firestore Secured</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} RajaCAD. All rights reserved. Built for professional Draughtsmen & Engineers.</div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>DWG 2024 Ready</span>
            <span>•</span>
            <span>ASHRAE / NFPA / IEC Compliant</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: INTERACTIVE 2D CAD BLUEPRINT VIEWPORT */}
      {activeViewerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-6xl max-h-[95vh] flex flex-col">
            <CadBlueprintViewer
              item={activeViewerItem}
              onClose={() => setActiveViewerItem(null)}
              onDownloadClick={handleRequestDownload}
              isOwned={ownedItemIds.includes(activeViewerItem.id)}
            />
          </div>
        </div>
      )}

      {/* MODAL 2: DRAWING TECHNICAL DETAILS & SPEC SHEET */}
      {detailModalItem && (
        <DrawingDetailModal
          item={detailModalItem}
          onClose={() => setDetailModalItem(null)}
          onOpenViewer={(item) => {
            setDetailModalItem(null);
            setActiveViewerItem(item);
          }}
          onAddToCart={handleAddToCart}
          onDownload={handleRequestDownload}
          isOwned={ownedItemIds.includes(detailModalItem.id)}
          isInCart={cartItems.some((ci) => ci.item.id === detailModalItem.id)}
          currency={currency}
        />
      )}

      {/* MODAL 3: CART & PAYMENT GATEWAY */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        user={user}
        onSignInRequired={() => setIsAuthGateOpen(true)}
        currency={currency}
        onOrderCompleted={(boughtItems) => {
          setOwnedItemIds((prev) => [...prev, ...boughtItems.map((b) => b.id)]);
          setCurrentTab('dashboard');
        }}
      />

      {/* MODAL 4: AUTH GATE MODAL */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        actionMessage={authGateMessage}
      />
    </div>
  );
}
