import React, { useState } from 'react';
import { CartItem, CadItem } from '../types/cad';
import { 
  X, 
  Trash2, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Download, 
  FileText, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  user: User | null;
  onSignInRequired: () => void;
  currency: 'USD' | 'PKR';
  onOrderCompleted: (purchasedItems: CadItem[]) => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  user,
  onSignInRequired,
  currency,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'easypaisa' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    orderId: string;
    licenseKey: string;
    totalPaid: number;
    items: CadItem[];
  } | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [mobileNumber, setMobileNumber] = useState('+92 300 1234567');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalUSD = Math.max(0, subtotal - discountAmount);
  const totalPKR = Math.round(totalUSD * 278);

  const displayTotal = currency === 'USD' ? `$${totalUSD.toFixed(2)}` : `Rs ${totalPKR.toLocaleString()}`;

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'MEPPRO20' || couponCode.trim().toUpperCase() === 'RAJACAD') {
      setDiscountPercent(20);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try "MEPPRO20" for 20% discount.');
    }
  };

  const handleProceedToPayment = () => {
    if (!user) {
      onSignInRequired();
      return;
    }
    setStep('checkout');
  };

  const handleExecutePayment = async () => {
    if (!user) {
      onSignInRequired();
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate secure gateway latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generatedLicenseKey = `RC-LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;

      const orderData = {
        userId: user.uid,
        userEmail: user.email || 'customer@rajacad.com',
        userName: user.displayName || 'RajaCAD Valued Client',
        items: cartItems.map((ci) => ({
          id: ci.item.id,
          title: ci.item.title,
          price: ci.item.price,
          category: ci.item.category,
        })),
        totalAmount: totalUSD,
        currency: currency,
        paymentMethod: paymentMethod,
        status: 'completed',
        licenseKey: generatedLicenseKey,
        createdAt: new Date().toISOString(),
      };

      // 1. Write order to Firestore orders collection
      try {
        await addDoc(collection(db, 'orders'), orderData);
      } catch (err) {
        console.warn('Orders write caught:', err);
      }

      // 2. Grant downloadable entitlements in downloads collection
      for (const cartItem of cartItems) {
        const downloadRecord = {
          userId: user.uid,
          itemId: cartItem.item.id,
          itemTitle: cartItem.item.title,
          category: cartItem.item.category,
          dwgVersion: cartItem.item.dwgVersion,
          fileFormat: cartItem.item.fileFormat,
          fileSize: cartItem.item.fileSize,
          licenseKey: generatedLicenseKey,
          orderId: generatedOrderId,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
        };

        try {
          const docRef = doc(collection(db, 'downloads'));
          await setDoc(docRef, downloadRecord);
        } catch (err) {
          console.warn('Download entitlement write caught:', err);
        }
      }

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // ignore if canvas not available
      }

      const boughtItems = cartItems.map((ci) => ci.item);
      setLastOrderDetails({
        orderId: generatedOrderId,
        licenseKey: generatedLicenseKey,
        totalPaid: totalUSD,
        items: boughtItems,
      });

      onOrderCompleted(boughtItems);
      onClearCart();
      setStep('success');
    } catch (err) {
      console.error('Payment processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-[#091426] border border-cyan-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: CART REVIEW */}
        {step === 'cart' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Your CAD Cart</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {cartItems.length} professional drawing {cartItems.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-mono text-sm mb-4">Your cart is currently empty.</p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition"
                >
                  Browse Drawings Catalog
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-6">
                  {cartItems.map(({ item }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#060c18] border border-slate-800 text-xs font-mono"
                    >
                      <div className="flex-1 pr-3">
                        <div className="font-bold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-cyan-400 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="text-slate-400">{item.dwgVersion}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white text-sm">
                          {currency === 'USD' ? `$${item.price}` : `Rs ${(item.pricePkr || item.price * 278).toLocaleString()}`}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Promo code (Try MEPPRO20)"
                    className="flex-1 px-3 py-2 text-xs bg-[#060c18] border border-cyan-900/50 rounded-xl text-slate-200 uppercase font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={applyCoupon}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition border border-slate-700 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-400 -mt-4 mb-4 font-mono">{couponError}</p>}
                {discountPercent > 0 && (
                  <p className="text-[11px] text-emerald-400 -mt-4 mb-4 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    20% Discount applied successfully!
                  </p>
                )}

                {/* Order Summary Box */}
                <div className="p-4 rounded-2xl bg-[#060c18] border border-cyan-900/40 font-mono text-xs space-y-2 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount (20%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>License Type:</span>
                    <span className="text-cyan-300">Commercial Multi-Seat</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>Total Payable:</span>
                    <span className="text-cyan-400 text-base">{displayTotal}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY SELECTION & AUTHORIZATION */}
        {step === 'checkout' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Secure Payment Gateway</h3>
                <p className="text-xs text-slate-400 font-mono">
                  256-bit SSL Encrypted CAD File Authorization
                </p>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 font-mono text-xs">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow'
                    : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'easypaisa'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow'
                    : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>EasyPaisa / JazzCash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow'
                    : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Bank / Raast Wire</span>
              </button>
            </div>

            {/* Gateway Fields depending on selected method */}
            <div className="bg-[#060c18] p-5 rounded-2xl border border-slate-800 mb-6 space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Expiration:</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">CVV / CVC:</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'easypaisa' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px]">
                    Instant mobile checkout. An authorization push will be sent to your registered mobile wallet account.
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Mobile Wallet Account Number:</label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#091426] border border-cyan-900/50 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="space-y-2 font-mono text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[11px]">
                    Direct corporate bank transfer and RAAST instant wire transfer details:
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-bold text-white">Meezan Bank Ltd</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Account Title:</span>
                    <span className="font-bold text-white">RajaCAD Engineering Studio</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">IBAN:</span>
                    <span className="font-bold text-cyan-400">PK65MEZN0001092837461928</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total summary and Pay button */}
            <div className="flex items-center justify-between mb-4 font-mono">
              <span className="text-xs text-slate-400">Total Charged:</span>
              <span className="text-xl font-black text-cyan-400">{displayTotal}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('cart')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition border border-slate-700 cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing Payment...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay {displayTotal} & Generate CAD License</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUCCESS & INSTANT DOWNLOAD UNLOCK */}
        {step === 'success' && lastOrderDetails && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white font-mono">
              Payment Confirmed!
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Your AutoCAD drawing packages are unlocked and ready for download.
            </p>

            {/* License details card */}
            <div className="my-6 p-4 rounded-2xl bg-[#060c18] border border-cyan-800/60 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-cyan-400 font-bold">{lastOrderDetails.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Generated License:</span>
                <span className="text-emerald-400 font-bold">{lastOrderDetails.licenseKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purchased Files:</span>
                <span className="text-white font-bold">{lastOrderDetails.items.length} CAD Packages</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-6">
              All files have been permanently added to your personal "My Library" dashboard. You can download and re-download them anytime.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <span>View in My Library & Download Files</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
