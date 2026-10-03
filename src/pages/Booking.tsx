import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Mic, MicOff, RefreshCw } from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken } from '../lib/auth';
import type { User } from 'firebase/auth';
import Onboarding from '../components/Onboarding';
import { useRazorpay } from 'react-razorpay';
import { formatPrice } from '../lib/content';
import { useContent } from '../lib/useContent';

export default function Booking() {
  const [step, setStep] = useState(1);
  const { services: SERVICES, currency } = useContent();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const selectedService = SERVICES.find(sv => sv.id === selectedServiceId) || SERVICES[0];
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Auth state
  const [needsAuth, setNeedsAuth] = useState(!localStorage.getItem('clientEmail'));
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // New Details State
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Booking details confirmation state
  const [isBooked, setIsBooked] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Onboarding state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Payment state
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const { Razorpay } = useRazorpay();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if coming back from OAuth redirect or payment
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') === 'true') {
      setIsBooked(true);
      setHasCompletedOnboarding(true); // skip onboarding if redirected back
    }

    const isLocalUser = !!localStorage.getItem('clientEmail');
    if (isLocalUser) {
      setNeedsAuth(false);
    }
    
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        if (token) setSessionToken(token);
        setNeedsAuth(false);
      },
      () => {
        if (!isLocalUser) setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setBookingError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setSessionToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBookingError("Your browser does not support Speech Recognition. Please type your description instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  useEffect(() => {
    if (selectedDate && step === 1) {
      setIsLoadingTimes(true);
      fetch(`/api/calendar/availability?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) {
            setAvailableTimes(data.slots);
          } else {
            console.error(data.error || 'Failed to fetch slots');
            setAvailableTimes([]);
          }
        })
        .catch(err => {
          console.error(err);
          setAvailableTimes([]);
        })
        .finally(() => setIsLoadingTimes(false));
    }
  }, [selectedDate, step]);

  const bookCalendarEvent = async () => {
    const isLocalUser = !!localStorage.getItem('clientEmail');
    if (!user && !isLocalUser) return;
    
    setIsBooking(true);
    setBookingError('');
    
    const patientEmail = user?.email || localStorage.getItem('clientEmail');
    const patientName = user?.displayName || user?.email || localStorage.getItem('clientName') || 'Client';
    
    if (!patientEmail) {
      setBookingError("Missing email for booking");
      setIsBooking(false);
      return;
    }

    try {
      // Create it via our backend if possible (as testing integration),
      // we'll try to book via backend, and fallback to direct API with token if we must.
      // But we have the new backend to handle service account booking.
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          patientName: patientName,
          patientEmail: patientEmail,
          notes: description,
          serviceId: selectedService.id
        })
      });

      if (res.status === 400 || res.status === 409) {
        // The server refused (e.g. the time was just taken): tell the person, don't try other routes.
        const data = await res.json().catch(() => ({}));
        setBookingError(data.error || 'That time is not available. Please pick another.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to create calendar event via backend');
      }

      setIsBooked(true);
    } catch (err) {
      console.error('Backend booking failed, falling back to direct frontend calendar APIs:', err);
      // Fallback: Book directly to user's calendar if host backend isn't set up
      if (!sessionToken) {
         setBookingError('Booking failed. Could not access calendar or backend properly configured.');
         setIsBooking(false);
         return;
      }
      try {
        const startTime = new Date(`${selectedDate} ${selectedTime}`);
        const endTime = new Date(startTime.getTime() + selectedService.durationMinutes * 60000);

        const event = {
          summary: `${selectedService.title} with HealthwithReshmi`,
          description: `Description: ${description}`,
          start: { dateTime: startTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
          end: { dateTime: endTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
          attendees: [{ email: patientEmail }],
          reminders: { useDefault: true },
        };

        const fallbackRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });

        if (!fallbackRes.ok) {
          throw new Error('Fallback failed');
        }
        setIsBooked(true);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        setBookingError('Could not book the session using either method. Please make sure permissions are granted and try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2) {
      if (selectedService.price > 0) {
        // Need to pay
        setIsInitializingPayment(true);
        try {
          const res = await fetch('/api/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceId: selectedService.id }) // the server decides the price
          });
          const order = await res.json();
          if (order.id) {
            const options = {
              key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
              amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              currency: order.currency,
              name: "HealthwithReshmi",
              description: selectedService.title,
              order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of create-razorpay-order
              handler: function (response: any) {
                // Payment was successful, proceed to book event
                bookCalendarEvent();
              },
              prefill: {
                name: user?.displayName || '',
                email: user?.email || '',
              },
              theme: {
                color: "#2a2522", // momo color
              },
            };

            const rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
              setBookingError(response.error.description || 'Payment Failed');
            });
            rzp1.open();
          } else {
            setBookingError('Could not initialize payment order.');
          }
        } catch (err) {
          console.error(err);
          setBookingError('Error starting payment.');
        } finally {
          setIsInitializingPayment(false);
        }
      } else {
        // Free, just book
        bookCalendarEvent();
      }
    }
  };

  if (!hasCompletedOnboarding) {
    return (
      <div className="bg-mashiro min-h-screen py-24 sm:py-32 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-momo uppercase mb-4">
              Let's Personalize Your Journey
            </h1>
            <p className="text-lg text-momo/70 font-light">
              Answer 5 quick questions so Reshmi can understand your needs before you book.
            </p>
          </div>
          <Onboarding onComplete={(answers) => {
            const formatted = Object.values(answers).map((v, i) => `Q${i+1}: ${v}`).join('\n');
            setDescription('Pre-assessment:\n' + formatted + '\n\nAdditional notes:\n');
            setHasCompletedOnboarding(true);
          }} />
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="bg-mashiro min-h-screen py-32 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
        <div className="relative z-10 text-center max-w-lg mx-auto bg-sakura/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-sakura">
          <h2 className="text-3xl font-serif font-bold text-momo mb-4">Sign in to Book</h2>
          <p className="text-momo/70 mb-8">We need access to your calendar to schedule your session with Reshmi.</p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center justify-center gap-3 w-full border border-momo bg-mashiro text-momo px-6 py-3 rounded-xl font-bold hover:bg-momo hover:text-mashiro transition-all disabled:opacity-50"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  if (isBooked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-mashiro py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sakura/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-sakura relative z-10"
        >
          <div className="w-20 h-20 bg-sakura rounded-full flex items-center justify-center mx-auto mb-6 text-momo border border-momo/30 shadow-[0_0_30px_rgba(245,143,152,0.3)]">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-momo mb-4">You're All Set! 🎉</h2>
          <p className="text-momo/80 mb-6">
            Your <span className="font-semibold text-momo">{selectedService.title}</span> is locked in for <span className="font-semibold text-momo">{selectedDate}</span> at <span className="font-semibold text-momo">{selectedTime}</span>.
          </p>
          <div className="bg-mashiro border border-sakura p-4 rounded-xl text-sm text-momo/80 mb-8 italic text-left">
            <p className="text-xs text-momo uppercase tracking-wider font-bold mb-2 not-italic">Fit with Reshmi Team:</p>
            "Thanks, {user?.displayName || user?.email || localStorage.getItem('clientName') || 'Client'}. We've received your request: '{description}' - we look forward to meeting you!"
          </div>
          <p className="text-momo/60 text-sm mb-8">
            A calendar invitation has been added to your Google Calendar and sent to your email.
          </p>
          <button 
            onClick={() => {
              setIsBooked(false);
              setStep(1);
              setSelectedDate('');
              setSelectedTime('');
              setDescription('');
            }}
            className="px-6 py-3 bg-sakura border border-momo/20 text-momo rounded-xl font-medium hover:bg-momo hover:text-mashiro transition-colors"
          >
            Book Another Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-mashiro min-h-screen py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-momo mb-6 tracking-tight">Fit with Reshmi</h1>
          <p className="text-xl text-momo/70 font-light">
            {step === 1 ? "Select a service and choose a time that works for you." : "Just a few quick questions so we can hit the ground running!"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-sakura/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-sakura overflow-hidden">
          {/* Progress Bar */}
          <div className="flex border-b border-sakura bg-mashiro/50">
            <div className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${step === 1 ? 'text-momo border-b-2 border-momo bg-sakura/50' : 'text-momo/50'}`}>
              1. Date & Time
            </div>
            <div className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${step === 2 ? 'text-momo border-b-2 border-momo bg-sakura/50' : 'text-momo/50'}`}>
              2. Your details
            </div>
          </div>

          <form onSubmit={handleNextStep} className="p-8">
            {bookingError && (
              <div className="bg-red-50 text-red-600 p-4 mb-8 rounded-xl text-sm border border-red-200 shadow-sm text-center">
                {bookingError}
              </div>
            )}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10"
                >
                  {/* Services Selection */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-momo mb-4">Choose Your Session</h2>
                    {SERVICES.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          selectedService.id === service.id 
                            ? 'border-momo bg-sakura shadow-[0_0_15px_rgba(245,143,152,0.1)]' 
                            : 'border-sakura bg-mashiro hover:border-momo/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-bold text-momo">{service.title}</h3>
                          <span className="font-medium text-momo text-sm">{formatPrice(service.price, currency)}</span>
                        </div>
                        <p className="text-momo/70 text-sm mb-3">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs text-momo/60 font-medium">
                          <span className="flex items-center gap-1"><Clock size={14} /> {service.durationMinutes} Min</span>
                          <span className="flex items-center gap-1"><Video size={14} /> Google Meet</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar & Time Selection */}
                  <div>
                    <h2 className="text-lg font-bold text-momo mb-4">Pick a Time</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-momo/70 mb-2">Date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-momo" />
                          </div>
                          <input 
                            type="date" 
                            required
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-sakura bg-mashiro rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo text-momo transition-all"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      {selectedDate && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <label className="block text-sm font-medium text-momo/70 mb-3">Available Times</label>
                          {isLoadingTimes ? (
                            <div className="flex justify-center items-center py-6">
                              <RefreshCw className="animate-spin text-momo/50 mr-2" />
                              <span className="text-momo/50">Fetching calendar times...</span>
                            </div>
                          ) : availableTimes.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {availableTimes.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-3 px-4 rounded-xl text-sm font-medium border transition-colors ${
                                    selectedTime === time
                                      ? 'bg-sakura text-momo border-momo'
                                      : 'bg-mashiro text-momo/70 border-sakura hover:border-momo hover:text-momo'
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-momo/50 border border-dashed border-sakura rounded-xl">
                              No slots available on this day.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="max-w-2xl mx-auto space-y-8 py-4"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sakura text-momo mb-4 border border-momo/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-momo mb-2">Almost there, {user?.displayName?.split(' ')[0] || 'there'}.</h3>
                    <p className="text-momo/70">What would you like to focus on during our session?</p>
                  </div>

                  <div className="bg-mashiro p-6 rounded-2xl border border-sakura">
                    <label className="flex items-center justify-between text-lg font-bold text-momo mb-2">
                       <span>How can we help? 🎙️</span>
                       <button
                         type="button"
                         onClick={toggleRecording}
                         className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm ${isRecording ? 'bg-momo text-mashiro animate-pulse' : 'bg-sakura text-momo hover:bg-momo/10'}`}
                       >
                         {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                         {isRecording ? 'Stop Recording' : 'Voice Input'}
                       </button>
                    </label>
                    <p className="text-sm text-momo/60 mb-3">You can type or click the microphone to dictate your focus areas.</p>
                    <textarea 
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., I want to discuss my nutrition goals and learn how to manage stress better through breathing..."
                      className="w-full px-4 py-3 border border-sakura bg-mashiro rounded-xl focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo text-momo transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-6 border-t border-sakura flex justify-between items-center">
              {step > 1 ? (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center text-momo/70 hover:text-momo font-medium transition-colors px-4 py-2 rounded-lg hover:bg-sakura"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back
                </button>
              ) : (
                <div></div> // Spacer
              )}
              
              <button 
                type="submit"
                disabled={(step === 1 && (!selectedDate || !selectedTime)) || isBooking || isInitializingPayment}
                className="py-3 px-8 bg-momo text-mashiro rounded-xl font-bold hover:bg-momo/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(245,143,152,0.2)]"
              >
                {step === 1 ? (
                  <>Next Step <ArrowRight size={18} /></>
                ) : (
                  <>
                    {isInitializingPayment ? 'Preparing...' : isBooking ? 'Booking...' : (selectedService.price > 0 ? 'Continue to Payment' : 'Confirm Booking')}
                    {!isBooking && !isInitializingPayment && <CheckCircle2 size={18} />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Calendar Integration Test */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-sakura/20 rounded-2xl border border-sakura text-center">
          <h3 className="text-momo font-bold mb-2">System Diagnostic</h3>
          <p className="text-momo/70 text-sm mb-4">Click below to verify the backend integration with GOOGLE_CALENDAR_ID is functioning properly.</p>
          <button 
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/calendar/test');
                const data = await res.json();
                if (data.success) {
                  alert("✅ Calendar connection successful: " + data.message);
                } else {
                  alert("❌ Calendar connection failed: " + data.error);
                }
              } catch (err) {
                alert("Network error: Could not reach the server.");
              }
            }}
            className="px-4 py-2 bg-momo text-mashiro rounded-xl text-sm font-medium hover:bg-momo/90 transition-colors"
          >
            Test Calendar Integration
          </button>
        </div>

      </div>
    </div>
  );
}
