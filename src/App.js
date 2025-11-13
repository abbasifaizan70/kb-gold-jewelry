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
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
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
  Trash2,
  Watch,
  Gem,
  FileText,
  Download,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
  Fingerprint,
  ChevronRight,
  Coins,
  ArrowLeft,
  CreditCard,
  Calendar,
  Edit,
  UserCheck,
  Clock,
  List,
  ChevronDown,
  Key,
  MapPin
} from 'lucide-react';
import { firebaseConfig, appId } from './firebaseConfig';

// --- Firebase Config ---
// Now importing directly from firebaseConfig.js instead of using global variables

// Initialize Firebase
let app, db, auth;
try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

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
  // --- Security State ---
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSystemHalted, setIsSystemHalted] = useState(false);
  
  const [currentPin, setCurrentPin] = useState('9812'); 
  const [masterResetCode, setMasterResetCode] = useState('159753'); 
  
  const MAX_ATTEMPTS = 5;

  // --- App State ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Details & Filtering State
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [breakdownType, setBreakdownType] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [foundCustomer, setFoundCustomer] = useState(null); 
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('Monthly'); 

  // Filtered List State
  const [listCriteria, setListCriteria] = useState(null); 
  const [listSearch, setListSearch] = useState('');
  const [listDateFilter, setListDateFilter] = useState('');

  // Report Range State
  // Use simple string initialization to avoid hydration mismatch or crash
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [showReportPresets, setShowReportPresets] = useState(false); 

  // Initialize dates on mount
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setReportStartDate(firstDay.toISOString().split('T')[0]);
    setReportEndDate(today.toISOString().split('T')[0]);
  }, []);

  // --- Settings State ---
  const defaultStores = [
    { name: 'Holland', address: '123 Main St, Holland, MI' },
    { name: 'Grand Rapids', address: '456 Market Ave, Grand Rapids, MI' },
  ];

  const [settings, setSettings] = useState({
    storeName: 'KB GOLD JEWELRY',
    phone: '555-0123',
    terms: 'I, the seller, certify that I am the legitimate owner of these goods and have the legal authority to sell them. I certify that they are not stolen. I understand that once sold, the transaction is final.',
    stores: defaultStores
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    pin: '9812',
    masterCode: '159753',
    securityPinInput: '', 
    securityUnlocked: false, 
  });
  const [settingsView, setSettingsView] = useState('general'); 

  const initialFormState = {
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
    checkNumber: '', 
    notes: '',
    idImage: null,
    signatureImage: null,
    storeLocation: defaultStores[0].name 
  };

  const [formData, setFormData] = useState(initialFormState);
  const [printData, setPrintData] = useState(null);
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  // --- INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const halted = localStorage.getItem('gb_system_halted');
    if (halted === 'true') {
      setIsSystemHalted(true);
    }

    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        
        try {
          const settingsRef = doc(db, `apps/${appId}/data/settings`);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            
            const loadedStores = data.stores || defaultStores;
            setSettings({
               storeName: data.storeName || 'KB GOLD JEWELRY',
               phone: data.phone || '555-0123',
               terms: data.terms || initialFormState.terms,
               stores: loadedStores
            });
            setFormData(prev => ({...prev, storeLocation: loadedStores[0].name }));
            
            const pin = data.pin || '9812';
            const masterCode = data.masterCode || '159753';

            setCurrentPin(pin);
            setMasterResetCode(masterCode);
            setSecuritySettings(prev => ({
                ...prev,
                pin: pin,
                masterCode: masterCode,
            }));
          }
        } catch (e) {
          console.error("Error loading settings:", e);
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
          setPurchases(docs);
          setLoading(false);
        });
        return () => unsubscribeData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [user]); 

  // --- SECURITY LOGIC ---
  const handlePinSubmit = (e) => {
    e.preventDefault();

    if (isSystemHalted) {
      if (pinInput === masterResetCode) { 
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

    if (pinInput === currentPin) { 
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

  // --- STORE MANAGEMENT ---
  const handleStoreChange = (index, field, value) => {
    const newStores = [...settings.stores];
    newStores[index][field] = value;
    setSettings({...settings, stores: newStores});
  };

  const addStore = () => {
    setSettings({...settings, stores: [...settings.stores, { name: '', address: '' }]});
  };

  const removeStore = (index) => {
    const newStores = settings.stores.filter((_, i) => i !== index);
    setSettings({...settings, stores: newStores});
  };

  const saveGeneralSettings = async () => {
    if(!user) return;
    if (settings.stores.some(s => !s.name || !s.address)) {
        alert("All store names and addresses must be filled.");
        return;
    }

    try {
      const settingsRef = doc(db, `apps/${appId}/data/settings`);
      await setDoc(settingsRef, { 
        storeName: settings.storeName,
        phone: settings.phone,
        terms: settings.terms,
        stores: settings.stores 
      }, { merge: true });
      alert("General settings saved.");
      setView('dashboard');
    } catch (error) { console.error("Error saving settings:", error); }
  };
  
  const handleSecurityUnlock = (e) => {
      e.preventDefault();
      if (securitySettings.securityPinInput === masterResetCode) {
          setSecuritySettings(prev => ({ ...prev, securityUnlocked: true, securityPinInput: '' }));
          alert("Security access granted.");
      } else {
          alert("Incorrect Master Code.");
          setSecuritySettings(prev => ({ ...prev, securityPinInput: '' }));
      }
  };

  const saveSecuritySettings = async () => {
      if(!user || !securitySettings.securityUnlocked) return;
      
      const newPin = securitySettings.pin;
      const newMasterCode = securitySettings.masterCode;
      
      if (newPin.length < 4 || newMasterCode.length < 6) {
          alert("PIN must be 4+ digits. Master Code must be 6+ digits.");
          return;
      }
      
      try {
          const settingsRef = doc(db, `apps/${appId}/data/settings`);
          await setDoc(settingsRef, { pin: newPin, masterCode: newMasterCode }, { merge: true });
          
          setCurrentPin(newPin);
          setMasterResetCode(newMasterCode);
          
          alert("Security PINs updated successfully. Use the new PIN next time you log in.");
          setSecuritySettings(prev => ({ ...prev, securityUnlocked: false }));
          setView('settings');
          setSettingsView('general');
          
      } catch (error) {
          console.error("Error saving security settings:", error);
          alert("Error saving security settings.");
      }
  };
  
  // --- FORM LOGIC ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Simple autofill logic
    if ((name === 'phone' && value.length > 3) || (name === 'customerId' && value.length > 3)) {
      const match = purchases.find(p => 
        (name === 'phone' && p.phone === value) || 
        (name === 'customerId' && p.customerId === value)
      );
      
      if (match) {
        setFoundCustomer({
          name: match.customerName,
          id: match.customerId,
          phone: match.phone
        });
      } else {
        setFoundCustomer(null);
      }
    }
  };

  const applyFoundCustomer = () => {
    if (foundCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: foundCustomer.name,
        customerId: foundCustomer.id,
        phone: foundCustomer.phone || ''
      }));
      setFoundCustomer(null); 
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image before saving
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max width/height: 800px)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG (0.7 quality)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, idImage: compressedImage }));
        };
        img.src = reader.result;
      };
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
    
    // Check if Firebase is connected
    if (!db || !auth) {
      alert("Firebase not connected. Please refresh the page and try again.");
      return;
    }
    
    if (!user) {
      alert("Not authenticated. Please refresh the page and try again.");
      return;
    }

    if (!formData.signatureImage) {
      alert("Please ask the customer to sign before saving.");
      return;
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerId) {
      alert("Customer name and ID are required.");
      return;
    }

    if (!formData.itemDescription) {
      alert("Item description is required.");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        price: parseFloat(formData.price) || 0,
        date: editingId ? (formData.date || Timestamp.now()) : Timestamp.now(),
        lastModified: Timestamp.now(),
        modifiedBy: user.uid
      };

      if (editingId) {
        await updateDoc(doc(db, `apps/${appId}/purchases`, editingId), dataToSave);
        alert("Transaction updated successfully.");
        // Update local selected purchase for viewing
        const updatedData = { ...dataToSave, id: editingId, date: dataToSave.date.toDate ? dataToSave.date.toDate() : new Date() };
        setSelectedPurchase(updatedData); 
      } else {
        const newDoc = await addDoc(collection(db, `apps/${appId}/purchases`), {
          ...dataToSave,
          createdBy: user.uid
        });
        
        const savedDataForPrint = { 
          ...dataToSave, 
          id: newDoc.id, 
          date: new Date() 
        };
        handlePrint(savedDataForPrint);
      }

      // Reset form but keep location
      const currentLocation = formData.storeLocation;
      setFormData({...initialFormState, storeLocation: currentLocation});
      setEditingId(null);
      setFoundCustomer(null);
      
      if (editingId) {
         setView('detail'); 
      } else {
         setView('history'); 
      }
      
    } catch (error) {
      console.error("Error saving:", error);
      let errorMessage = "Error saving transaction.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check Firebase security rules.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Not authenticated. Please refresh and try again.";
      } else if (error.message && error.message.includes('maximum allowed size')) {
        errorMessage = "Image file is too large. Please try taking a new photo with lower quality or retake the ID photo.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (purchase) => {
    setFormData({
      ...purchase,
      weight: purchase.weight || '',
      price: purchase.price || '',
      stoneCarat: purchase.stoneCarat || '',
    });
    setEditingId(purchase.id);
    setView('new');
  };

  const handleDelete = async (purchase) => {
    const confirmPin = prompt(`SECURITY CHECK: Enter PIN (${currentPin} or Master Code) to delete this record:`);
    if (confirmPin !== currentPin && confirmPin !== masterResetCode) {
      alert("Incorrect PIN. Deletion cancelled.");
      return;
    }
    
    if(window.confirm(`Are you sure you want to PERMANENTLY DELETE the transaction for ${purchase.customerName}?`)) {
      try {
        await deleteDoc(doc(db, `apps/${appId}/purchases`, purchase.id));
        alert("Transaction deleted.");
        setView('history');
        setSelectedPurchase(null);
      } catch (err) {
        console.error(err);
        alert("Error deleting transaction.");
      }
    }
  };

  // --- PRINTING & REPORTS ---
  const handlePrint = (transaction) => {
    setPrintData(transaction);
    setIsPrintingReport(false);
    setTimeout(() => window.print(), 500);
  };

  const handlePrintReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Please select both start and end dates for the report.");
      return;
    }
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    if (start > end) {
      alert("The start date cannot be after the end date.");
      return;
    }
    setIsPrintingReport(true);
    setTimeout(() => window.print(), 500);
  };
  
  const getFilteredReportData = () => {
    if (!reportStartDate || !reportEndDate) return [];
    const startDate = new Date(reportStartDate);
    const endDate = new Date(reportEndDate);
    endDate.setDate(endDate.getDate() + 1); // Include end date

    return purchases.filter(p => {
      if(!p.date) return false;
      return p.date >= startDate && p.date < endDate;
    });
  };
  
  const applyDatePreset = (preset) => {
    const now = new Date();
    let start, end;

    if (preset === 'Monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
    } else if (preset === 'Yearly') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (preset === 'AllTime') {
      start = new Date(2020, 0, 1); 
      end = now;
    }

    setReportStartDate(start.toISOString().split('T')[0]);
    setReportEndDate(end.toISOString().split('T')[0]);
    setShowReportPresets(false);
  };

  const getItemIcon = (type) => {
    switch(type) {
      case 'Watch': return <Watch className="w-4 h-4 text-blue-400" />;
      case 'Diamond': return <Gem className="w-4 h-4 text-cyan-400" />;
      default: return <Scale className="w-4 h-4 text-amber-400" />;
    }
  }

  // --- HELPER: Get Store Address ---
  const getStoreAddress = (locationName) => {
    if (!settings.stores || settings.stores.length === 0) return '123 Main St, N/A';
    const store = settings.stores.find(s => s.name === locationName);
    return store ? store.address : settings.stores[0].address;
  };

  // --- ANALYTICS ---
  const getAnalytics = () => {
    const now = new Date();
    let startDate;

    if (analyticsTimeframe === 'Weekly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
    } else if (analyticsTimeframe === 'Monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
    } else if (analyticsTimeframe === 'Yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
    }
    
    const relevantPurchases = purchases.filter(p => p.date >= startDate);
    const totalSpentPeriod = relevantPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
    
    const goldBreakdown = { '10k': 0, '14k': 0, '18k': 0, '22k': 0, '24k': 0, 'Platinum': 0 };
    let silverWeight = 0;
    let platinumWeight = 0;
    let diamondCarats = 0;
    let diamondCount = 0;
    const watchBrands = {}; 

    relevantPurchases.forEach(p => {
      if (p.itemType === 'Gold') {
        if (p.karat === 'Silver') {
          silverWeight += (parseFloat(p.weight) || 0);
        } else if (p.karat === 'Platinum') {
          platinumWeight += (parseFloat(p.weight) || 0);
        } else {
           const k = p.karat || '14k';
           if (goldBreakdown[k] !== undefined) {
             goldBreakdown[k] += (parseFloat(p.weight) || 0);
           } else {
             goldBreakdown['14k'] += (parseFloat(p.weight) || 0);
           }
        }
      } else if (p.itemType === 'Diamond') {
         diamondCarats += (parseFloat(p.stoneCarat) || 0);
         diamondCount++;
      } else if (p.itemType === 'Watch') {
         const brand = (p.brand || 'Other').toUpperCase();
         watchBrands[brand] = (watchBrands[brand] || 0) + 1;
      }
    });
    
    return { totalSpentPeriod, count: relevantPurchases.length, goldBreakdown, silverWeight, platinumWeight, diamondCarats, diamondCount, watchBrands, timeframeLabel: analyticsTimeframe };
  };

  const analytics = getAnalytics();
  
  const getListTransactions = () => {
    if (!listCriteria) return [];
    return purchases.filter(p => {
      let matchesCriteria = false;
      if (listCriteria.type === 'Gold') {
         if (listCriteria.subtype === 'Silver') matchesCriteria = (p.itemType === 'Gold' && p.karat === 'Silver');
         else if (listCriteria.subtype === 'Platinum') matchesCriteria = (p.itemType === 'Gold' && p.karat === 'Platinum');
         else matchesCriteria = (p.itemType === 'Gold' && p.karat === listCriteria.subtype);
      } else if (listCriteria.type === 'Diamond') matchesCriteria = (p.itemType === 'Diamond');
      else if (listCriteria.type === 'Watch') {
         if (listCriteria.subtype) matchesCriteria = (p.itemType === 'Watch' && (p.brand || 'Other').toUpperCase() === listCriteria.subtype);
         else matchesCriteria = (p.itemType === 'Watch');
      }
      if (!matchesCriteria) return false;
      const search = listSearch.toLowerCase();
      const matchesSearch = (p.customerName || '').toLowerCase().includes(search) || (p.phone || '').includes(search) || (p.itemDescription || '').toLowerCase().includes(search) || (p.price || 0).toString().includes(search);
      if (!matchesSearch) return false;
      if (listDateFilter) {
         const pDate = p.date?.toISOString().split('T')[0]; 
         if (pDate !== listDateFilter) return false;
      }
      return true;
    });
  };

  const openFilteredList = (criteria) => {
    setListCriteria(criteria);
    setListSearch('');
    setListDateFilter('');
    setView('filteredList');
  };

  // --- RENDER: LOCK SCREEN ---
  if (isLocked) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-slate-200 transition-colors duration-500 ${isSystemHalted ? 'bg-red-950' : 'bg-slate-950'}`}>
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-sm text-center relative overflow-hidden">
           <h2 className="text-amber-500 font-bold tracking-widest mb-6 text-xl uppercase">KB GOLD JEWELRY</h2>
           {isSystemHalted && <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs font-bold py-1 uppercase tracking-widest animate-pulse">System Disabled</div>}
           <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isSystemHalted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
             {isSystemHalted ? <AlertTriangle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">{isSystemHalted ? 'SECURITY LOCKOUT' : 'Access Required'}</h1>
           <p className="text-sm text-slate-400 mb-6">{isSystemHalted ? 'Too many failed attempts. System is currently halted for security.' : 'Enter your PIN to access the system'}</p>
           <form onSubmit={handlePinSubmit} className="space-y-4">
             <input type="tel" value={pinInput} onChange={(e) => setPinInput(e.target.value)} maxLength={6} className={`w-full bg-slate-950 border rounded-xl py-4 text-center text-3xl tracking-[1em] text-white focus:ring-2 outline-none font-mono ${isSystemHalted ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-amber-500'}`} placeholder={isSystemHalted ? "••••••" : "••••"} autoFocus />
             <button type="submit" className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${isSystemHalted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-slate-900'}`}><Unlock className="w-5 h-5" /> {isSystemHalted ? 'USE MASTER CODE' : 'UNLOCK SYSTEM'}</button>
           </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading system...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 md:pb-0 selection:bg-amber-500 selection:text-white">
      
      {/* ====================== PRINT LAYOUTS ====================== */}
      <div className="hidden print:block">
        {printData && !isPrintingReport && (
          <div className="p-6 font-sans text-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black">{settings.storeName}</h1>
                <p>{getStoreAddress(printData.storeLocation)}</p>
                <p>{settings.phone}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase text-gray-700">Buy-Back Receipt</h2>
                <p className="text-xs text-gray-500">Transaction ID: {printData.id}</p>
                <p className="text-xs text-gray-500">Date: {printData.date?.toLocaleString()}</p>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-2">Seller Information</h3>
              <p><span className="font-bold">Name:</span> {printData.customerName}</p>
              <p><span className="font-bold">ID / License:</span> {printData.customerId}</p>
              <p><span className="font-bold">Phone:</span> {printData.phone || 'N/A'}</p>
            </div>
            {printData.idImage && (
              <div className="mb-4 page-break-inside-avoid">
                <h4 className="font-bold text-sm uppercase text-gray-700 mb-1">Customer ID</h4>
                <img src={printData.idImage} alt="Customer ID" className="w-48 h-auto border border-gray-300 p-1 rounded-lg" />
              </div>
            )}
            <div className="mb-4 page-break-inside-avoid">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-2">Item Details</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr><th className="border border-gray-300 p-2 text-left">Description</th><th className="border border-gray-300 p-2 text-left">Details</th></tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 p-2 align-top">Item</td><td className="border border-gray-300 p-2 font-medium">{printData.itemDescription}</td></tr>
                  <tr><td className="border border-gray-300 p-2 align-top">Type</td><td className="border border-gray-300 p-2">{printData.itemType}</td></tr>
                  {printData.itemType === 'Gold' && <tr><td className="border border-gray-300 p-2 align-top">Weight / Karat</td><td className="border border-gray-300 p-2">{printData.weight}g / {printData.karat}</td></tr>}
                  {printData.itemType === 'Diamond' && <tr><td className="border border-gray-300 p-2 align-top">Carat / Clarity</td><td className="border border-gray-300 p-2">{printData.stoneCarat}ct / {printData.stoneClarity}</td></tr>}
                  {printData.itemType === 'Watch' && <><tr><td className="border border-gray-300 p-2 align-top">Brand / Model</td><td className="border border-gray-300 p-2">{printData.brand} / {printData.model}</td></tr><tr><td className="border border-gray-300 p-2 align-top">Serial #</td><td className="border border-gray-300 p-2">{printData.serialNumber}</td></tr></>}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mb-4">
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-lg"><span>Payment Method:</span><span className="font-bold">{printData.paymentMethod}{printData.paymentMethod === 'Check' && printData.checkNumber && ` #${printData.checkNumber}`}</span></div>
                <div className="flex justify-between text-2xl font-bold mt-2 border-t-2 border-b-2 border-black py-2"><span>TOTAL PAID:</span><span>${printData.price.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-3 mb-4 page-break-inside-avoid">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-2">Terms & Verification</h3>
              <p className="text-xs text-gray-600 mb-4">{settings.terms}</p>
              <div className="flex justify-between items-end gap-4">
                <div className="flex-1"><p className="mb-2 text-sm font-bold">Seller Signature:</p>{printData.signatureImage ? <img src={printData.signatureImage} alt="Signature" className="w-full max-w-[200px] h-auto border-b border-gray-400" /> : <div className="w-full h-16 border-b border-gray-400">(No Signature)</div>}</div>
                <div className="flex-none"><div className="border-2 border-gray-300 w-20 h-28 rounded flex flex-col items-center justify-end pb-2 bg-gray-50"><Fingerprint className="w-5 h-5 text-gray-300 mb-2" /><span className="text-[8px] text-gray-500 font-bold uppercase text-center leading-tight">Right Thumb<br/>Huella Dactilar</span></div></div>
              </div>
            </div>
            <footer className="text-center text-xs text-gray-500 mt-4">Thank you for your business.</footer>
          </div>
        )}

        {isPrintingReport && (
          <div className="p-8 font-sans text-sm">
            <h1 className="text-3xl font-bold text-black">{settings.storeName}</h1>
            <h2 className="text-xl font-bold uppercase text-gray-700 mb-4">Reporte: {new Date(reportStartDate).toLocaleDateString()} - {new Date(reportEndDate).toLocaleDateString()}</h2>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead className="bg-gray-100"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Item</th><th className="p-3 text-right">Amount</th></tr></thead>
              <tbody>
                {getFilteredReportData().map(p => (
                  <tr key={p.id}><td className="border border-gray-300 p-2">{p.date?.toLocaleDateString()}</td><td className="border border-gray-300 p-2">{p.customerName}</td><td className="border border-gray-300 p-2">{p.itemDescription} ({p.itemType})</td><td className="border border-gray-300 p-2 text-right font-medium">${p.price.toFixed(2)}</td></tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold"><tr><td colSpan="3" className="border border-gray-300 p-2 text-right">Total Spent:</td><td className="border border-gray-300 p-2 text-right">${getFilteredReportData().reduce((sum, p) => sum + p.price, 0).toFixed(2)}</td></tr></tfoot>
            </table>
          </div>
        )}
      </div>
      
      {/* ====================== APP UI ====================== */}
      <div className="print:hidden">
        <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg shadow-amber-500/20 shadow-lg"><Scale className="w-6 h-6 text-slate-900" /></div>
            <div>
              <h1 className="text-xl font-bold text-amber-500 tracking-tight leading-none hidden md:block">KB GOLD JEWELRY</h1>
              <h1 className="text-xl font-bold text-amber-500 tracking-tight leading-none md:hidden">KB GOLD</h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Management System</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('reports')} className={`p-2 rounded-full transition-colors ${view === 'reports' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Reports"><FileText className="w-6 h-6" /></button>
            <button onClick={() => { setView('settings'); setSettingsView('general'); }} className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}><Settings className="w-6 h-6" /></button>
            <button onClick={() => setIsLocked(true)} className="p-2 text-red-400 hover:text-red-200 hover:bg-slate-700 rounded-full transition-colors" title="Lock System"><Lock className="w-6 h-6" /></button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-4">
          
          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 flex justify-between shadow-lg">
                <button onClick={() => setAnalyticsTimeframe('Weekly')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${analyticsTimeframe === 'Weekly' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}>Weekly</button>
                <button onClick={() => setAnalyticsTimeframe('Monthly')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${analyticsTimeframe === 'Monthly' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}>Monthly</button>
                <button onClick={() => setAnalyticsTimeframe('Yearly')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${analyticsTimeframe === 'Yearly' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}>Yearly</button>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-lg rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Coins className="w-24 h-24 text-white" /></div>
                <div className="pb-2"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Spent ({analytics.timeframeLabel})</h3></div>
                <div><div className="text-4xl font-bold text-white">${analytics.totalSpentPeriod.toLocaleString()}</div></div>
                <div className="mt-2 text-xs text-slate-500">{analytics.count} transactions this {analytics.timeframeLabel.toLowerCase().slice(0, -2)}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button onClick={() => { setBreakdownType('Gold'); setView('breakdown'); }} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg transition-all active:scale-95 group"><div className="bg-amber-500/10 p-3 rounded-full group-hover:bg-amber-500/20 transition-colors"><Scale className="w-8 h-8 text-amber-500" /></div><div className="text-center"><span className="block text-lg font-bold text-white">ORO</span><span className="text-xs text-slate-400 flex items-center justify-center gap-1">Ver Detalles <ChevronRight className="w-3 h-3" /></span></div></button>
                <button onClick={() => { openFilteredList({ type: 'Gold', subtype: 'Silver', label: `Plata (${analytics.timeframeLabel})` }); }} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg transition-all active:scale-95 group"><div className="bg-slate-400/10 p-3 rounded-full group-hover:bg-slate-400/20 transition-colors"><Coins className="w-8 h-8 text-slate-400" /></div><div className="text-center"><span className="block text-lg font-bold text-white">PLATA</span><span className="text-xs text-slate-400">{analytics.silverWeight.toFixed(2)} g</span></div></button>
                <button onClick={() => { openFilteredList({ type: 'Gold', subtype: 'Platinum', label: `Platino (${analytics.timeframeLabel})` }); }} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg transition-all active:scale-95 group"><div className="bg-indigo-400/10 p-3 rounded-full group-hover:bg-indigo-400/20 transition-colors"><CreditCard className="w-8 h-8 text-indigo-400" /></div><div className="text-center"><span className="block text-lg font-bold text-white">PLATINO</span><span className="text-xs text-slate-400">{analytics.platinumWeight.toFixed(2)} g</span></div></button>
                <button onClick={() => { openFilteredList({ type: 'Diamond', subtype: null, label: `Diamantes (${analytics.timeframeLabel})` }); }} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg transition-all active:scale-95 group"><div className="bg-cyan-500/10 p-3 rounded-full group-hover:bg-cyan-500/20 transition-colors"><Gem className="w-8 h-8 text-cyan-400" /></div><div className="text-center"><span className="block text-lg font-bold text-white">DIAMANTES</span><span className="text-xs text-slate-400">{analytics.diamondCarats.toFixed(2)} ct</span></div></button>
                <button onClick={() => { setBreakdownType('Watch'); setView('breakdown'); }} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg transition-all active:scale-95 group"><div className="bg-blue-500/10 p-3 rounded-full group-hover:bg-blue-500/20 transition-colors"><Watch className="w-8 h-8 text-blue-400" /></div><div className="text-center"><span className="block text-lg font-bold text-white">RELOJES</span><span className="text-xs text-slate-400 flex items-center justify-center gap-1">Ver Marcas <ChevronRight className="w-3 h-3" /></span></div></button>
              </div>
              <button onClick={() => { setEditingId(null); setView('new'); }} className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"><PlusCircle className="w-7 h-7" /><span className="text-lg">REGISTER NEW BUY-BACK</span></button>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-700"><h3 className="font-semibold text-slate-200 flex items-center gap-2"><History className="w-4 h-4 text-amber-500" /> Recent</h3><button onClick={() => setView('history')} className="text-sm text-amber-500 hover:underline">View full history</button></div>
                <div className="divide-y divide-slate-700">
                  {purchases.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 hover:bg-slate-700/30">
                      <div className="flex items-center gap-3"><div className="bg-slate-700 p-2 rounded-full h-fit">{getItemIcon(p.itemType)}</div><div><p className="font-bold text-white text-sm">{p.customerName}</p><p className="text-xs text-slate-400">{p.itemDescription}</p></div></div>
                      <div className="text-right"><p className="font-bold text-amber-400">${p.price}</p><div className="flex gap-1 mt-1 justify-end"><button onClick={() => handlePrint(p)} className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 flex items-center gap-1" title="Print Receipt"><Printer className="w-3 h-3" /> Receipt</button><button onClick={() => { setSelectedPurchase(p); setView('detail'); }} className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 flex items-center gap-1" title="View Details"><Search className="w-3 h-3" /> Details</button></div></div>
                    </div>
                  ))}
                  {purchases.length === 0 && <div className="p-4 text-slate-400 text-center text-sm">No recent transactions</div>}
                </div>
              </div>
            </div>
          )}

          {/* BREAKDOWN VIEW */}
          {view === 'breakdown' && (
            <div className="max-w-lg mx-auto animate-in fade-in">
              <div className="flex items-center gap-4 mb-6"><button onClick={() => setView('dashboard')} className="bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700"><ArrowLeft className="w-6 h-6" /></button><h2 className="text-2xl font-bold text-white flex items-center gap-2">{breakdownType === 'Gold' && <span className="text-amber-500">ORO ({analytics.timeframeLabel})</span>}{breakdownType === 'Watch' && <span className="text-blue-400">RELOJES ({analytics.timeframeLabel})</span>}</h2></div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                {breakdownType === 'Gold' && (<div className="divide-y divide-slate-700">{['10k', '14k', '18k', '22k', '24k'].map(k => (<button key={k} onClick={() => openFilteredList({ type: 'Gold', subtype: k, label: `Oro ${k} (${analytics.timeframeLabel})` })} className="flex justify-between items-center p-5 hover:bg-slate-700/20 w-full text-left transition-colors group"><div className="flex items-center gap-3"><span className="text-lg font-bold text-amber-500">{k}</span></div><div className="flex items-center gap-3"><span className="text-xl text-white font-mono">{analytics.goldBreakdown[k].toFixed(2)} <span className="text-sm text-slate-500">g</span></span><ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" /></div></button>))}<div className="bg-slate-900 p-4 flex justify-between items-center border-t border-slate-700"><span className="text-slate-400 uppercase text-xs font-bold">Total Grams</span><span className="text-white font-bold">{(analytics.goldBreakdown['10k'] + analytics.goldBreakdown['14k'] + analytics.goldBreakdown['18k'] + analytics.goldBreakdown['22k'] + analytics.goldBreakdown['24k']).toFixed(2)} g</span></div></div>)}
                {breakdownType === 'Watch' && (<div className="divide-y divide-slate-700">{Object.keys(analytics.watchBrands).length > 0 ? (Object.entries(analytics.watchBrands).map(([brand, count]) => (<button key={brand} onClick={() => openFilteredList({ type: 'Watch', subtype: brand, label: `Relojes ${brand} (${analytics.timeframeLabel})` })} className="flex justify-between items-center p-5 hover:bg-slate-700/40 w-full text-left transition-colors group"><div className="flex items-center gap-3"><span className="text-lg font-bold text-blue-400">{brand}</span></div><div className="flex items-center gap-3"><span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold">{count}</span><ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" /></div></button>))) : (<div className="p-8 text-center text-slate-500 italic">No watches purchased this month.</div>)}</div>)}
              </div>
            </div>
          )}

          {/* HISTORY VIEW */}
          {view === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between mb-2"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><History /> Transaction History</h2><button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button></div>
              <div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white outline-none" /></div>
              <div className="space-y-3 pb-24">
                {purchases.filter(p => (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.itemDescription || '').toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                  <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 shadow-sm">
                    <div><div className="flex justify-between items-start"><div className="flex gap-3"><div className="bg-slate-700 p-2 rounded-full h-fit">{getItemIcon(p.itemType)}</div><div><h3 className="font-bold text-white text-lg">{p.customerName}</h3><p className="text-sm text-slate-400">{p.date?.toLocaleString()}</p></div></div><div className="text-right"><div className="font-bold text-xl text-amber-500">${p.price.toFixed(2)}</div></div></div><div className="bg-slate-900/50 p-3 rounded-lg text-sm border border-slate-700/50 mt-3"><span className="text-slate-300 font-bold block mb-1">{p.itemDescription}</span>{p.itemType === 'Gold' && <span className="text-amber-500 text-xs">{p.weight}g • {p.karat}</span>}{p.itemType === 'Watch' && <span className="text-blue-400 text-xs">{p.brand} {p.model} • SN: {p.serialNumber}</span>}{p.itemType === 'Diamond' && <span className="text-cyan-400 text-xs">{p.stoneCarat}ct • {p.stoneClarity}</span>}</div></div>
                    <div className="flex gap-2 mt-2 pt-3 border-t border-slate-700"><button onClick={() => handlePrint(p)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-200"><Printer className="w-4 h-4" /> Reprint</button><button onClick={() => { setSelectedPurchase(p); setView('detail'); }} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-200"><Search className="w-4 h-4" /> View Details</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILTERED LIST VIEW */}
          {view === 'filteredList' && listCriteria && (
            <div className="max-w-2xl mx-auto animate-in fade-in">
              <div className="flex items-center gap-4 mb-4"><button onClick={() => setView('dashboard')} className="bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700"><ArrowLeft className="w-6 h-6" /></button><div><h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase">{listCriteria.label}</h2><p className="text-xs text-slate-400">{getListTransactions().length} results</p></div></div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg mb-4 space-y-3"><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" /><input type="text" placeholder="Search..." value={listSearch} onChange={(e) => setListSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 text-white outline-none text-sm" /></div><div className="relative w-40"><Calendar className="absolute left-3 top-3 text-slate-500 w-5 h-5" /><input type="date" value={listDateFilter} onChange={(e) => setListDateFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 text-white outline-none text-sm appearance-none" /></div></div>{(listSearch || listDateFilter) && (<button onClick={() => { setListSearch(''); setListDateFilter(''); }} className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"><X className="w-3 h-3" /> Clear Filters</button>)}</div>
              <div className="space-y-3 pb-24">
                {getListTransactions().map(p => (
                  <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start"><div><h3 className="font-bold text-white text-lg">{p.itemDescription}</h3><p className="text-sm text-slate-400">{p.customerName}</p><p className="text-xs text-slate-500 mt-1">{p.date?.toLocaleString()}</p></div><div className="text-right"><div className="font-bold text-xl text-amber-500">${p.price.toFixed(2)}</div>{p.paymentMethod === 'Check' && <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300">CK#{p.checkNumber}</span>}</div></div>
                    <div className="flex gap-2 mt-2 pt-3 border-t border-slate-700"><button onClick={() => handlePrint(p)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-200"><Printer className="w-4 h-4" /> Reprint</button><button onClick={() => { setSelectedPurchase(p); setView('detail'); }} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-200"><Search className="w-4 h-4" /> View Details</button></div>
                  </div>
                ))}
                {getListTransactions().length === 0 && (<div className="text-center p-8 text-slate-500 italic">No transactions found matching filters.</div>)}
              </div>
            </div>
          )}

          {/* NEW PURCHASE / EDIT FORM */}
          {view === 'new' && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300 pb-24">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Transaction' : 'New Buy-Back'}</h2><button onClick={() => setView(editingId ? 'detail' : 'dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button></div>
              <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
                {foundCustomer && (<div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-3 flex justify-between items-center animate-in slide-in-from-top-2"><div><p className="text-sm text-blue-100 font-bold">Customer Found: {foundCustomer.name}</p><p className="text-xs text-blue-300">Match by Phone/ID</p></div><button type="button" onClick={applyFoundCustomer} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"><UserCheck className="w-3 h-3" /> Autofill</button></div>)}
                <div className="space-y-2 border-b border-slate-700 pb-4"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin className='w-4 h-4' /> SELECT LOCATION</label><select name="storeLocation" value={formData.storeLocation} onChange={handleInputChange} className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-3 text-white font-bold">{settings.stores.map((store, index) => (<option key={index} value={store.name}>{store.name}</option>))}</select></div>
                <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1 rounded-lg">{['Gold', 'Diamond', 'Watch'].map(type => (<button type="button" key={type} onClick={() => setFormData({...formData, itemType: type})} className={`py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${formData.itemType === type ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{type === 'Gold' && <Scale className="w-4 h-4" />}{type === 'Diamond' && <Gem className="w-4 h-4" />}{type === 'Watch' && <Watch className="w-4 h-4" />}{type}</button>))}</div>
                <div className="bg-slate-900/50 p-4 rounded-xl border-2 border-dashed border-slate-600 text-center hover:border-amber-500 transition-colors group"><label className="cursor-pointer block"><div className="flex flex-col items-center gap-3">{formData.idImage ? (<div className="relative"><img src={formData.idImage} alt="ID Preview" className="h-24 w-auto rounded-lg shadow-md object-contain bg-black" /><div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><span className="text-white text-xs font-bold">Change</span></div></div>) : (<><Camera className="w-8 h-8 text-slate-300 group-hover:text-white" /><span className="text-xs text-slate-500">Tap to Scan ID</span></>)}</div><input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" /></label></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input required name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Full Name" /><input required name="customerId" value={formData.customerId} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="ID / License #" /><input name="phone" value={formData.phone} onChange={handleInputChange} className="md:col-span-2 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Phone Number" /></div>
                <div className="space-y-4 border-t border-slate-700 pt-4"><h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Item Details</h3><input required name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Short Description (e.g. 14k Chain, Rolex Submariner)" />{formData.itemType === 'Gold' && (<div className="grid grid-cols-2 gap-4 animate-in fade-in"><div className="relative"><input required type="number" step="0.01" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-8 text-white" placeholder="Weight" /><span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">g</span></div><select name="karat" value={formData.karat} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">{['10k','14k','18k','22k','24k','Silver','Platinum'].map(k => <option key={k} value={k}>{k}</option>)}</select></div>)}{formData.itemType === 'Diamond' && (<div className="grid grid-cols-2 gap-4 animate-in fade-in"><div className="relative"><input required type="number" step="0.01" name="stoneCarat" value={formData.stoneCarat} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-8 text-white" placeholder="Carat" /><span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">ct</span></div><input name="stoneClarity" value={formData.stoneClarity} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Clarity/Color/Cut" /></div>)}{formData.itemType === 'Watch' && (<div className="grid grid-cols-2 gap-4 animate-in fade-in"><input required name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Brand (e.g. Rolex)" /><input name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Model" /><input name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className="col-span-2 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Serial Number" /></div>)}</div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4"><div className="relative"><span className="absolute left-3 top-3 text-amber-500 font-bold">$</span><input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-7 text-white font-bold text-lg" placeholder="0.00" /></div><select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">{['Cash','Check','Zelle','Wire'].map(m => <option key={m} value={m}>{m}</option>)}</select>{formData.paymentMethod === 'Check' && (<div className="col-span-2 animate-in fade-in"><input name="checkNumber" value={formData.checkNumber} onChange={handleInputChange} className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-3 text-white" placeholder="Enter Check Number" autoFocus /></div>)}</div>
                <div className="border-t border-slate-700 pt-4"><p className="text-xs text-slate-400 mb-2">Sign Below:</p><SignaturePad onSave={handleSignatureSave} onClear={handleSignatureClear} initialImage={formData.signatureImage} /></div>
                <div className="flex gap-3"><button type="button" onClick={() => setView(editingId ? 'detail' : 'dashboard')} className="flex-1 bg-slate-700 text-white py-3 rounded-lg">Cancel</button><button type="submit" className="flex-[2] bg-amber-500 text-white py-3 rounded-lg font-bold shadow-lg">{editingId ? 'UPDATE TRANSACTION' : 'SAVE & PRINT'}</button></div>
              </form>
            </div>
          )}

          {/* TRANSACTION DETAILS VIEW */}
          {view === 'detail' && selectedPurchase && (
            <div className="max-w-2xl mx-auto animate-in fade-in">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-white">Transaction Details</h2><button onClick={() => setView('history')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button></div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2"><button onClick={() => handleEdit(selectedPurchase)} className="p-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors" title="Edit Transaction"><Edit className="w-5 h-5" /></button><button onClick={() => handleDelete(selectedPurchase)} className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors" title="Delete Transaction"><Trash2 className="w-5 h-5" /></button></div>
                <div><p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Customer</p><h3 className="text-2xl font-bold text-white mt-1">{selectedPurchase.customerName}</h3><p className="text-slate-400">ID/License: {selectedPurchase.customerId}</p><p className="text-slate-400">Phone: {selectedPurchase.phone || 'N/A'}</p><div className="flex items-center gap-2 mt-2 text-sm text-slate-400"><MapPin className='w-4 h-4' /> Location: {selectedPurchase.storeLocation || 'N/A'}</div></div>
                <div className="border-t border-slate-700 pt-4"><p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Item Details</p><p className="text-lg text-white font-medium mt-1">{selectedPurchase.itemDescription}</p>{selectedPurchase.itemType === 'Gold' && (<div className="text-sm text-slate-300"><p>Type: {selectedPurchase.itemType}</p><p>Weight: {selectedPurchase.weight}g</p><p>Karat: {selectedPurchase.karat}</p></div>)}{selectedPurchase.itemType === 'Diamond' && (<div className="text-sm text-slate-300"><p>Type: {selectedPurchase.itemType}</p><p>Carat: {selectedPurchase.stoneCarat}ct</p><p>Clarity/Cut: {selectedPurchase.stoneClarity || 'N/A'}</p></div>)}{selectedPurchase.itemType === 'Watch' && (<div className="text-sm text-slate-300"><p>Type: {selectedPurchase.itemType}</p><p>Brand: {selectedPurchase.brand}</p><p>Model: {selectedPurchase.model || 'N/A'}</p><p>Serial #: {selectedPurchase.serialNumber || 'N/A'}</p></div>)}</div>
                <div className="border-t border-slate-700 pt-4"><p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Payment</p><p className="text-3xl font-bold text-amber-400 mt-1">${selectedPurchase.price.toFixed(2)}</p><div className="flex items-center gap-2"><p className="text-slate-400">Method: {selectedPurchase.paymentMethod}</p>{selectedPurchase.paymentMethod === 'Check' && selectedPurchase.checkNumber && (<span className="bg-slate-700 text-white px-2 py-0.5 rounded text-xs font-mono">#{selectedPurchase.checkNumber}</span>)}</div><p className="text-xs text-slate-500 mt-2">Date: {selectedPurchase.date?.toLocaleString()}</p></div>
                {selectedPurchase.idImage && (<div className="border-t border-slate-700 pt-4"><p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Customer ID Scan</p><img src={selectedPurchase.idImage} alt="Customer ID" className="rounded-lg w-full max-w-sm shadow-md bg-black" /></div>)}
                {selectedPurchase.signatureImage && (<div className="border-t border-slate-700 pt-4"><p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Customer Signature</p><div className="bg-white p-2 rounded-lg shadow-md max-w-sm"><img src={selectedPurchase.signatureImage} alt="Signature" className="w-full h-auto" /></div></div>)}
                <div className="flex gap-3 pt-4 border-t border-slate-700"><button onClick={() => setView('history')} className="flex-1 bg-slate-700 text-white py-3 rounded-lg">Back to History</button><button onClick={() => handlePrint(selectedPurchase)} className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"><Printer className="w-5 h-5" /> REPRINT RECEIPT</button></div>
              </div>
            </div>
          )}
           
          {/* REPORTS VIEW (FIXED VISIBILITY) */}
          {view === 'reports' && (
            <div className="max-w-2xl mx-auto animate-in fade-in pb-24">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText /> Monthly Reports</h2><button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button></div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-xl relative">
                   <h3 className="text-xl font-bold text-white mb-4">Report Range</h3>
                   <button onClick={() => setShowReportPresets(!showReportPresets)} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors mb-4">Select Preset <ChevronDown className={`w-4 h-4 transition-transform ${showReportPresets ? 'rotate-180' : ''}`} /></button>
                   {showReportPresets && (<div className="absolute z-10 w-full left-0 mt-1 bg-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2"><button onClick={() => applyDatePreset('Monthly')} className="w-full text-left p-3 text-sm hover:bg-slate-600">Current Month</button><button onClick={() => applyDatePreset('Yearly')} className="w-full text-left p-3 text-sm hover:bg-slate-600">Current Year</button><button onClick={() => applyDatePreset('AllTime')} className="w-full text-left p-3 text-sm hover:bg-slate-600">All Time</button></div>)}
                  <div className="flex flex-col md:flex-row gap-4 items-end justify-between mt-4"><div className='flex gap-4 w-full'><div className='flex-1'><label className="block text-xs text-slate-400 mb-1">Start Date</label><input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded" /></div><div className='flex-1'><label className="block text-xs text-slate-400 mb-1">End Date</label><input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded" /></div></div><button onClick={handlePrintReport} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg flex-none"><Download className="w-4 h-4" /> PRINT / SAVE PDF ({getFilteredReportData().length} items)</button></div>
              </div>
              <div className="bg-white text-black rounded-lg p-1 overflow-hidden shadow-xl opacity-90">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-200 text-gray-700 font-bold uppercase"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Item</th><th className="p-3 text-right">Amount</th></tr></thead>
                    <tbody>
                      {getFilteredReportData().length > 0 ? (getFilteredReportData().map(p => (<tr key={p.id} className="border-b border-gray-200 hover:bg-blue-50"><td className="p-3">{p.date?.toLocaleDateString()}</td><td className="p-3">{p.customerName} <span className="text-gray-400">({p.customerId})</span></td><td className="p-3"><span className="font-bold">{p.itemType}:</span> {p.itemDescription}</td><td className="p-3 text-right font-bold">${p.price.toFixed(2)}</td></tr>))) : (<tr><td colSpan="4" className="p-8 text-center text-gray-500">No transactions found for this period.</td></tr>)}
                    </tbody>
                  </table>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <div className="max-w-2xl mx-auto relative z-10 bg-slate-900/95 pb-24">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-white">Settings</h2><button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button></div>
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 mb-4 flex"><button onClick={() => setSettingsView('general')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${settingsView === 'general' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}>General Info</button><button onClick={() => { setSettingsView('security'); setSecuritySettings(prev => ({...prev, securityUnlocked: false})); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${settingsView === 'security' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}><div className="flex items-center justify-center gap-2"><Key className="w-4 h-4" /> Security PINs</div></button></div>
              {settingsView === 'general' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 shadow-xl animate-in fade-in">
                    <div className="space-y-2"><label className="text-xs uppercase text-slate-400 font-bold">Store Name</label><input value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Store Name" /></div>
                    <div className="space-y-2"><label className="text-xs uppercase text-slate-400 font-bold">Phone</label><input value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Phone" /></div>
                    <div className="space-y-4 border-t border-slate-700 pt-4"><h3 className="text-sm font-bold text-amber-500 uppercase">Store Locations</h3>{settings.stores.map((store, index) => (<div key={index} className="flex flex-col gap-2 bg-slate-700/30 p-3 rounded-lg"><div className="flex gap-2"><input value={store.name} onChange={(e) => handleStoreChange(index, 'name', e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm" placeholder="Location Name" />{settings.stores.length > 1 && (<button type="button" onClick={() => removeStore(index)} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"><Trash2 className="w-4 h-4" /></button>)}</div><input value={store.address} onChange={(e) => handleStoreChange(index, 'address', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm" placeholder="Full Address" /></div>))}<button type="button" onClick={addStore} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><PlusCircle className="w-5 h-5" /> Add New Store</button></div>
                    <div className="space-y-2"><label className="text-xs uppercase text-slate-400 font-bold">Receipt Terms</label><textarea value={settings.terms} onChange={(e) => setSettings({...settings, terms: e.target.value})} className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm" placeholder="Legal Terms" /></div>
                    <button onClick={saveGeneralSettings} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg font-bold mt-4 flex items-center justify-center gap-2"><Save className="w-5 h-5" /> SAVE CHANGES</button>
                  </div>
              )}
              {settingsView === 'security' && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 shadow-xl animate-in fade-in">
                      {!securitySettings.securityUnlocked ? (
                          <form onSubmit={handleSecurityUnlock} className="space-y-4 text-center"><Key className="w-12 h-12 text-amber-500 mx-auto" /><h3 className="text-xl font-bold text-white">Security Access Required</h3><p className="text-sm text-slate-400">Enter Master Code to unlock PIN management.</p><input type="password" value={securitySettings.securityPinInput} onChange={(e) => setSecuritySettings({...securitySettings, securityPinInput: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white font-mono text-lg text-center" placeholder="••••••" autoFocus /><button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Unlock className="w-5 h-5" /> UNLOCK SECURITY SETTINGS</button></form>
                      ) : (
                          <div className="space-y-6 animate-in fade-in"><h3 className="text-xl font-bold text-white">Change System PINs</h3><div className="space-y-2"><label className="text-xs uppercase text-slate-400 font-bold">Current App PIN (4+ digits)</label><input type="tel" value={securitySettings.pin} onChange={(e) => setSecuritySettings({...securitySettings, pin: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white font-mono text-lg" placeholder="New PIN" /><p className="text-xs text-slate-500">This PIN is required to unlock the system.</p></div><div className="space-y-2"><label className="text-xs uppercase text-slate-400 font-bold">Master Reset Code (6+ digits)</label><input type="tel" value={securitySettings.masterCode} onChange={(e) => setSecuritySettings({...securitySettings, masterCode: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white font-mono text-lg" placeholder="New Master Code" /><p className="text-xs text-red-400">This code is required to delete transactions and reset lockout. **Keep this code secret.**</p></div><button onClick={saveSecuritySettings} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg font-bold mt-4 flex items-center justify-center gap-2"><Lock className="w-5 h-5" /> UPDATE SECURITY PINs</button></div>
                      )}
                  </div>
              )}
            </div>
          )}

        </main>
        
        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around p-3 z-20 pb-safe">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center ${view === 'dashboard' ? 'text-amber-500' : 'text-slate-500'}`}><BarChart3 className="w-6 h-6" /><span className="text-[10px] mt-1 font-medium">Home</span></button>
          <button onClick={() => { setEditingId(null); setView('new'); }} className="flex flex-col items-center -mt-8"><div className="bg-amber-500 text-white p-4 rounded-full shadow-lg shadow-amber-500/30 ring-4 ring-slate-900"><PlusCircle className="w-8 h-8" /></div></button>
          <button onClick={() => setView('reports')} className={`flex flex-col items-center ${view === 'reports' ? 'text-amber-500' : 'text-slate-500'}`}><FileText className="w-6 h-6" /><span className="text-[10px] mt-1 font-medium">Reports</span></button>
        </div>
      </div>
    </div>
  );
}