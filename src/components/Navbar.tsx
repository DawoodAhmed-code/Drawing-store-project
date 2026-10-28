import React from 'react';
import { 
  Compass, 
  ShoppingCart, 
  Moon, 
  Sun, 
  Layers, 
  DownloadCloud, 
  FileText, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Cpu,
  Search,
  PlusCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MepCategory } from '../types/cad';

interface NavbarProps {
  currentTab: 'store' | 'categories' | 'dashboard' | 'custom-request' | 'admin';
  setCurrentTab: (tab: 'store' | 'categories' | 'dashboard' | 'custom-request' | 'admin') => void;
  selectedCategory: MepCategory;
  setSelectedCategory: (cat: MepCategory) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  currency: 'USD' | 'PKR';
  setCurrency: (curr: 'USD' | 'PKR') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedCategory,
  setSelectedCategory,
  isDarkMode,
  setIsDarkMode,
  cartCount,
  onOpenCart,
  user,
  onSignInClick,
  onSignOutClick,
  currency,
  setCurrency,
  searchQuery,
  setSearchQuery,
}) => {
  const isAdmin = user?.email === 'dawoodahmed0175@gmail.com';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 bg-[#070e1c]/90 border-cyan-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => setCurrentTab('store')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-navy-950 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition">
              <div className="w-full h-full bg-[#070e1c] rounded-[10px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-[#070e1c] animate-pulse"></div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  Raja<span className="text-cyan-400">CAD</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  MEP
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 font-mono tracking-wider -mt-1 hidden sm:block">
                AutoCAD Draughtsman Marketplace
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center relative w-72">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DWG, HVAC, SLD, Sprinkler..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#09152b] border border-cyan-900/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setCurrentTab('store')}
              className={`px-3 py-2 rounded-xl transition ${
                currentTab === 'store'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Drawings Catalog
            </button>

            <button
              onClick={() => setCurrentTab('categories')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'categories'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              MEP Trades
            </button>

            <button
              onClick={() => setCurrentTab('custom-request')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'custom-request'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Custom MEP Order
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              My Library
            </button>

            {/* Admin Hub Link */}
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700 shadow-sm'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Seller Studio
            </button>
          </nav>

          {/* Right Action Tools: Currency, Dark/Light Toggle, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <button
              onClick={() => setCurrency(currency === 'USD' ? 'PKR' : 'USD')}
              className="px-2.5 py-1.5 rounded-xl bg-[#09152b] border border-cyan-900/50 text-[11px] font-mono text-cyan-300 hover:border-cyan-400 transition"
              title="Switch Currency USD / PKR"
            >
              {currency === 'USD' ? '$ USD' : 'Rs PKR'}
            </button>

            {/* Dark / Light Mode Switch (Smooth Toggle as requested) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative p-2 rounded-xl bg-[#09152b] border border-cyan-900/50 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition duration-300"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400 transition-transform rotate-0 hover:-rotate-12 duration-300" />
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-[#09152b] border border-cyan-900/50 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-cyan-900/40">
                <div 
                  onClick={() => setCurrentTab('dashboard')}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Go to My Library & Dashboard"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-cyan-400 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-300 text-xs font-mono font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-slate-200 truncate max-w-[110px] group-hover:text-cyan-400">
                      {user.displayName?.split(' ')[0] || 'My Account'}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {isAdmin ? 'Admin' : 'Verified Buyer'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSignOutClick}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-cyan-900/30 font-mono text-[11px]">
          <button
            onClick={() => setCurrentTab('store')}
            className={`px-2 py-1 rounded ${currentTab === 'store' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Catalog
          </button>
          <button
            onClick={() => setCurrentTab('categories')}
            className={`px-2 py-1 rounded ${currentTab === 'categories' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            MEP Trades
          </button>
          <button
            onClick={() => setCurrentTab('custom-request')}
            className={`px-2 py-1 rounded ${currentTab === 'custom-request' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Custom
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2 py-1 rounded ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Library
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-2 py-1 rounded ${currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Studio
          </button>
        </div>
      </div>
    </header>
  );
};
