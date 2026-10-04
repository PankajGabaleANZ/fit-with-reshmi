import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Calendar, Clock, FileText, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clientName = localStorage.getItem('clientName');
  const clientId = localStorage.getItem('clientId');

  useEffect(() => {
    if (!clientId) {
      navigate('/login');
      return;
    }
    
    fetch('/api/client/bookings')
      .then(r => {
        if (r.status === 401) {
          // Session expired or never existed: clear stale display details and sign in again.
          ['clientId', 'clientName', 'clientEmail'].forEach(k => localStorage.removeItem(k));
          navigate('/login');
          throw new Error('signed out');
        }
        return r.json();
      })
      .then(data => {
        if (data.bookings) setBookings(data.bookings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId, navigate]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBooking(false);
      setBookingSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-mashiro py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-light text-momo tracking-tight">Client <em>portal</em>.</h1>
            <p className="text-momo/70 mt-2 font-light">Welcome back, {clientName || 'Client'}. Here is your progress.</p>
          </div>
          <button 
            onClick={() => navigate('/booking')} // navigate to booking page directly
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-xl text-mashiro bg-momo hover:bg-momo/90 transition-all hover:scale-[1.02]"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Consultation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: <Activity className="w-5 h-5" /> },
                { id: 'appointments', name: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
                { id: 'plans', name: 'Nutrition Plans', icon: <FileText className="w-5 h-5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-sakura text-momo border border-momo/20' 
                      : 'text-momo/60 hover:bg-sakura/50 hover:text-momo'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-mashiro p-6 rounded-3xl border border-sakura shadow-sm">
                    <p className="text-xs font-medium text-momo/60 mb-1 uppercase tracking-widest">Current Weight</p>
                    <p className="text-3xl font-bold text-momo tracking-tight">142 lbs</p>
                    <p className="text-sm text-momo/80 mt-2 flex items-center">
                      ↓ 2.5 lbs this month
                    </p>
                  </div>
                  <div className="bg-mashiro p-6 rounded-3xl border border-sakura shadow-sm">
                    <p className="text-xs font-medium text-momo/60 mb-1 uppercase tracking-widest">Water Intake</p>
                    <p className="text-3xl font-bold text-momo tracking-tight">85 oz</p>
                    <p className="text-sm text-momo/80 mt-2 flex items-center">
                      Daily average
                    </p>
                  </div>
                  <div className="bg-mashiro p-6 rounded-3xl border border-sakura shadow-sm">
                    <p className="text-xs font-medium text-momo/60 mb-1 uppercase tracking-widest">Next Session</p>
                    <p className="text-lg font-bold text-momo mt-1 tracking-tight">Oct 24, 10:00 AM</p>
                    <p className="text-sm text-momo/70 mt-1">Check-in Call</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-mashiro rounded-3xl border border-sakura overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-sakura">
                    <h3 className="text-lg font-bold text-momo">Recent Updates</h3>
                  </div>
                  <div className="divide-y divide-sakura">
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-sakura/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sakura flex items-center justify-center text-momo">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-momo">New Meal Plan Uploaded</p>
                          <p className="text-xs text-momo/60">Oct 15, 2023</p>
                        </div>
                      </div>
                      <button className="text-momo text-sm font-medium hover:underline">View</button>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-sakura/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sakura/50 flex items-center justify-center text-momo/70">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-momo">Completed Weekly Check-in</p>
                          <p className="text-xs text-momo/60">Oct 10, 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-mashiro rounded-3xl shadow-sm border border-sakura overflow-hidden">
                  <div className="px-6 py-5 border-b border-sakura flex justify-between items-center">
                    <h3 className="text-lg font-bold text-momo">Upcoming Appointments</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {bookings.length === 0 && <p className="text-momo/50 text-sm">No bookings yet.</p>}
                    {bookings.map(book => (
                      <div key={book.id} className="border border-sakura rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sakura/10">
                        <div className="flex items-start gap-4">
                          <div className="bg-sakura rounded-xl p-3 text-center min-w-[70px]">
                            <p className="text-xs font-bold text-momo uppercase">{new Date(book.date).toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-2xl font-bold text-momo">{new Date(book.date).getDate()}</p>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-momo">Consultation</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-momo/70">
                              <span className="flex items-center gap-1"><Clock size={14} /> {book.time}</span>
                              <span className="capitalize">{book.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {book.meet_link && (
                            <a href={book.meet_link} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm font-medium text-mashiro bg-momo hover:bg-momo/90 rounded-xl transition-colors">Join Call</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'plans' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookings.filter(b => b.plan).length === 0 && (
                     <p className="text-momo/50 col-span-2">No plans available yet. They will appear here once Reshmi shares them.</p>
                  )}
                  {bookings.filter(b => b.plan).map(b => (
                    <div key={b.id} className="bg-mashiro rounded-3xl shadow-sm border border-sakura p-6">
                      <div className="w-12 h-12 bg-sakura rounded-xl flex items-center justify-center text-momo mb-4">
                        <FileText size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-momo mb-2">Plan from {new Date(b.date).toLocaleDateString()}</h3>
                      <div className="prose prose-sm prose-momo max-w-none text-momo/80">
                        <Markdown>{b.plan}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mashiro/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-mashiro rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-sakura"
          >
            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-sakura rounded-full flex items-center justify-center mx-auto mb-4 text-momo">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-momo mb-2">Booking Confirmed!</h3>
                <p className="text-momo/70">Your consultation has been scheduled. You'll receive an email with the details shortly.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-momo">Book Consultation</h3>
                  <button onClick={() => setShowBooking(false)} className="text-momo/50 hover:text-momo transition-colors">
                    ✕
                  </button>
                </div>
                <form onSubmit={handleBook} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-momo/80 mb-1">Consultation Type</label>
                    <select className="w-full px-4 py-3 border border-sakura bg-mashiro text-momo rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo">
                      <option>Initial Discovery Call (Free)</option>
                      <option>Follow-up Check-in</option>
                      <option>Deep Dive Strategy Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-momo/80 mb-1">Preferred Date</label>
                    <input type="date" required className="w-full px-4 py-3 border border-sakura bg-mashiro text-momo rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-momo/80 mb-1">Preferred Time</label>
                    <select className="w-full px-4 py-3 border border-sakura bg-mashiro text-momo rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo">
                      <option>Morning (9AM - 12PM)</option>
                      <option>Afternoon (12PM - 4PM)</option>
                      <option>Evening (4PM - 7PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-momo/80 mb-1">Notes for Reshmi</label>
                    <textarea rows={3} className="w-full px-4 py-3 border border-sakura bg-mashiro text-momo rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo placeholder-momo/40" placeholder="Any specific topics you want to cover?"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 px-4 bg-momo text-mashiro rounded-xl font-medium hover:bg-momo/90 transition-colors">
                    Confirm Booking
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
