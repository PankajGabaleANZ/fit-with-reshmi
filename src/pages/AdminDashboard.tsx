import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Calendar, Users, FileText, Sparkles, Clock, AlertCircle, 
  Settings, CreditCard, Wind, CheckCircle, Save, Video, 
  ExternalLink, RefreshCw, Plus, Play, Pause, ShieldCheck,
  Database
} from 'lucide-react';
import ContentEditor from '../components/admin/ContentEditor';
import SessionsTimes from '../components/admin/SessionsTimes';
import ReelsEditor from '../components/admin/ReelsEditor';
import QuestionnaireEditor from '../components/admin/QuestionnaireEditor';
import ResultsView from '../components/admin/ResultsView';
import { Film, ListChecks, BarChart3, Clock as ClockIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-assistant' | 'customization' | 'breath-tools' | 'razorpay-test' | 'clients' | 'firebase' | 'sessions' | 'reels' | 'questionnaires' | 'results'>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Firebase State
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [firebaseSyncMsg, setFirebaseSyncMsg] = useState('');
  
  // AI Assistant State
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Customization state
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    hero_title: 'Reshmi Verma',
    hero_subtitle: 'Integrative Nutritionist, Functional Health Specialist & Breathwork Coach',
    tagline: 'Bridging metabolic biochemistry, autonomic regulation, and cellular vitality.',
    contact_email: 'hello@reshmiverma.com',
    razorpay_enabled: 'true',
    booking_fee_currency: 'INR',
    single_consult_price: '2999',
    vagal_program_price: '7999',
    banner_announcement: 'Now booking personalized metabolic & vagal health consultations for this month.'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Breath Protocols & Animation Tools state
  const [protocols, setProtocols] = useState<any[]>([]);
  const [selectedProtoIndex, setSelectedProtoIndex] = useState(0);
  const [isSavingProtocol, setIsSavingProtocol] = useState(false);
  const [protocolSuccessMsg, setProtocolSuccessMsg] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Razorpay Diagnostics & Test state
  const [razorpayStatus, setRazorpayStatus] = useState<any>(null);
  const [checkingRazorpay, setCheckingRazorpay] = useState(false);
  const [testAmount, setTestAmount] = useState('100'); // INR 100
  const [testOrderResult, setTestOrderResult] = useState<any>(null);
  const [isCreatingTestOrder, setIsCreatingTestOrder] = useState(false);
  const [testOrderError, setTestOrderError] = useState('');

  // Restore an existing admin session (secure cookie) after a page refresh.
  useEffect(() => {
    fetch('/api/admin/me').then(r => { if (r.ok) setIsAuthenticated(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Load bookings
    fetch('/api/admin/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.bookings) {
          setBookings(data.bookings);
          if (data.bookings.length > 0 && !selectedBookingId) {
            setSelectedBookingId(data.bookings[0].id);
          }
        }
        setLoadingBookings(false);
      })
      .catch(err => console.error(err));

    // Load site settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSiteSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(err => console.error(err));

    // Load breath protocols
    fetch('/api/breath/protocols')
      .then(res => res.json())
      .then(data => {
        if (data.protocols && data.protocols.length > 0) {
          setProtocols(data.protocols);
        }
      })
      .catch(err => console.error(err));

    // Check Razorpay status
    checkRazorpayStatus();

    // Check Firebase status
    checkFirebaseStatus();
  }, [isAuthenticated, selectedBookingId]);

  const checkFirebaseStatus = async () => {
    try {
      const res = await fetch('/api/firebase/status');
      const data = await res.json();
      setFirebaseStatus(data);
    } catch (err: any) {
      console.error("Firebase status fetch error:", err);
    }
  };

  const handleSyncFirebase = async () => {
    setIsSyncingFirebase(true);
    setFirebaseSyncMsg('');
    try {
      const res = await fetch('/api/firebase/status');
      const data = await res.json();
      setFirebaseStatus(data);
      setFirebaseSyncMsg('Connection re-checked.');
      setTimeout(() => setFirebaseSyncMsg(''), 4000);
    } catch (err: any) {
      setFirebaseSyncMsg('Sync error: ' + (err.message || 'Failed to sync'));
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleCreateDemo = async () => {
    setFirebaseSyncMsg('');
    try {
      const res = await fetch('/api/admin/demo-record', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFirebaseSyncMsg(data.created ? 'Demo record created: see Overview / Clients.' : 'Demo record already exists.');
      const bRes = await fetch('/api/admin/bookings');
      const bData = await bRes.json();
      setBookings(bData.bookings || []);
      setTimeout(() => setFirebaseSyncMsg(''), 5000);
    } catch (err: any) {
      setFirebaseSyncMsg('Error: ' + (err.message || 'Failed'));
    }
  };

  useEffect(() => {
    if (selectedBookingId) {
      const b = bookings.find(b => b.id === selectedBookingId);
      if (b) {
        setSessionNotes(b.transcription || '');
        setGeneratedReport(b.plan || '');
      }
    }
  }, [selectedBookingId, bookings]);

  const checkRazorpayStatus = async () => {
    setCheckingRazorpay(true);
    try {
      const res = await fetch('/api/admin/razorpay/status');
      const data = await res.json();
      setRazorpayStatus(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCheckingRazorpay(false);
    }
  };

  const handleCreateTestOrder = async () => {
    setIsCreatingTestOrder(true);
    setTestOrderError('');
    setTestOrderResult(null);
    try {
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(testAmount),
          currency: siteSettings.booking_fee_currency || 'INR'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      setTestOrderResult(data);
    } catch (err: any) {
      setTestOrderError(err.message || 'Error communicating with Razorpay');
    } finally {
      setIsCreatingTestOrder(false);
    }
  };

  const handleLaunchTestCheckoutModal = () => {
    if (!testOrderResult || !testOrderResult.id) return;
    
    // Check Razorpay script on window
    const RazorpayObj = (window as any).Razorpay;
    const clientKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || razorpayStatus?.keyPrefix;

    if (!RazorpayObj) {
      alert("Razorpay client script is still loading. Please refresh and try again.");
      return;
    }

    try {
      const options = {
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '',
        amount: testOrderResult.amount,
        currency: testOrderResult.currency,
        name: "Reshmi Verma (Test)",
        description: "Admin Diagnostic Verification Order",
        order_id: testOrderResult.id,
        handler: function (response: any) {
          alert(`Test Payment Authorized Successfully!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`);
        },
        prefill: {
          name: "Admin Tester",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#2a2522"
        }
      };
      const rzp = new RazorpayObj(options);
      rzp.on("payment.failed", function (resp: any) {
        alert("Test Payment Simulated Failure: " + (resp.error.description || resp.error.reason));
      });
      rzp.open();
    } catch (err: any) {
      alert("Error triggering Razorpay modal: " + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccessMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: siteSettings })
      });
      if (res.ok) {
        setSettingsSuccessMsg('Website configuration updated and persisted successfully!');
        setTimeout(() => setSettingsSuccessMsg(''), 4000);
      } else {
        alert('Failed to save settings.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveCurrentProtocol = async () => {
    const proto = protocols[selectedProtoIndex];
    if (!proto) return;
    setIsSavingProtocol(true);
    setProtocolSuccessMsg('');
    try {
      const res = await fetch('/api/admin/breath/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proto)
      });
      if (res.ok) {
        setProtocolSuccessMsg(`Saved protocol "${proto.name}" with animation & video metadata!`);
        setTimeout(() => setProtocolSuccessMsg(''), 4000);
      } else {
        alert('Failed to save protocol.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingProtocol(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setPassword('');
        setIsAuthenticated(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Invalid credentials.");
      }
    } catch {
      alert("Error logging in");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mashiro flex items-center justify-center pt-20 pb-12 px-4">
        <div className="max-w-md w-full bg-sakura/20 p-8 rounded-3xl border border-momo/20 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-momo text-mashiro flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-momo">Reshmi Verma Admin Portal</h2>
            <p className="text-xs text-momo/70 mt-1 uppercase tracking-widest font-bold">Confidential Provider & System Studio</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-momo mb-2">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-momo/30 bg-white text-momo font-medium focus:border-momo outline-none" 
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-momo mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-momo/30 bg-white text-momo font-medium focus:border-momo outline-none" 
                autoComplete="current-password"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-4 mt-4 bg-momo text-white font-bold tracking-widest uppercase rounded-xl hover:bg-momo/90 transition-transform active:scale-95 shadow-md"
            >
              Sign In to Management Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleGenerateReport = async () => {
    if (!sessionNotes.trim()) {
      setError('Please enter session notes first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedReport('');

    try {
      const b = bookings.find(b => b.id === selectedBookingId);
      
      const prompt = `
You are an expert AI assistant for Reshmi Verma, a Functional Nutritionist.
Your task is to generate a structured, professional nutrition and lifestyle report for a client based on the provided session notes and client history.

Client Name: ${b?.clientName}
Client History: ${b?.clientHistory}
Internal Intake Notes: ${b?.notes}

Session Notes from Reshmi:
${sessionNotes}

Please output a structured Markdown report using the following template:
# Consultation Report: ${b?.clientName}
## Summary of Session
## Key Observations
## Action Plan (Dietary)
## Action Plan (Lifestyle & Supplements)
## Next Steps
`;

      const aiRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const aiData = await aiRes.json();
      if (!aiRes.ok) {
        throw new Error(aiData.error || 'Failed to generate report.');
      }

      if (aiData.text) {
        setGeneratedReport(aiData.text);
        
        // Save to DB
        await fetch('/api/admin/sessions', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            bookingId: selectedBookingId,
            transcription: sessionNotes,
            plan: aiData.text
          })
        });
        
        // Refresh
        const bRes = await fetch('/api/admin/bookings');
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || 'An error occurred while communicating with the AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeProto = protocols[selectedProtoIndex];

  return (
    <div className="min-h-screen bg-mashiro flex flex-col md:flex-row pt-24">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-sakura/20 border-r border-momo/20 text-momo flex-shrink-0">
        <div className="p-6 border-b border-momo/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-momo" />
            <h2 className="text-xl font-serif font-bold text-momo">Admin Console</h2>
          </div>
          <p className="text-xs text-momo font-bold uppercase tracking-wider">Reshmi Verma Studio</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-momo/10 text-[10px] font-bold text-momo">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live System Connected</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'overview' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Calendar size={17} />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('razorpay-test')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'razorpay-test' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <CreditCard size={17} />
            <span>Razorpay Testing Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('breath-tools')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'breath-tools' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Wind size={17} />
            <span>Breath Tests & Animations</span>
          </button>

          <button
            onClick={() => setActiveTab('customization')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'customization' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Settings size={17} />
            <span>Website Content</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'sessions' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <ClockIcon size={17} />
            <span>Sessions & Times</span>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'reels' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Film size={17} />
            <span>Instagram Reels</span>
          </button>

          <button
            onClick={() => setActiveTab('questionnaires')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'questionnaires' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <ListChecks size={17} />
            <span>Questionnaires</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'results' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <BarChart3 size={17} />
            <span>Assessment Results</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'ai-assistant' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Sparkles size={17} />
            <span>AI Scribe & Action Plans</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'clients' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Users size={17} />
            <span>Client Directory</span>
          </button>

          <button
            onClick={() => { setActiveTab('firebase'); checkFirebaseStatus(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors ${
              activeTab === 'firebase' ? 'bg-momo text-mashiro shadow-sm' : 'hover:bg-sakura/50 text-momo'
            }`}
          >
            <Database size={17} />
            <span>Firebase Cloud DB</span>
          </button>
        </nav>

        <div className="p-4 border-t border-momo/10 mt-auto">
          <div className="bg-mashiro p-3.5 rounded-2xl border border-momo/20 text-center">
            <span className="text-[10px] uppercase font-bold text-momo/60 block">Direct URL Route</span>
            <code className="text-xs font-mono font-bold text-momo mt-1 block select-all">/admin</code>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-momo">Consultation Schedule</h1>
                  <p className="text-xs text-momo font-bold uppercase tracking-wider mt-1">Direct bookings synced with Google Calendar and saved in Firestore</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <p className="text-xs font-bold text-momo uppercase tracking-wider">Total Appointments</p>
                  <p className="text-3xl font-bold text-momo mt-2">{bookings.length}</p>
                </div>
                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <p className="text-xs font-bold text-momo uppercase tracking-wider">Pending Reports</p>
                  <p className="text-3xl font-bold text-momo mt-2">{bookings.filter(b => !b.plan).length}</p>
                </div>
                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <p className="text-xs font-bold text-momo uppercase tracking-wider">Total Registered Clients</p>
                  <p className="text-3xl font-bold text-momo mt-2">{new Set(bookings.map(b => b.clientEmail)).size}</p>
                </div>
              </div>

              <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20">
                  <h3 className="font-bold text-momo text-sm uppercase tracking-wider">Upcoming Client Sessions</h3>
                </div>
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-momo font-medium">
                    <Calendar size={36} className="mx-auto mb-3 opacity-30" />
                    <p>No bookings currently recorded. Test out a booking or test payment to see entries populated here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-momo/10">
                    {bookings.map((apt) => (
                      <div 
                        key={apt.id} 
                        onClick={() => {
                          setSelectedBookingId(apt.id);
                          setActiveTab('ai-assistant');
                          setSessionNotes(apt.transcription || '');
                          setGeneratedReport(apt.plan || '');
                        }}
                        className="p-6 flex items-center justify-between hover:bg-sakura/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-[80px] bg-sakura/30 py-2 px-3 rounded-xl border border-momo/10">
                            <p className="text-sm font-bold text-momo">{apt.time}</p>
                            <p className="text-[10px] text-momo font-medium">{apt.date}</p>
                          </div>
                          <div>
                            <p className="font-bold text-momo text-base">{apt.clientName}</p>
                            <p className="text-xs text-momo/80">{apt.clientEmail}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          {apt.meet_link && (
                            <a 
                              href={apt.meet_link} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={e => e.stopPropagation()} 
                              className="text-xs font-bold uppercase tracking-wider bg-momo text-mashiro px-3 py-1.5 rounded-lg hover:bg-momo/90 shadow-sm inline-flex items-center gap-1"
                            >
                              <Video size={13} />
                              <span>Meet Link</span>
                            </a>
                          )}
                          <select
                            value={apt.status || 'Upcoming'}
                            onClick={e => e.stopPropagation()}
                            onChange={async e => {
                              e.stopPropagation();
                              const status = e.target.value;
                              const res = await fetch(`/api/admin/bookings/${apt.id}/status`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status })
                              });
                              if (res.ok) setBookings(prev => prev.map(b => (b.id === apt.id ? { ...b, status } : b)));
                              else alert('Could not update the booking status.');
                            }}
                            className="px-2 py-1.5 rounded-lg border border-momo/30 bg-mashiro text-xs font-bold text-momo"
                            aria-label="Booking status"
                          >
                            <option>Upcoming</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            apt.plan ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.plan ? 'Report Complete' : 'Report Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: RAZORPAY TESTING SUITE */}
          {activeTab === 'razorpay-test' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h1 className="text-3xl font-serif font-bold text-momo">Razorpay Diagnostics & Verification</h1>
                <p className="text-xs text-momo font-bold uppercase tracking-wider mt-1">
                  Test your API keys, inspect configuration, create test orders, and launch the simulated checkout modal directly.
                </p>
              </div>

              {/* Status Card */}
              <div className="bg-mashiro p-6 rounded-3xl border-2 border-momo/20 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-momo/10 pb-6 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-momo block">Active Gateway State</span>
                    <h3 className="text-xl font-bold text-momo mt-1 flex items-center gap-2">
                      <CreditCard size={20} className="text-momo" />
                      <span>{razorpayStatus?.mode || 'Checking...'}</span>
                    </h3>
                  </div>
                  <button
                    onClick={checkRazorpayStatus}
                    disabled={checkingRazorpay}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sakura/30 hover:bg-sakura/60 text-xs font-bold uppercase tracking-wider text-momo border border-momo/20 transition-all"
                  >
                    <RefreshCw size={14} className={checkingRazorpay ? "animate-spin" : ""} />
                    <span>Re-Check Status</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-sakura/20 p-4 rounded-2xl border border-momo/10">
                    <span className="text-[10px] uppercase font-bold text-momo/70 block">Key ID Variable</span>
                    <span className={`text-sm font-bold block mt-1 ${razorpayStatus?.hasKeyId ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {razorpayStatus?.hasKeyId ? 'Configured' : 'Missing'}
                    </span>
                    <span className="text-[11px] font-mono text-momo/70 mt-1 block">
                      {razorpayStatus?.keyPrefix || 'None'}
                    </span>
                  </div>

                  <div className="bg-sakura/20 p-4 rounded-2xl border border-momo/10">
                    <span className="text-[10px] uppercase font-bold text-momo/70 block">Key Secret Variable</span>
                    <span className={`text-sm font-bold block mt-1 ${razorpayStatus?.hasSecret ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {razorpayStatus?.hasSecret ? 'Configured (Hidden)' : 'Missing'}
                    </span>
                    <span className="text-[11px] text-momo/70 mt-1 block">Server-side verified</span>
                  </div>

                  <div className="bg-sakura/20 p-4 rounded-2xl border border-momo/10">
                    <span className="text-[10px] uppercase font-bold text-momo/70 block">Client Modal Key</span>
                    <span className={`text-sm font-bold block mt-1 ${(import.meta as any).env?.VITE_RAZORPAY_KEY_ID ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {(import.meta as any).env?.VITE_RAZORPAY_KEY_ID ? 'Available in Vite' : 'Checking Settings'}
                    </span>
                    <span className="text-[11px] text-momo/70 mt-1 block">VITE_RAZORPAY_KEY_ID</span>
                  </div>

                  <div className="bg-sakura/20 p-4 rounded-2xl border border-momo/10">
                    <span className="text-[10px] uppercase font-bold text-momo/70 block">SDK Instance</span>
                    <span className={`text-sm font-bold block mt-1 ${razorpayStatus?.instanceReady ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {razorpayStatus?.instanceReady ? 'Operational' : 'Unavailable'}
                    </span>
                    <span className="text-[11px] text-momo/70 mt-1 block">Node.js server module</span>
                  </div>
                </div>

                {!razorpayStatus?.configured && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium leading-relaxed">
                    <strong>Notice:</strong> Your keys must be added to <strong>Settings</strong> &rarr; <strong>Secrets / Environment Variables</strong> (<code className="font-mono">RAZORPAY_KEY_ID</code>, <code className="font-mono">RAZORPAY_KEY_SECRET</code>, and <code className="font-mono">VITE_RAZORPAY_KEY_ID</code>). Once saved, run the verification below.
                  </div>
                )}
              </div>

              {/* Interactive Order Creation Test */}
              <div className="bg-mashiro p-6 rounded-3xl border border-momo/20 shadow-sm">
                <h3 className="text-xl font-serif font-bold text-momo mb-2">Simulate Live Order Creation</h3>
                <p className="text-xs text-momo font-medium mb-6">
                  Initiates a server-side call to <code className="font-mono bg-sakura/30 px-1 py-0.5 rounded">/api/create-razorpay-order</code> using your configured credentials to verify token generation.
                </p>

                <div className="flex flex-col sm:flex-row items-end gap-4 max-w-xl mb-6">
                  <div className="flex-1">
                    <label className="block text-xs uppercase font-bold tracking-wider text-momo mb-2">Test Order Amount (INR)</label>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={e => setTestAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-mashiro border border-momo/30 rounded-xl text-sm font-bold text-momo focus:border-momo outline-none"
                      min="1"
                    />
                  </div>
                  <button
                    onClick={handleCreateTestOrder}
                    disabled={isCreatingTestOrder}
                    className="px-6 py-3.5 bg-momo text-mashiro rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-momo/90 transition-all flex items-center gap-2 shadow-md shrink-0"
                  >
                    {isCreatingTestOrder ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Generating Order...</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>1. Create Test Order</span>
                      </>
                    )}
                  </button>
                </div>

                {testOrderError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium mb-6 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{testOrderError}</span>
                  </div>
                )}

                {testOrderResult && (
                  <div className="bg-emerald-50/50 border border-emerald-300 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle size={18} />
                        <span>Order Token Received Successfully from Razorpay!</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                        {testOrderResult.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6 font-mono text-momo">
                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-momo/60 block uppercase font-sans">Amount in Paise</span>
                        <strong>{testOrderResult.amount}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-momo/60 block uppercase font-sans">Currency</span>
                        <strong>{testOrderResult.currency}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-momo/60 block uppercase font-sans">Receipt ID</span>
                        <strong>{testOrderResult.receipt}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-momo/60 block uppercase font-sans">Status</span>
                        <strong className="text-emerald-700">{testOrderResult.status}</strong>
                      </div>
                    </div>

                    <button
                      onClick={handleLaunchTestCheckoutModal}
                      className="px-6 py-3.5 bg-emerald-700 text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-md"
                    >
                      <ExternalLink size={14} />
                      <span>2. Launch Test Checkout Modal (Simulate Payment)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: BREATH TESTS & ANIMATION TOOLS */}
          {activeTab === 'breath-tools' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-momo">Breath Tests & Animation Tools</h1>
                  <p className="text-xs text-momo font-bold uppercase tracking-wider mt-1">
                    Manage the 4 clinical test protocols under "Breathe with Reshmi", their animation modes, pacing, and video overlays.
                  </p>
                </div>
                <button
                  onClick={handleSaveCurrentProtocol}
                  disabled={isSavingProtocol}
                  className="px-6 py-3 bg-momo text-mashiro rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-momo/90 transition-all flex items-center gap-2 shadow-md shrink-0"
                >
                  <Save size={15} />
                  <span>{isSavingProtocol ? 'Saving...' : 'Save Current Protocol'}</span>
                </button>
              </div>

              {protocolSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{protocolSuccessMsg}</span>
                </div>
              )}

              {/* Protocol Selector Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {protocols.map((proto, idx) => (
                  <button
                    key={proto.id}
                    onClick={() => setSelectedProtoIndex(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedProtoIndex === idx
                        ? 'bg-momo text-mashiro border-momo shadow-md'
                        : 'bg-mashiro text-momo border-momo/25 hover:bg-sakura/20'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{proto.emoji}</span>
                    <strong className="text-xs font-bold block truncate">{proto.name}</strong>
                    <span className={`text-[10px] block mt-1 ${selectedProtoIndex === idx ? 'text-mashiro/80' : 'text-momo/70'}`}>
                      {proto.inhale}-{proto.holdIn}-{proto.exhale}-{proto.holdOut}s
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Protocol Editor */}
              {activeProto && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Timing & Properties */}
                  <div className="lg:col-span-7 bg-mashiro p-6 rounded-3xl border border-momo/20 shadow-sm space-y-5">
                    <h3 className="text-lg font-serif font-bold text-momo flex items-center gap-2">
                      <span>{activeProto.emoji}</span>
                      <span>Edit: {activeProto.name}</span>
                    </h3>

                    <div>
                      <label className="block text-xs uppercase font-bold text-momo mb-1">Protocol Display Name</label>
                      <input
                        type="text"
                        value={activeProto.name}
                        onChange={e => {
                          const updated = [...protocols];
                          updated[selectedProtoIndex].name = e.target.value;
                          setProtocols(updated);
                        }}
                        className="w-full px-4 py-2.5 bg-mashiro border border-momo/30 rounded-xl text-sm font-bold text-momo focus:border-momo outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-momo mb-1">Clinical Description</label>
                      <textarea
                        rows={2}
                        value={activeProto.desc}
                        onChange={e => {
                          const updated = [...protocols];
                          updated[selectedProtoIndex].desc = e.target.value;
                          setProtocols(updated);
                        }}
                        className="w-full px-4 py-2 bg-mashiro border border-momo/30 rounded-xl text-xs font-medium text-momo focus:border-momo outline-none resize-none"
                      />
                    </div>

                    {/* Breath Timing Grid */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-sakura/20 rounded-2xl border border-momo/10">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-momo mb-1">Inhale (s)</label>
                        <input
                          type="number"
                          value={activeProto.inhale}
                          onChange={e => {
                            const updated = [...protocols];
                            updated[selectedProtoIndex].inhale = Number(e.target.value);
                            setProtocols(updated);
                          }}
                          className="w-full px-3 py-2 bg-mashiro border border-momo/30 rounded-lg text-sm font-bold text-momo"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-momo mb-1">Hold Full (s)</label>
                        <input
                          type="number"
                          value={activeProto.holdIn}
                          onChange={e => {
                            const updated = [...protocols];
                            updated[selectedProtoIndex].holdIn = Number(e.target.value);
                            setProtocols(updated);
                          }}
                          className="w-full px-3 py-2 bg-mashiro border border-momo/30 rounded-lg text-sm font-bold text-momo"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-momo mb-1">Exhale (s)</label>
                        <input
                          type="number"
                          value={activeProto.exhale}
                          onChange={e => {
                            const updated = [...protocols];
                            updated[selectedProtoIndex].exhale = Number(e.target.value);
                            setProtocols(updated);
                          }}
                          className="w-full px-3 py-2 bg-mashiro border border-momo/30 rounded-lg text-sm font-bold text-momo"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-momo mb-1">Hold Empty (s)</label>
                        <input
                          type="number"
                          value={activeProto.holdOut}
                          onChange={e => {
                            const updated = [...protocols];
                            updated[selectedProtoIndex].holdOut = Number(e.target.value);
                            setProtocols(updated);
                          }}
                          className="w-full px-3 py-2 bg-mashiro border border-momo/30 rounded-lg text-sm font-bold text-momo"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Animation Style Selector */}
                    <div>
                      <label className="block text-xs uppercase font-bold text-momo mb-1">Animation Visual Engine</label>
                      <select
                        value={activeProto.animation_mode || 'fluid'}
                        onChange={e => {
                          const updated = [...protocols];
                          updated[selectedProtoIndex].animation_mode = e.target.value;
                          setProtocols(updated);
                        }}
                        className="w-full px-4 py-2.5 bg-mashiro border border-momo/30 rounded-xl text-xs font-bold text-momo focus:border-momo outline-none"
                      >
                        <option value="geometric-box">Geometric Box (Square Wave Focus Pacer)</option>
                        <option value="vagal-wave">Vagal Wave (Deep Parasympathetic Sine Tide)</option>
                        <option value="coherent-sine">Coherent Sine (0.1 Hz Resonance Rhythm)</option>
                        <option value="solar-pulse">Solar Pulse (Rapid High-Oxygen Burst)</option>
                        <option value="fluid">Organic Fluid Lungs</option>
                      </select>
                    </div>

                    {/* Video URL Overlay */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs uppercase font-bold text-momo flex items-center gap-1.5">
                          <Video size={14} />
                          <span>Ambient Video Background (Stored On-Device)</span>
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          One-Off Stored
                        </span>
                      </div>

                      {/* Quick select chips for the stored ambient video library */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[10px] text-momo/60 font-bold self-center">Stored Presets:</span>
                        {[
                          { label: 'Forest Zen', path: '/videos/box-ambient.mp4' },
                          { label: 'Indigo Ocean', path: '/videos/vagal-ambient.mp4' },
                          { label: 'Golden Dawn', path: '/videos/coherent-ambient.mp4' },
                          { label: 'Solar Chi', path: '/videos/energizer-ambient.mp4' }
                        ].map(vid => (
                          <button
                            key={vid.path}
                            type="button"
                            onClick={() => {
                              const updated = [...protocols];
                              updated[selectedProtoIndex].video_url = vid.path;
                              setProtocols(updated);
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                              activeProto.video_url === vid.path 
                                ? 'bg-momo text-mashiro border-momo' 
                                : 'bg-sakura/20 text-momo border-momo/20 hover:bg-sakura/40'
                            }`}
                          >
                            {vid.label}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={activeProto.video_url || ''}
                        onChange={e => {
                          const updated = [...protocols];
                          updated[selectedProtoIndex].video_url = e.target.value;
                          setProtocols(updated);
                        }}
                        placeholder="/videos/box-ambient.mp4"
                        className="w-full px-4 py-2.5 bg-mashiro border border-momo/30 rounded-xl text-xs font-mono text-momo focus:border-momo outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-momo mb-1">Internal Clinical Rationale</label>
                      <input
                        type="text"
                        value={activeProto.clinical_notes || ''}
                        onChange={e => {
                          const updated = [...protocols];
                          updated[selectedProtoIndex].clinical_notes = e.target.value;
                          setProtocols(updated);
                        }}
                        placeholder="e.g., Autonomic baroreceptor reset"
                        className="w-full px-4 py-2 bg-mashiro border border-momo/30 rounded-xl text-xs font-medium text-momo focus:border-momo outline-none"
                      />
                    </div>
                  </div>

                  {/* Right: Live Animation & Video Preview */}
                  <div className="lg:col-span-5 bg-sakura/20 p-6 rounded-3xl border border-momo/20 flex flex-col items-center justify-center relative min-h-[420px] overflow-hidden">
                    {/* Background Video if present */}
                    {activeProto.video_url ? (
                      <video
                        src={activeProto.video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-sakura/40 to-mashiro opacity-60"></div>
                    )}

                    <div className="relative z-10 text-center w-full flex flex-col items-center">
                      <span className="text-[10px] uppercase font-black text-momo tracking-widest block mb-4 bg-mashiro px-3 py-1 rounded-full border border-momo/20 shadow-sm">
                        Mode: {activeProto.animation_mode || 'fluid'}
                      </span>

                      {/* Interactive preview ball */}
                      <motion.div
                        animate={{
                          scale: previewPlaying ? [1, 1.8, 1.8, 1] : 1.15,
                        }}
                        transition={{
                          duration: activeProto.inhale + activeProto.holdIn + activeProto.exhale + activeProto.holdOut || 12,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-36 h-36 rounded-full bg-mashiro border-4 border-momo flex flex-col items-center justify-center shadow-xl mb-6 relative z-10"
                      >
                        <span className="text-3xl mb-1">{activeProto.emoji}</span>
                        <span className="text-[10px] font-black uppercase text-momo tracking-wider">
                          {previewPlaying ? 'Active' : 'Preview'}
                        </span>
                      </motion.div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPreviewPlaying(!previewPlaying)}
                          className="px-5 py-2.5 bg-momo text-mashiro rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-momo/90 shadow-sm"
                        >
                          {previewPlaying ? <Pause size={14} /> : <Play size={14} />}
                          <span>{previewPlaying ? 'Stop Preview' : 'Test Loop'}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-momo/80 mt-4 text-center font-medium max-w-xs">
                        Timing cycle: {activeProto.inhale}s inhale &rarr; {activeProto.holdIn}s hold &rarr; {activeProto.exhale}s exhale &rarr; {activeProto.holdOut}s hold.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: WEBSITE CUSTOMIZATION */}
          {activeTab === 'customization' && <ContentEditor />}
          {activeTab === 'sessions' && <SessionsTimes />}
          {activeTab === 'reels' && <ReelsEditor />}
          {activeTab === 'questionnaires' && <QuestionnaireEditor />}
          {activeTab === 'results' && <ResultsView />}

          {/* TAB 5: AI SCRIBE */}
          {activeTab === 'ai-assistant' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-sakura rounded-xl flex items-center justify-center text-momo">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-momo">AI Clinical Assistant</h1>
                  <p className="text-momo/70">Generate structured reports and metabolic plans from consultation notes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                    <label className="block text-xs font-bold uppercase tracking-wider text-momo mb-2">Select Booking</label>
                    <select 
                      value={selectedBookingId || ''}
                      onChange={(e) => setSelectedBookingId(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-momo/30 rounded-xl focus:border-momo bg-mashiro text-momo font-medium"
                    >
                      {bookings.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.clientName} - {b.date} at {b.time}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4 p-4 bg-sakura/20 rounded-xl border border-momo/10">
                      <p className="text-[10px] font-bold text-momo uppercase tracking-wider mb-1">Intake Survey Notes</p>
                      <p className="text-xs text-momo/90 font-medium whitespace-pre-wrap">
                        {bookings.find(b => b.id === selectedBookingId)?.notes || "No pre-consultation intake recorded."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm flex flex-col h-[400px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-momo mb-2">Session Notes (Scribe)</label>
                    <p className="text-xs text-momo/70 mb-3">Jot down rough observations, symptoms, dietary recalls, and recommendations.</p>
                    <textarea 
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="flex-1 w-full p-4 border border-momo/30 rounded-xl focus:border-momo resize-none bg-mashiro text-momo font-medium placeholder-momo/40 outline-none"
                      placeholder="e.g., Client reported post-prandial fatigue. Fasting insulin was 14. Sleep architecture fragmented. Recommended 5-5 coherent breathing and removing refined carbs..."
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 text-rose-800 rounded-xl flex items-start gap-3 text-xs border border-rose-200">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full py-4 bg-momo text-mashiro rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-momo/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Generating Clinical Report...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={18} />
                        <span>Generate & Save Action Plan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Output Section */}
                <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
                  <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20 flex justify-between items-center">
                    <h3 className="font-bold text-momo text-xs uppercase tracking-wider">Clinical Consultation Plan</h3>
                    {generatedReport && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedReport);
                          alert("Report copied to clipboard!");
                        }}
                        className="text-xs font-bold uppercase tracking-wider text-momo underline hover:text-momo/80"
                      >
                        Copy Markdown
                      </button>
                    )}
                  </div>
                  <div className="p-6 flex-1 overflow-auto prose prose-momo max-w-none text-momo text-sm leading-relaxed">
                    {generatedReport ? (
                      <Markdown>{generatedReport}</Markdown>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-momo/40">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="text-xs uppercase font-bold tracking-wider">Structured action plan will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: CLIENTS */}
          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-3xl font-serif font-bold text-momo mb-8">Client Directory</h1>
              <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20">
                  <h3 className="font-bold text-momo text-xs uppercase tracking-wider">Registered Consult Clients</h3>
                </div>
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-momo/60 text-xs uppercase font-bold">
                    No clients registered yet.
                  </div>
                ) : (
                  <div className="divide-y divide-momo/10">
                    {Array.from(new Map(bookings.map(b => [b.clientEmail, b])).values()).map((c: any, idx) => (
                      <div key={idx} className="p-6 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-momo text-base">{c.clientName}</p>
                          <p className="text-xs text-momo/70">{c.clientEmail}</p>
                        </div>
                        <span className="text-xs font-bold bg-sakura/30 text-momo px-3 py-1.5 rounded-full">
                          Active Client
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: FIREBASE CLOUD DB */}
          {activeTab === 'firebase' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-momo">Firebase Cloud Firestore</h1>
                  <p className="text-xs text-momo font-bold uppercase tracking-wider mt-1">
                    Persistent Cloud Database & Authentication Infrastructure
                  </p>
                </div>
                <button
                  onClick={handleSyncFirebase}
                  disabled={isSyncingFirebase}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-momo text-mashiro font-bold text-xs uppercase tracking-wider hover:bg-momo/90 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  <RefreshCw size={16} className={isSyncingFirebase ? "animate-spin" : ""} />
                  {isSyncingFirebase ? "Checking..." : "Re-check connection"}
                </button>
                <button
                  onClick={handleCreateDemo}
                  className="px-4 py-2.5 bg-sakura/40 text-momo border border-momo/20 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-sakura/70 transition-colors"
                >
                  Create demo record
                </button>
              </div>

              {firebaseSyncMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  {firebaseSyncMsg}
                </div>
              )}

              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <span className="text-[10px] font-bold text-momo/60 uppercase tracking-widest block">Connection State</span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-lg font-bold text-momo">Provisioned & Online</span>
                  </div>
                  <p className="text-[11px] text-momo/70 mt-2">Enterprise Firestore cluster</p>
                </div>

                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <span className="text-[10px] font-bold text-momo/60 uppercase tracking-widest block">Security Rules</span>
                  <div className="flex items-center gap-2 mt-2">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <span className="text-lg font-bold text-momo">Rules Deployed</span>
                  </div>
                  <p className="text-[11px] text-momo/70 mt-2">ABAC Zero-Trust protection</p>
                </div>

                <div className="bg-mashiro p-6 rounded-2xl border border-momo/20 shadow-sm">
                  <span className="text-[10px] font-bold text-momo/60 uppercase tracking-widest block">Active Collections</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Database size={20} className="text-momo" />
                    <span className="text-lg font-bold text-momo">7 Collections</span>
                  </div>
                  <p className="text-[11px] text-momo/70 mt-2">All data is stored in Firestore</p>
                </div>
              </div>

              {/* Configuration Details Box */}
              <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20 flex justify-between items-center">
                  <h3 className="font-bold text-momo text-xs uppercase tracking-wider">Cloud Project & Database Details</h3>
                  <span className="text-[11px] text-momo font-mono bg-sakura/40 px-2.5 py-1 rounded-md">Web Platform</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-sakura/10 p-4 rounded-xl border border-momo/10">
                      <p className="text-[10px] uppercase font-bold text-momo/60">Firebase Project ID</p>
                      <p className="font-mono text-xs font-bold text-momo mt-1 select-all">gen-lang-client-0060610435</p>
                    </div>
                    <div className="bg-sakura/10 p-4 rounded-xl border border-momo/10">
                      <p className="text-[10px] uppercase font-bold text-momo/60">Firestore Database ID</p>
                      <p className="font-mono text-xs font-bold text-momo mt-1 select-all">ai-studio-fitwithreshmi-8fe5a15d-0804-4fdd-b026-9b5b30d8cef2</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-sakura/10 p-4 rounded-xl border border-momo/10">
                      <p className="text-[10px] uppercase font-bold text-momo/60">Authentication Domain</p>
                      <p className="font-mono text-xs font-bold text-momo mt-1 select-all">gen-lang-client-0060610435.firebaseapp.com</p>
                    </div>
                    <div className="bg-sakura/10 p-4 rounded-xl border border-momo/10">
                      <p className="text-[10px] uppercase font-bold text-momo/60">Cloud Storage Bucket</p>
                      <p className="font-mono text-xs font-bold text-momo mt-1 select-all">gen-lang-client-0060610435.firebasestorage.app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections Table */}
              <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20">
                  <h3 className="font-bold text-momo text-xs uppercase tracking-wider">Synchronized Data Models & Schemas</h3>
                </div>
                <div className="divide-y divide-momo/10">
                  {[
                    { path: "clients", desc: "Patient & client profile accounts with clinical history notes", schema: "Client" },
                    { path: "bookings", desc: "Consultation slots, appointment dates, Google Meet links & calendar event IDs", schema: "Booking" },
                    { path: "sessions", desc: "Audio transcriptions, clinical diagnostics & personalized care action plans", schema: "Session" },
                    { path: "breath_protocols", desc: "4-7-8, Box Breathing, Coherent Metabolism & Soma cadence timings", schema: "BreathProtocol" },
                    { path: "instagram_reels", desc: "Clinical video feed with thumbnails, view metrics & URLs", schema: "InstagramReel" },
                    { path: "site_settings", desc: "Global practice settings, pricing, announcement banners & contact details", schema: "SiteSetting" },
                    { path: "assessments", desc: "Health Resilience Assessment submissions with domain scores (Gut, Breath, Hormones, Sleep)", schema: "Assessment" },
                  ].map((col, i) => (
                    <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sakura/5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-momo bg-sakura/30 px-3 py-1.5 rounded-lg border border-momo/10">
                          /{col.path}
                        </span>
                        <p className="text-xs text-momo/80">{col.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-momo/60 bg-momo/5 px-2.5 py-1 rounded self-start sm:self-center">
                        Schema: {col.schema}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
