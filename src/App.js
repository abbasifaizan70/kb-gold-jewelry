import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  PlusCircle, 
  History, 
  BarChart3, 
  Scale, 
  Search, 
  Printer,
  Camera,
  Save,
  X,
  Settings,
  PenTool,
  Trash2,
  Watch,
  Gem,
  FileText,
  Download,
  Lock,
  Unlock,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { firebaseConfig, appId } from './firebaseConfig';

// --- Firebase Config ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Signature Canvas Component ---
const SignaturePad = ({ onSave, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = 200; 
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="relative border-2 border-slate-600 border-dashed rounded-xl bg-white overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-[200px] cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button 
        type="button"
        onClick={clearCanvas}
        className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
        title="Clear Signature"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none uppercase font-bold tracking-widest">
        Sign Here
      </div>
    </div>
  );
};

// --- Main Component ---
export default function GoldBuyBackApp() {
  // Security State
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSystemHalted, setIsSystemHalted] = useState(false);
  
  const SECRET_PIN = '9812';
  const MASTER_RESET_CODE = '159753'; 
  const MAX_ATTEMPTS = 5;

  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [firebaseError, setFirebaseError] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    auth: false,
    firestore: false,
    dataLoaded: false
  });
  
  // Report State
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const [settings, setSettings] = useState({
    storeName: 'KB GOLD JEWELRY',
    storeAddress: '123 Main St, Holland, MI',
    terms: 'I, the seller, certify that I am the legitimate owner of these goods and have the legal authority to sell them. I certify that they are not stolen. I understand that once sold, the transaction is final.',
    phone: '555-0123'
  });

  const [formData, setFormData] = useState({
    itemType: 'Gold',
    customerName: '',
    customerId: '',
    phone: '',
    itemDescription: '',
    weight: '',
    karat: '14k',
    brand: '',
    model: '',
    serialNumber: '',
    stoneCarat: '',
    stoneClarity: '',
    price: '',
    paymentMethod: 'Cash',
    notes: '',
    idImage: null,
    signatureImage: null
  });

  const [printData, setPrintData] = useState(null);
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  // --- Auth & Data ---
  useEffect(() => {
    const halted = localStorage.getItem('gb_system_halted');
    if (halted === 'true') {
      setIsSystemHalted(true);
    }

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        setFirebaseError(null);
        setSystemStatus(prev => ({ ...prev, auth: true }));
      } catch (error) {
        console.error("Auth error:", error);
        if (error.code === 'auth/configuration-not-found') {
          setFirebaseError('Firebase Authentication not enabled. Please enable Anonymous Auth in Firebase Console.');
        } else {
          setFirebaseError(`Firebase Error: ${error.message}`);
        }
        setSystemStatus(prev => ({ ...prev, auth: false }));
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const settingsRef = doc(db, `apps/${appId}/settings/main`);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setSettings(settingsSnap.data());
          }
        } catch (e) {
          console.error("Settings error:", e);
        }

        const q = query(
          collection(db, `apps/${appId}/purchases`), 
          orderBy('date', 'desc')
        );
        
        const unsubscribeData = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() 
          }));
          console.log(`✅ Loaded ${docs.length} transactions from Firestore`);
          setPurchases(docs);
          setLoading(false);
          setFirebaseError(null); // Clear error when data loads successfully
          setSystemStatus(prev => ({ ...prev, firestore: true, dataLoaded: true }));
        }, (error) => {
          console.error("❌ Firestore data error:", error);
          if (error.code === 'permission-denied') {
            setFirebaseError('Firestore permissions denied. Please set up Security Rules in Firebase Console (see FIRESTORE_RULES_FIX.md)');
          }
          setSystemStatus(prev => ({ ...prev, firestore: false, dataLoaded: false }));
          setLoading(false);
        });

        return () => unsubscribeData();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- Logic ---
  const handlePinSubmit = (e) => {
    e.preventDefault();

    if (isSystemHalted) {
      if (pinInput === MASTER_RESET_CODE) {
        setIsSystemHalted(false);
        setFailedAttempts(0);
        localStorage.removeItem('gb_system_halted');
        alert("System Reset Successful. Please enter standard PIN.");
        setPinInput('');
      } else {
        alert("Invalid Master Code.");
        setPinInput('');
      }
      return;
    }

    if (pinInput === SECRET_PIN) {
      setIsLocked(false);
      setFailedAttempts(0);
      setPinInput('');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setPinInput('');
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsSystemHalted(true);
        localStorage.setItem('gb_system_halted', 'true');
      } else {
        alert(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  const requestResetEmail = () => {
    const subject = "Urgent: KB Gold System Locked";
    const body = "The System has been locked due to too many failed PIN attempts. Please provide the Master Reset Code to unlock it.";
    window.location.href = `mailto:karelfonseca1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const saveSettings = async () => {
    if(!user) return;
    try {
      await setDoc(doc(db, `apps/${appId}/settings/main`), settings);
      alert("Settings saved.");
      setView('dashboard');
    } catch (error) { 
      console.error(error);
      alert("Error saving settings. Make sure Firebase is configured correctly.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, idImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSave = (base64) => {
    setFormData(prev => ({ ...prev, signatureImage: base64 }));
  };

  const handleSignatureClear = () => {
    setFormData(prev => ({ ...prev, signatureImage: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.signatureImage) {
      alert("Please ask the customer to sign before saving.");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        price: parseFloat(formData.price) || 0,
        date: Timestamp.now(),
        createdBy: user.uid
      };

      const newDoc = await addDoc(collection(db, `apps/${appId}/purchases`), dataToSave);
      
      const savedDataForPrint = { 
        ...dataToSave, 
        id: newDoc.id, 
        date: new Date() 
      };
      
      handlePrint(savedDataForPrint);

      setFormData({
        itemType: 'Gold',
        customerName: '', customerId: '', phone: '', itemDescription: '',
        weight: '', karat: '14k', brand: '', model: '', serialNumber: '', stoneCarat: '', stoneClarity: '',
        price: '', paymentMethod: 'Cash',
        notes: '', idImage: null, signatureImage: null
      });
      setView('history'); 
    } catch (error) {
      console.error("Error saving:", error);
      let errorMessage = "Error saving transaction.\n\n";
      
      if (error.code === 'permission-denied') {
        errorMessage += "❌ Permission Denied\n\nPlease set up Firestore Security Rules in Firebase Console:\n1. Go to Firestore Database → Rules\n2. Publish the security rules\n\nSee FIRESTORE_RULES_FIX.md for details.";
      } else if (error.code === 'unavailable') {
        errorMessage += "❌ Network Error\n\nPlease check your internet connection.";
      } else if (error.message.includes('firestore')) {
        errorMessage += "❌ Firestore not enabled\n\nPlease enable Firestore Database in Firebase Console.";
      } else {
        errorMessage += `Error: ${error.message}\n\nCheck browser console for details.`;
      }
      
      alert(errorMessage);
    }
  };

  const handlePrint = (transaction) => {
    setPrintData(transaction);
    setIsPrintingReport(false);
    setTimeout(() => window.print(), 500);
  };

  const handlePrintReport = () => {
    setIsPrintingReport(true);
    setTimeout(() => window.print(), 500);
  };

  const getItemIcon = (type) => {
    switch(type) {
      case 'Watch': return <Watch className="w-4 h-4 text-blue-400" />;
      case 'Diamond': return <Gem className="w-4 h-4 text-cyan-400" />;
      default: return <Scale className="w-4 h-4 text-amber-400" />;
    }
  }

  const getFilteredReportData = () => {
    return purchases.filter(p => {
      if(!p.date) return false;
      return p.date.getMonth() === reportMonth && p.date.getFullYear() === reportYear;
    });
  };

  const getAnalytics = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthPurchases = purchases.filter(p => p.date >= startOfMonth);
    
    const totalSpentMonth = thisMonthPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalGramsMonth = thisMonthPurchases.filter(p => p.itemType === 'Gold').reduce((sum, p) => sum + (p.weight || 0), 0);
    
    return { totalSpentMonth, totalGramsMonth, count: thisMonthPurchases.length };
  };

  const analytics = getAnalytics();

  const filteredPurchases = purchases.filter(p => {
    if (!searchTerm) return true; // Show all if no search term
    
    const searchLower = searchTerm.toLowerCase();
    const customerName = (p.customerName || '').toLowerCase();
    const itemDescription = (p.itemDescription || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const model = (p.model || '').toLowerCase();
    
    const matches = customerName.includes(searchLower) ||
           itemDescription.includes(searchLower) ||
           brand.includes(searchLower) ||
           model.includes(searchLower);
    
    console.log(`🔍 Searching "${searchTerm}" in:`, {
      customerName,
      itemDescription,
      brand,
      model,
      matches
    });
    
    return matches;
  });

  // --- SECURITY LOCK SCREEN ---
  if (isLocked) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-slate-200 transition-colors duration-500 ${isSystemHalted ? 'bg-red-950' : 'bg-slate-950'}`}>
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-sm text-center relative overflow-hidden">
           
           {/* BRANDING ON LOCK SCREEN */}
           <h2 className="text-amber-500 font-bold tracking-widest mb-6 text-xl uppercase">KB GOLD JEWELRY</h2>

           {isSystemHalted && (
             <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs font-bold py-1 uppercase tracking-widest animate-pulse">
               System Disabled
             </div>
           )}

           <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isSystemHalted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
             {isSystemHalted ? <AlertTriangle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
           </div>
           
           <h1 className="text-2xl font-bold text-white mb-2">
             {isSystemHalted ? 'SECURITY LOCKOUT' : 'Access Required'}
           </h1>
           
           <p className="text-sm text-slate-400 mb-6">
             {isSystemHalted 
               ? 'Too many failed attempts. System is currently halted for security.' 
               : 'Enter your PIN to access the system'}
           </p>
           
           <form onSubmit={handlePinSubmit} className="space-y-4">
             <input 
                type="tel" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                className={`w-full bg-slate-950 border rounded-xl py-4 text-center text-3xl tracking-[1em] text-white focus:ring-2 outline-none font-mono ${isSystemHalted ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-amber-500'}`}
                placeholder={isSystemHalted ? "••••••" : "••••"}
                autoFocus
             />
             <button type="submit" className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${isSystemHalted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-slate-900'}`}>
               <Unlock className="w-5 h-5" /> {isSystemHalted ? 'USE MASTER CODE' : 'UNLOCK SYSTEM'}
             </button>
           </form>

           {isSystemHalted && (
             <button onClick={requestResetEmail} className="mt-6 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-2 w-full py-2 hover:bg-red-900/30 rounded-lg transition-colors">
               <Mail className="w-3 h-3" /> Request Reset via Email
             </button>
           )}
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading system...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 md:pb-0 selection:bg-amber-500 selection:text-white">
      
      {/* Print Layouts */}
      {printData && !isPrintingReport && (
        <div className="print-only fixed inset-0 bg-white text-black p-8" style={{display: 'none'}}>
          <style>{`@media print { .print-only { display: block !important; } }`}</style>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold text-amber-600">{settings.storeName}</h1>
              <p className="text-sm">{settings.storeAddress}</p>
              <p className="text-sm">Phone: {settings.phone}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">BUY-BACK RECEIPT</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Date:</strong> {printData.date?.toLocaleString()}</div>
                <div><strong>Transaction ID:</strong> {printData.id?.substring(0, 8)}</div>
                <div><strong>Customer:</strong> {printData.customerName}</div>
                <div><strong>ID/License:</strong> {printData.customerId}</div>
                <div><strong>Phone:</strong> {printData.phone}</div>
                <div><strong>Payment:</strong> {printData.paymentMethod}</div>
              </div>
            </div>

            <div className="mb-6 border-t border-b border-gray-300 py-4">
              <h3 className="font-bold mb-2">ITEM DETAILS</h3>
              <div className="text-sm space-y-1">
                <div><strong>Type:</strong> {printData.itemType}</div>
                <div><strong>Description:</strong> {printData.itemDescription}</div>
                {printData.itemType === 'Gold' && (
                  <>
                    <div><strong>Weight:</strong> {printData.weight}g</div>
                    <div><strong>Karat:</strong> {printData.karat}</div>
                  </>
                )}
                {printData.itemType === 'Watch' && (
                  <>
                    <div><strong>Brand:</strong> {printData.brand}</div>
                    <div><strong>Model:</strong> {printData.model}</div>
                    <div><strong>Serial:</strong> {printData.serialNumber}</div>
                  </>
                )}
                {printData.itemType === 'Diamond' && (
                  <>
                    <div><strong>Carat:</strong> {printData.stoneCarat}ct</div>
                    <div><strong>Details:</strong> {printData.stoneClarity}</div>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-center py-4 bg-gray-100">
                AMOUNT PAID: ${printData.price?.toFixed(2)}
              </div>
            </div>

            <div className="mb-6 text-xs border border-gray-300 p-3 bg-gray-50">
              <p className="font-bold mb-2">TERMS & CONDITIONS:</p>
              <p>{settings.terms}</p>
            </div>

            {printData.signatureImage && (
              <div className="mb-4">
                <p className="text-sm font-bold mb-2">Customer Signature:</p>
                <img src={printData.signatureImage} alt="Signature" className="border border-black h-20" />
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-8">
              <p>Thank you for your business!</p>
              <p>This is your official receipt. Please retain for your records.</p>
            </div>
          </div>
        </div>
      )}

      {isPrintingReport && (
        <div className="print-only fixed inset-0 bg-white text-black p-8" style={{display: 'none'}}>
          <style>{`@media print { .print-only { display: block !important; } }`}</style>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{settings.storeName}</h1>
              <h2 className="text-xl">Monthly Transaction Report</h2>
              <p className="text-sm">{new Date(reportYear, reportMonth).toLocaleString('en', {month: 'long', year: 'numeric'})}</p>
            </div>
            
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left">Date</th>
                  <th className="border border-gray-400 p-2 text-left">Customer</th>
                  <th className="border border-gray-400 p-2 text-left">Item</th>
                  <th className="border border-gray-400 p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredReportData().map(p => (
                  <tr key={p.id}>
                    <td className="border border-gray-400 p-2">{p.date?.toLocaleDateString()}</td>
                    <td className="border border-gray-400 p-2">{p.customerName} ({p.customerId})</td>
                    <td className="border border-gray-400 p-2">{p.itemType}: {p.itemDescription}</td>
                    <td className="border border-gray-400 p-2 text-right">${p.price?.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td colSpan="3" className="border border-gray-400 p-2 text-right">TOTAL:</td>
                  <td className="border border-gray-400 p-2 text-right">
                    ${getFilteredReportData().reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APP UI */}
      <div className="no-print">
        <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg shadow-amber-500/20 shadow-lg">
              <Scale className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-500 tracking-tight leading-none hidden md:block">KB GOLD JEWELRY</h1>
              <h1 className="text-xl font-bold text-amber-500 tracking-tight leading-none md:hidden">KB GOLD</h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Management System</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('reports')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" title="Reports">
              <FileText className="w-6 h-6" />
            </button>
            <button onClick={() => setView('settings')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
            <button onClick={() => setIsLocked(true)} className="p-2 text-red-400 hover:text-red-200 hover:bg-slate-700 rounded-full transition-colors" title="Lock System">
              <Lock className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Firebase Configuration Warning */}
        {firebaseError && (
          <div className="bg-red-900 border-b border-red-700 p-4">
            <div className="max-w-5xl mx-auto flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">⚠️ Firebase Setup Required</h3>
                <p className="text-red-200 text-sm mb-2">{firebaseError}</p>
                <p className="text-red-300 text-xs">
                  📋 Check <span className="font-mono bg-red-800 px-1 py-0.5 rounded">FIREBASE_SETUP_STEPS.md</span> for detailed instructions.
                  You need to enable <strong>Anonymous Authentication</strong> and <strong>Firestore Database</strong> in Firebase Console.
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto p-4">
          
          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-400 uppercase">Spent (Month)</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold text-white">${analytics.totalSpentMonth.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-400 uppercase">Gold (Month)</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold text-amber-400">{analytics.totalGramsMonth.toFixed(2)} g</div></CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-400 uppercase">Transac. (Month)</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold text-blue-400">{analytics.count}</div></CardContent>
                </Card>
              </div>

              <button onClick={() => setView('new')} className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                <PlusCircle className="w-7 h-7" /><span className="text-lg">REGISTER NEW BUY-BACK</span>
              </button>
              
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2"><History className="w-4 h-4 text-amber-500" /> Recent</h3>
                  <button onClick={() => setView('history')} className="text-sm text-amber-500 hover:underline">View full history</button>
                </div>
                <div className="divide-y divide-slate-700">
                  {purchases.length > 0 ? (
                    purchases.slice(0, 3).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-4 hover:bg-slate-700/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-700 p-2 rounded-full h-fit">{getItemIcon(p.itemType)}</div>
                          <div>
                             <p className="font-bold text-white text-sm">{p.customerName}</p>
                             <p className="text-xs text-slate-400">{p.itemDescription}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-400">${p.price}</p>
                          <button onClick={() => handlePrint(p)} className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 mt-1 flex items-center gap-1 ml-auto"><Printer className="w-3 h-3" /> Receipt</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm mb-2">No transactions yet</p>
                      <p className="text-slate-500 text-xs">Create your first buy-back to see it here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NEW PURCHASE FORM */}
          {view === 'new' && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300 pb-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">New Buy-Back</h2>
                <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
                
                {/* TYPE SELECTOR */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1 rounded-lg">
                  {['Gold', 'Diamond', 'Watch'].map(type => (
                    <button 
                      type="button"
                      key={type}
                      onClick={() => setFormData({...formData, itemType: type})}
                      className={`py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${formData.itemType === type ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      {type === 'Gold' && <Scale className="w-4 h-4" />}
                      {type === 'Diamond' && <Gem className="w-4 h-4" />}
                      {type === 'Watch' && <Watch className="w-4 h-4" />}
                      {type}
                    </button>
                  ))}
                </div>

                {/* ID CAPTURE */}
                <div className="bg-slate-900/50 p-4 rounded-xl border-2 border-dashed border-slate-600 text-center hover:border-amber-500 transition-colors group">
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-3">
                      {formData.idImage ? (
                        <div className="relative">
                          <img src={formData.idImage} alt="ID Preview" className="h-24 w-auto rounded-lg shadow-md object-contain bg-black" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><span className="text-white text-xs font-bold">Change</span></div>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-300 group-hover:text-white" />
                          <span className="text-xs text-slate-500">Tap to Scan ID</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
                  </label>
                </div>

                {/* Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Full Name" />
                  <input required name="customerId" value={formData.customerId} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="ID / License #" />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="md:col-span-2 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Phone Number" />
                </div>

                {/* Dynamic Item Details */}
                <div className="space-y-4 border-t border-slate-700 pt-4">
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Item Details</h3>
                  <input required name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Short Description (e.g. 14k Chain, Rolex Submariner)" />
                  
                  {/* GOLD FIELDS */}
                  {formData.itemType === 'Gold' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                      <div className="relative">
                        <input required type="number" step="0.01" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-8 text-white" placeholder="Weight" />
                        <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">g</span>
                      </div>
                      <select name="karat" value={formData.karat} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
                        {['10k','14k','18k','22k','24k','Silver','Platinum'].map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  )}

                  {/* DIAMOND FIELDS */}
                  {formData.itemType === 'Diamond' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                      <div className="relative">
                        <input required type="number" step="0.01" name="stoneCarat" value={formData.stoneCarat} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-8 text-white" placeholder="Carat" />
                        <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">ct</span>
                      </div>
                      <input name="stoneClarity" value={formData.stoneClarity} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Clarity/Color/Cut" />
                    </div>
                  )}

                  {/* WATCH FIELDS */}
                  {formData.itemType === 'Watch' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                      <input required name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Brand (e.g. Rolex)" />
                      <input name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Model" />
                      <input name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className="col-span-2 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Serial Number" />
                    </div>
                  )}
                </div>

                {/* Payment & Signature */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                   <div className="relative">
                     <span className="absolute left-3 top-3 text-amber-500 font-bold">$</span>
                     <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-7 text-white font-bold text-lg" placeholder="0.00" />
                   </div>
                   <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
                      {['Cash','Check','Zelle','Wire'].map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>

                <div className="border-t border-slate-700 pt-4">
                   <p className="text-xs text-slate-400 mb-2">Sign Below:</p>
                   <SignaturePad onSave={handleSignatureSave} onClear={handleSignatureClear} />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setView('dashboard')} className="flex-1 bg-slate-700 text-white py-3 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-[2] bg-amber-500 text-white py-3 rounded-lg font-bold shadow-lg">SAVE & PRINT</button>
                </div>
              </form>
            </div>
          )}

          {/* REPORTS VIEW */}
          {view === 'reports' && (
            <div className="max-w-4xl mx-auto animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText /> Monthly Reports</h2>
                <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-end justify-between">
                <div className="flex gap-4 w-full md:w-auto">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Month</label>
                    <select value={reportMonth} onChange={(e) => setReportMonth(parseInt(e.target.value))} className="bg-slate-900 border border-slate-600 text-white p-2 rounded w-32">
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i} value={i}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Year</label>
                    <select value={reportYear} onChange={(e) => setReportYear(parseInt(e.target.value))} className="bg-slate-900 border border-slate-600 text-white p-2 rounded w-24">
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handlePrintReport} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg">
                  <Download className="w-4 h-4" /> PRINT / SAVE PDF
                </button>
              </div>

              <div className="bg-white text-black rounded-lg p-1 overflow-hidden shadow-xl opacity-90">
                <table className="w-full text-xs">
                  <thead className="bg-gray-200 text-gray-700 font-bold uppercase">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredReportData().length > 0 ? (
                      getFilteredReportData().map(p => (
                        <tr key={p.id} className="border-b border-gray-200 hover:bg-blue-50">
                          <td className="p-3">{p.date?.toLocaleDateString()}</td>
                          <td className="p-3">{p.customerName} <span className="text-gray-400">({p.customerId})</span></td>
                          <td className="p-3">
                             <span className="font-bold">{p.itemType}:</span> {p.itemDescription}
                          </td>
                          <td className="p-3 text-right font-bold">${p.price.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No transactions found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HISTORY VIEW */}
          {view === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <History /> History
                  <span className="text-sm font-normal text-slate-400">
                    ({filteredPurchases.length} of {purchases.length} shown)
                  </span>
                </h2>
                <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              
              {/* Debug info */}
              {purchases.length === 0 && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 text-xs">
                  <p className="text-yellow-400">⚠️ No purchases loaded from Firebase. Check browser console for errors.</p>
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by customer name, item, brand, or model..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white outline-none focus:ring-2 focus:ring-amber-500" 
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    title="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((p) => (
                    <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="bg-slate-700 p-2 rounded-full h-fit">{getItemIcon(p.itemType)}</div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{p.customerName}</h3>
                            <p className="text-sm text-slate-400">{p.date?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-amber-500">${p.price.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-3 rounded-lg text-sm border border-slate-700/50">
                        <span className="text-slate-300 font-bold block mb-1">{p.itemDescription}</span>
                        {p.itemType === 'Gold' && <span className="text-amber-500 text-xs">{p.weight}g • {p.karat}</span>}
                        {p.itemType === 'Watch' && <span className="text-blue-400 text-xs">{p.brand} {p.model} • SN: {p.serialNumber}</span>}
                        {p.itemType === 'Diamond' && <span className="text-cyan-400 text-xs">{p.stoneCarat}ct • {p.stoneClarity}</span>}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handlePrint(p)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-200">
                          <Printer className="w-4 h-4" /> Reprint
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center">
                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">
                      {searchTerm ? 'No results found' : 'No transactions yet'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {searchTerm 
                        ? `No transactions match "${searchTerm}". Try a different search term.`
                        : 'Create your first buy-back transaction to see it here.'
                      }
                    </p>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>

              {/* System Status */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Firebase Authentication</span>
                    <span className={`font-bold ${systemStatus.auth ? 'text-green-400' : 'text-red-400'}`}>
                      {systemStatus.auth ? '✅ Connected' : '❌ Not Connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Firestore Database</span>
                    <span className={`font-bold ${systemStatus.firestore ? 'text-green-400' : 'text-red-400'}`}>
                      {systemStatus.firestore ? '✅ Connected' : '❌ Not Connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Data Loaded</span>
                    <span className={`font-bold ${systemStatus.dataLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
                      {systemStatus.dataLoaded ? `✅ ${purchases.length} transactions` : '⚠️ No data'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Project ID</span>
                    <span className="text-slate-400 text-sm font-mono">{firebaseConfig.projectId}</span>
                  </div>
                </div>
                {(!systemStatus.auth || !systemStatus.firestore) && (
                  <div className="mt-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
                    <p className="text-red-400 text-sm font-bold mb-2">⚠️ Configuration Required</p>
                    <p className="text-red-300 text-xs">
                      Please complete Firebase setup:
                      <br/>• Enable Anonymous Authentication
                      <br/>• Create Firestore Database
                      <br/>• Publish Security Rules
                      <br/><br/>See FIREBASE_SETUP_STEPS.md for details.
                    </p>
                  </div>
                )}
              </div>

              {/* Store Settings */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Store Information</h3>
                <input value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Store Name" />
                <input value={settings.storeAddress} onChange={(e) => setSettings({...settings, storeAddress: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Address" />
                <input value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Phone" />
                <textarea value={settings.terms} onChange={(e) => setSettings({...settings, terms: e.target.value})} className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm" placeholder="Legal Terms" />
                <button onClick={saveSettings} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg font-bold mt-4 flex items-center justify-center gap-2"><Save className="w-5 h-5" /> SAVE CHANGES</button>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around p-3 z-20 pb-safe">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center ${view === 'dashboard' ? 'text-amber-500' : 'text-slate-500'}`}>
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </button>
          <button onClick={() => setView('new')} className="flex flex-col items-center -mt-8">
            <div className="bg-amber-500 text-white p-4 rounded-full shadow-lg shadow-amber-500/30 ring-4 ring-slate-900">
              <PlusCircle className="w-8 h-8" />
            </div>
          </button>
          <button onClick={() => setView('reports')} className={`flex flex-col items-center ${view === 'reports' ? 'text-amber-500' : 'text-slate-500'}`}>
            <FileText className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
