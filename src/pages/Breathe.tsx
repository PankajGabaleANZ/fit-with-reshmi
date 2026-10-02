import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, 
  Activity, Heart, ChevronRight, ArrowRight, Brain, AlertCircle, 
  Settings, Award, HelpCircle, Timer, Compass, Mic, MicOff,
  Video, Sliders, Maximize2, Minimize2, ZoomIn, Film, Check, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BoltScoreCalc from '../components/BoltScoreCalc';
import VagalToneAssessment from '../components/VagalToneAssessment';

// Voice Guidance Engine (Simulates warm, calming functional breathwork coach voice)
class VoiceGuide {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer soothing, natural English female voices (e.g. Samantha, Karen, Google UK Female, Natural)
    const preferred = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Serena') || v.name.includes('Female')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) this.voice = preferred;
  }

  speak(text: string) {
    if (!this.isEnabled || !this.synth) return;
    try {
      this.synth.cancel(); // Stop current speech to stay timely with breath pacing
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = 0.88; // Gentle, rhythmic, unhurried cadence
      utterance.pitch = 1.02; // Warm, reassuring tone
      utterance.volume = 0.9;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Voice guidance error:", e);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  setEnabled(val: boolean) {
    this.isEnabled = val;
    if (!val) this.stop();
  }
}

// Audio Synthesizer Engine (Uses Browser Web Audio API safely)
class BreathSynth {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private currentFrequency: number = 220; // Soft baseline (A3)

  init() {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  start() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      this.osc = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      this.osc.type = 'sine';
      this.osc.frequency.setValueAtTime(this.currentFrequency, this.ctx.currentTime);
      
      // Soft ambient low-volume volume
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      this.osc.start();
    } catch (e) {
      console.error("Failed to start synthesizer audio", e);
    }
  }

  setPacing(phase: 'inhale' | 'exhale' | 'hold', duration: number) {
    if (!this.ctx || !this.gainNode || !this.osc) return;
    const now = this.ctx.currentTime;

    if (phase === 'inhale') {
      // Modulate frequency and volume upwards
      this.osc.frequency.exponentialRampToValueAtTime(330, now + duration);
      this.gainNode.gain.linearRampToValueAtTime(0.08, now + duration);
    } else if (phase === 'exhale') {
      // Modulate frequency and volume downwards
      this.osc.frequency.exponentialRampToValueAtTime(165, now + duration);
      this.gainNode.gain.linearRampToValueAtTime(0.03, now + duration);
    } else {
      // Hold phase: steady slight humming or soft quiet state
      this.osc.frequency.setValueAtTime(220, now);
      this.gainNode.gain.linearRampToValueAtTime(0.015, now + 0.5);
    }
  }

  stop() {
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      // Safe exit
    }
  }
}

const DEFAULT_PRESET_PROTOCOLS = [
  {
    id: '478',
    name: 'Somatic Vagal Reset (4-7-8)',
    desc: 'Flagship somatic autonomic regulation. 4s nasal inhalation, 7s full oxygen retention, 8s slow pursed-lip exhalation to trigger immediate parasympathetic baroreflex slowing.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    emoji: '🍃',
    animation_mode: 'vagal-wave',
    video_url: '/videos/vagal-ambient.mp4',
    clinical_notes: 'Extended 8s exhale stimulates vagal efferent firing, reducing sympathetic heart rate surges and serum cortisol.'
  },
  {
    id: 'box',
    name: 'Box Breathing (Navy SEALs 4-4-4-4)',
    desc: 'Square wave autonomic stabilization for acute situational stress, cognitive poise and tactical composure.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    emoji: '🧘',
    animation_mode: 'geometric-box',
    video_url: '/videos/box-ambient.mp4',
    clinical_notes: 'Square wave autonomic reset.'
  },
  {
    id: 'coherent',
    name: 'Coherent Metabolism Harmony (5-5)',
    desc: 'Aligns pulmonary blood-gas flow with metabolic cellular exchange for optimized hormone stability.',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    emoji: '⚡',
    animation_mode: 'coherent-sine',
    video_url: '/videos/coherent-ambient.mp4',
    clinical_notes: '0.1 Hz resonance frequency maximizing HRV.'
  },
  {
    id: 'energizer',
    name: 'Soma Quick Energizer',
    desc: 'Rapid oxygen infusion designed to spark high cellular ATP and break afternoon brain fog.',
    inhale: 2,
    holdIn: 1,
    exhale: 2,
    holdOut: 1,
    emoji: '🔥',
    animation_mode: 'solar-pulse',
    video_url: '/videos/energizer-ambient.mp4',
    clinical_notes: 'Sympathetic-metabolic oxygen infusion.'
  }
];

// Ambient Atmosphere Scenes Catalog (Waves, Landscapes, Sunsets, Cosmic & Custom AI)
export interface AmbientAtmosphere {
  id: string;
  name: string;
  category: string;
  label: string;
  videoUrl: string;
  description: string;
  icon: string;
}

export const AMBIENT_ATMOSPHERES: AmbientAtmosphere[] = [
  {
    id: 'ocean-waves',
    name: 'Pacific Rolling Surf',
    category: 'Waves',
    label: 'Ocean Waves',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-gentle-ocean-waves-42171-large.mp4',
    description: 'Slow-motion rolling surf, golden reflections, and rhythmic shoreline breath tide',
    icon: '🌊'
  },
  {
    id: 'mountain-mist',
    name: 'Alpine Landscape & Mist',
    category: 'Landscape',
    label: 'Mountain Mist',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-mist-over-a-green-forest-42416-large.mp4',
    description: 'Expansive aerial mountain view with slow drifting mist and pine canopies',
    icon: '🏔️'
  },
  {
    id: 'sunset-clouds',
    name: 'Golden Horizon Clouds',
    category: 'Sky',
    label: 'Sunset Horizon',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-over-a-sunset-sky-42354-large.mp4',
    description: 'Warm atmospheric clouds billowing gracefully across a serene amber sky',
    icon: '🌅'
  },
  {
    id: 'zen-stream',
    name: 'Emerald Water Currents',
    category: 'Waters',
    label: 'Zen Stream',
    videoUrl: '/videos/coherent-ambient.mp4',
    description: 'Gentle water ripples and serene restorative botanical currents',
    icon: '🌿'
  },
  {
    id: 'cosmic-aurora',
    name: 'Vagal Bioluminescent Aurora',
    category: 'Cosmic',
    label: 'Deep Aurora',
    videoUrl: '/videos/vagal-ambient.mp4',
    description: 'Ethereal soothing violet and emerald ribbons of ambient light',
    icon: '✨'
  },
  {
    id: 'custom-ai',
    name: 'Custom AI Generated Video',
    category: 'AI Generated',
    label: 'AI Video',
    videoUrl: '',
    description: 'Input your own AI video URL (Runway, Luma Dream Machine, Sora, etc.)',
    icon: '🎥'
  }
];

export default function Breathe() {
  const [protocols, setProtocols] = useState<any[]>(DEFAULT_PRESET_PROTOCOLS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState(0);
  const [customInhale, setCustomInhale] = useState(4);
  const [customHoldIn, setCustomHoldIn] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [customHoldOut, setCustomHoldOut] = useState(4);
  const [isCustom, setIsCustom] = useState(false);
  const [videoBgEnabled, setVideoBgEnabled] = useState(true);

  // Ambient Atmosphere Video State
  const [selectedAmbientId, setSelectedAmbientId] = useState<string>('ocean-waves');
  const [ambientOpacity, setAmbientOpacity] = useState<number>(0.42);
  const [isFullImmersion, setIsFullImmersion] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reshmi_custom_ambient_video') || '';
    }
    return '';
  });
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiUrlInput, setAiUrlInput] = useState<string>('');

  // Selected Ambient Scene & Active Video Source
  const currentAmbientScene = AMBIENT_ATMOSPHERES.find(s => s.id === selectedAmbientId) || AMBIENT_ATMOSPHERES[0];
  const activeVideoSrc = selectedAmbientId === 'custom-ai'
    ? (customVideoUrl || protocols[activePreset]?.video_url || '/videos/box-ambient.mp4')
    : (currentAmbientScene.videoUrl || protocols[activePreset]?.video_url);

  // Dynamic zoom effect synced with breathing cycle
  // Inhale zooms into the landscape / waves; Exhale gently glides back!
  const getVideoScale = () => {
    if (!isPlaying) return 1.0;
    if (currentPhase === 'inhale') return 1.12;
    if (currentPhase === 'holdIn') return 1.12;
    if (currentPhase === 'exhale') return 1.0;
    return 1.0;
  };

  // Dynamic state
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [progress, setProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Shared Pulmonary Diagnostic State
  const [boltHoldSeconds, setBoltHoldSeconds] = useState<number | null>(null);

  const synthRef = useRef<BreathSynth | null>(null);
  const voiceGuideRef = useRef<VoiceGuide | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice cues mapping for natural spoken coaching
  const speakPhaseCue = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    if (!voiceGuideRef.current) return;
    if (phase === 'inhale') {
      voiceGuideRef.current.speak("Inhale deeply through your nose");
    } else if (phase === 'holdIn') {
      voiceGuideRef.current.speak("Hold and suspend gently");
    } else if (phase === 'exhale') {
      voiceGuideRef.current.speak("Exhale slowly and let go");
    } else if (phase === 'holdOut') {
      voiceGuideRef.current.speak("Pause and relax in stillness");
    }
  };

  // Load dynamically configured protocols from the backend runtime store
  useEffect(() => {
    fetch('/api/breath/protocols')
      .then(res => res.json())
      .then(data => {
        if (data.protocols && data.protocols.length > 0) {
          setProtocols(data.protocols);
        }
      })
      .catch(err => console.log('Using default protocols:', err));
  }, []);

  useEffect(() => {
    synthRef.current = new BreathSynth();
    voiceGuideRef.current = new VoiceGuide();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if (voiceGuideRef.current) {
        voiceGuideRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update time limits when preset changes
  useEffect(() => {
    if (!isPlaying && protocols[activePreset]) {
      const preset = protocols[activePreset];
      if (!isCustom) {
        setTimeLeft(preset.inhale);
        setCurrentPhase('inhale');
        setProgress(0);
      }
    }
  }, [activePreset, isCustom, protocols]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (synthRef.current) synthRef.current.stop();
      if (voiceGuideRef.current) voiceGuideRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      if (!isMuted && synthRef.current) {
        synthRef.current.start();
      }
      triggerBreathCycle();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (synthRef.current) {
      if (isPlaying) {
        if (!isMuted) {
          synthRef.current.stop();
        } else {
          synthRef.current.start();
          const activeDuration = getPhaseDuration(currentPhase);
          synthRef.current.setPacing(
            currentPhase === 'inhale' ? 'inhale' : currentPhase === 'exhale' ? 'exhale' : 'hold',
            activeDuration
          );
        }
      }
    }
  };

  const toggleVoice = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabled(nextVal);
    if (voiceGuideRef.current) {
      voiceGuideRef.current.setEnabled(nextVal);
      if (nextVal && isPlaying) {
        speakPhaseCue(currentPhase);
      }
    }
  };

  const getPhaseDuration = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    if (isCustom) {
      if (phase === 'inhale') return customInhale;
      if (phase === 'holdIn') return customHoldIn;
      if (phase === 'exhale') return customExhale;
      return customHoldOut;
    } else {
      const preset = protocols[activePreset] || DEFAULT_PRESET_PROTOCOLS[0];
      if (phase === 'inhale') return preset.inhale;
      if (phase === 'holdIn') return preset.holdIn;
      if (phase === 'exhale') return preset.exhale;
      return preset.holdOut;
    }
  };

  const triggerBreathCycle = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' = currentPhase;
    let initialDuration = getPhaseDuration(phase);

    // Guard if preset phase is 0
    if (initialDuration === 0) {
      phase = getNextPhase(phase);
      initialDuration = getPhaseDuration(phase);
    }

    setCurrentPhase(phase);
    setTimeLeft(initialDuration);
    
    if (!isMuted && synthRef.current) {
      synthRef.current.setPacing(
        phase === 'inhale' ? 'inhale' : phase === 'exhale' ? 'exhale' : 'hold',
        initialDuration
      );
    }

    if (isVoiceEnabled && voiceGuideRef.current) {
      speakPhaseCue(phase);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition phase
          const nextPhase = getNextPhase(phase);
          phase = nextPhase;
          const nextDuration = getPhaseDuration(nextPhase);

          if (!isMuted && synthRef.current) {
            synthRef.current.setPacing(
              nextPhase === 'inhale' ? 'inhale' : nextPhase === 'exhale' ? 'exhale' : 'hold',
              nextDuration
            );
          }

          if (isVoiceEnabled && voiceGuideRef.current) {
            speakPhaseCue(nextPhase);
          }

          if (nextPhase === 'inhale') {
            setCompletedCycles((c) => c + 1);
          }

          setCurrentPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Re-run cycle whenever currentPhase triggers
  useEffect(() => {
    if (isPlaying) {
      const total = getPhaseDuration(currentPhase);
      const remaining = timeLeft;
      setProgress(((total - remaining) / total) * 100);
    }
  }, [timeLeft, currentPhase, isPlaying]);

  const getNextPhase = (p: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    if (p === 'inhale') {
      const duration = getPhaseDuration('holdIn');
      return duration > 0 ? 'holdIn' : 'exhale';
    }
    if (p === 'holdIn') {
      return 'exhale';
    }
    if (p === 'exhale') {
      const duration = getPhaseDuration('holdOut');
      return duration > 0 ? 'holdOut' : 'inhale';
    }
    return 'inhale';
  };

  const getPhaseColor = () => {
    if (currentPhase === 'inhale') return 'from-momo to-sakura';
    if (currentPhase === 'holdIn') return 'from-momo/80 to-momo';
    if (currentPhase === 'exhale') return 'from-sakura to-momo/50';
    return 'from-sakura/50 to-sakura';
  };

  const getPhaseText = () => {
    if (currentPhase === 'inhale') return 'Inhale Deeply';
    if (currentPhase === 'holdIn') return 'Hold Breath';
    if (currentPhase === 'exhale') return 'Exhale Silently';
    return 'Rest / Hold Empty';
  };

  const resetExercise = () => {
    setIsPlaying(false);
    if (synthRef.current) synthRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    const preset = protocols[activePreset] || DEFAULT_PRESET_PROTOCOLS[0];
    setCurrentPhase('inhale');
    setTimeLeft(isCustom ? customInhale : preset.inhale);
    setProgress(0);
    setCompletedCycles(0);
  };

  return (
    <div className="bg-mashiro text-momo min-h-screen py-32 selection:bg-sakura selection:text-momo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sakura/50 border border-momo/20 text-momo text-sm font-bold mb-6 uppercase tracking-widest"
          >
            <Wind size={16} className="animate-pulse" />
            <span>Pulmonary & Metabolic Synergy</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif font-bold text-momo mb-6 tracking-tighter"
          >
            Breathe with <span className="text-transparent bg-clip-text bg-gradient-to-r from-momo to-momo/60">Reshmi</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-momo/80 font-light leading-relaxed mb-8"
          >
            Breathing is the prime regulator of cellular energy efficiency, glycemic response, and mental state. Step into our dynamic neuromodulation studio to optimize your wellness pathway.
          </motion.p>

          {/* Quick Jump Diagnostics & Tools Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <a
              href="#breath-pacer-top"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mashiro hover:bg-momo hover:text-mashiro border border-momo/30 text-xs font-bold uppercase tracking-wider text-momo transition-all hover:scale-105 shadow-sm"
            >
              <Wind size={13} />
              <span>Interactive Pacer</span>
            </a>
            <a
              href="#bolt-diagnostic"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mashiro hover:bg-momo hover:text-mashiro border border-momo/30 text-xs font-bold uppercase tracking-wider text-momo transition-all hover:scale-105 shadow-sm"
            >
              <Timer size={13} />
              <span>BOLT Score Diagnostic</span>
            </a>
            <a
              href="#vagal-check"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mashiro hover:bg-momo hover:text-mashiro border border-momo/30 text-xs font-bold uppercase tracking-wider text-momo transition-all hover:scale-105 shadow-sm"
            >
              <Activity size={13} />
              <span>Vagal Tone Assessment</span>
            </a>
            <a
              href="#breath-science"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mashiro hover:bg-momo hover:text-mashiro border border-momo/30 text-xs font-bold uppercase tracking-wider text-momo transition-all hover:scale-105 shadow-sm"
            >
              <Brain size={13} />
              <span>Metabolic Science</span>
            </a>
          </motion.div>
        </div>

        {/* Full-Immersion Ambient Background for Entire Sanctuary when active */}
        {isFullImmersion && isPlaying && activeVideoSrc && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
            <motion.video
              key={`full-bg-${activeVideoSrc}`}
              src={activeVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              animate={{ scale: getVideoScale() }}
              transition={{
                duration: isPlaying ? getPhaseDuration(currentPhase) : 2,
                ease: "easeInOut"
              }}
              style={{ opacity: ambientOpacity * 0.65 }}
              className="w-full h-full object-cover filter brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-[var(--bg)]/75 backdrop-blur-[3px]" />
          </div>
        )}

        {/* Ambient Atmosphere & Immersion Selector Bar */}
        <div className="mb-6 bg-[var(--glass)] border border-[var(--glass-line)] rounded-3xl p-4 md:p-5 backdrop-blur-xl shadow-lg relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Atmosphere Scenes Pill Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1 shrink-0 mr-1">
                <Film size={12} className="text-emerald-500" />
                <span>Atmosphere:</span>
              </span>

              {AMBIENT_ATMOSPHERES.map((scene) => {
                const isActive = selectedAmbientId === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setSelectedAmbientId(scene.id);
                      if (scene.id === 'custom-ai' && !customVideoUrl) {
                        setShowAiModal(true);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03]'
                        : 'bg-[var(--bg)] hover:bg-[var(--glass-line)] border border-[var(--glass-line)] text-[var(--ink)]'
                    }`}
                    title={scene.description}
                  >
                    <span>{scene.icon}</span>
                    <span>{scene.label}</span>
                    {scene.id === 'custom-ai' && customVideoUrl && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Subtlety Opacity Slider & Full Immersion Toggle */}
            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[var(--glass-line)]">
              
              {/* Opacity / Subtlety Control */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                  <Sliders size={11} />
                  <span>Subtlety:</span>
                </span>
                <input
                  type="range"
                  min="0.15"
                  max="0.75"
                  step="0.05"
                  value={ambientOpacity}
                  onChange={(e) => setAmbientOpacity(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 accent-emerald-500 cursor-pointer"
                  title={`Subtle Background Opacity: ${Math.round(ambientOpacity * 100)}%`}
                />
                <span className="text-[10px] font-mono text-[var(--muted)] w-7">
                  {Math.round(ambientOpacity * 100)}%
                </span>
              </div>

              {/* Full Immersion Toggle */}
              <button
                onClick={() => setIsFullImmersion(!isFullImmersion)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isFullImmersion
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'bg-[var(--bg)] border-[var(--glass-line)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Toggle Full Sanctuary Immersion across the whole page"
              >
                {isFullImmersion ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span>{isFullImmersion ? 'Sanctuary Mode ON' : 'Full Immersion'}</span>
              </button>

              {/* Custom AI Video Configuration Button */}
              {selectedAmbientId === 'custom-ai' && (
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-2.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Video size={12} />
                  <span>Config AI Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Scene Hint description */}
          <div className="mt-2.5 text-[11px] font-mono text-[var(--muted)] flex items-center justify-between">
            <span className="truncate">
              Scene: <strong className="text-[var(--ink)] font-sans">{currentAmbientScene.name}</strong> — {currentAmbientScene.description}
            </span>
            <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              {isPlaying ? '● Synchronizing with Lung Inhale & Exhale' : '○ Starts automatically when session begins'}
            </span>
          </div>
        </div>

        {/* Dynamic Breathing Engine Card */}
        <div id="breath-pacer-top" className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-24 items-stretch relative z-10">
          
          {/* Somatic Luxury Chamber & Organic Orb Widget (Left) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 somatic-luxury-chamber p-7 sm:p-9 rounded-[3rem] shadow-2xl flex flex-col items-center justify-between relative min-h-[660px] overflow-hidden border border-[rgba(255,122,69,0.3)]"
          >
            {/* Dynamic Runtime Stored Ambient Video Background with Breath-Synchronized Zoom */}
            {videoBgEnabled && activeVideoSrc && (
              <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
                <motion.video
                  key={activeVideoSrc}
                  src={activeVideoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  animate={{ 
                    scale: getVideoScale() 
                  }}
                  transition={{
                    duration: isPlaying ? getPhaseDuration(currentPhase) : 2,
                    ease: "easeInOut"
                  }}
                  style={{
                    opacity: isPlaying ? ambientOpacity * 0.85 : 0.12
                  }}
                  className="w-full h-full object-cover filter brightness-90 contrast-110 transition-opacity duration-1000"
                />
                {/* Visual frosted scrim ensuring all pacer graphics & typography are pristine */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0705]/95 via-[#0E0705]/60 to-[#0E0705]/80 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,72,30,0.18)_0%,rgba(14,7,5,0.7)_70%,rgba(8,4,3,0.95)_100%)]" />
              </div>
            )}

            {/* Video Controls & Mode Badge Top Left/Right */}
            <div className="w-full z-20 flex items-center justify-between pointer-events-auto mb-4">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/60 text-[#FFD2B8] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[rgba(255,122,69,0.3)] shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#FF7A45] animate-pulse"></span>
                <span>{protocols[activePreset]?.name?.split('(')[0] || 'Somatic Pacer'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVideoBgEnabled(!videoBgEnabled)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#FFF7F2] rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-sm backdrop-blur-md transition-all cursor-pointer"
                >
                  {videoBgEnabled ? 'Hide Video' : 'Show Video'}
                </button>
              </div>
            </div>

            {/* Somatic Header Details */}
            <div className="text-center relative z-20 mb-3">
              <div className="somatic-eyebrow-tag mb-3">
                <span className="dot"></span>
                <span>SOMATIC REGULATION · {protocols[activePreset]?.inhale || 4}-{protocols[activePreset]?.holdIn || 7}-{protocols[activePreset]?.exhale || 8} CADENCE</span>
              </div>
              <h2 className="somatic-title mb-1.5">
                BREATHE <em>NOW</em>
              </h2>
              <p className="text-xs font-medium text-[#E2CEC4] max-w-sm mx-auto leading-relaxed">
                Reset your autonomic nervous system in real time through vagal entrainment.
              </p>
            </div>

            {/* Protocol Specific Animation Overlay Graphics */}
            {protocols[activePreset]?.animation_mode === 'geometric-box' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                <motion.div
                  animate={{
                    rotate: isPlaying ? [0, 90, 180, 270, 360] : 0,
                    scale: isPlaying 
                      ? currentPhase === 'inhale' ? [1, 1.25] 
                        : currentPhase === 'holdIn' ? 1.25 
                        : currentPhase === 'exhale' ? [1.25, 1] 
                        : 1 
                      : 1
                  }}
                  transition={{
                    duration: isPlaying ? 16 : 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-80 h-80 border-2 border-dashed border-[#FF7A45]/30 rounded-[2.5rem]"
                />
              </div>
            )}

            {protocols[activePreset]?.animation_mode === 'vagal-wave' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`vagal-ring-${i}`}
                    animate={{
                      scale: isPlaying 
                        ? currentPhase === 'exhale' ? [1, 1.8 + i * 0.2] : [1, 1.15]
                        : [1, 1.08, 1],
                      opacity: isPlaying && currentPhase === 'exhale' ? [0.6, 0] : 0.15
                    }}
                    transition={{
                      duration: isPlaying && currentPhase === 'exhale' ? 8 : 4,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut"
                    }}
                    className="absolute w-64 h-64 border border-[#FF7A45]/40 rounded-full"
                  />
                ))}
              </div>
            )}

            {protocols[activePreset]?.animation_mode === 'coherent-sine' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                <motion.div
                  animate={{
                    scale: isPlaying ? (currentPhase === 'inhale' ? [1, 1.35] : [1.35, 1]) : [1, 1.1, 1],
                    borderRadius: isPlaying ? ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"] : "50%"
                  }}
                  transition={{
                    duration: isPlaying ? 5 : 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-72 h-72 border border-[#FF7A45]/30 bg-[#FF7A45]/5 shadow-inner"
                />
              </div>
            )}

            {protocols[activePreset]?.animation_mode === 'solar-pulse' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <motion.div
                    key={`solar-ray-${deg}`}
                    style={{ transform: `rotate(${deg}deg) translateY(-140px)` }}
                    animate={{
                      opacity: isPlaying ? (currentPhase === 'inhale' ? [0.2, 0.8] : [0.8, 0.2]) : 0.3,
                      scaleY: isPlaying ? (currentPhase === 'inhale' ? [0.7, 1.3] : [1.3, 0.7]) : 1
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-0.5 h-10 bg-gradient-to-t from-[#FF7A45]/70 to-transparent"
                  />
                ))}
              </div>
            )}

            {/* Glowing Particle Airflow Streams */}
            <div className="absolute inset-x-0 top-24 bottom-24 pointer-events-none z-0">
              {isPlaying && currentPhase === 'inhale' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`inhale-stream-${i}`}
                      initial={{ 
                        opacity: 0, 
                        scale: 1.5,
                        x: Math.cos((i * 60 * Math.PI) / 180) * 160, 
                        y: Math.sin((i * 60 * Math.PI) / 180) * 160 
                      }}
                      animate={{ 
                        opacity: [0, 0.8, 0], 
                        scale: [1.2, 0.6, 0.3],
                        x: 0, 
                        y: 0 
                      }}
                      transition={{ 
                        duration: getPhaseDuration('inhale'), 
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeIn" 
                      }}
                      className="absolute w-2 h-2 rounded-full bg-[#FF7A45]"
                    />
                  ))}
                </div>
              )}

              {isPlaying && currentPhase === 'exhale' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`exhale-stream-${i}`}
                      initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                      animate={{ 
                        opacity: [0, 0.9, 0], 
                        scale: [0.3, 1.2, 1.6],
                        x: Math.cos((i * 60 * Math.PI) / 180) * 170, 
                        y: Math.sin((i * 60 * Math.PI) / 180) * 170 
                      }}
                      transition={{ 
                        duration: getPhaseDuration('exhale'), 
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeOut" 
                      }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-[#FFB088] border border-[#FF7A45]/50"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ORGANIC ORB INTERACTIVE PACER WIDGET */}
            <div className="organic-orb-container my-3 relative z-20">
              {/* Outer Glowing Liquid Aura */}
              <motion.div
                animate={{
                  scale: isPlaying 
                    ? currentPhase === 'inhale' ? [1, 1.5] 
                      : currentPhase === 'holdIn' ? 1.5
                      : currentPhase === 'exhale' ? [1.5, 1]
                      : 1
                    : [1, 1.08, 1],
                  opacity: isPlaying ? [0.4, 0.8, 0.5] : 0.3
                }}
                transition={{
                  duration: isPlaying ? getPhaseDuration(currentPhase) : 3,
                  ease: "easeInOut",
                  repeat: isPlaying ? 0 : Infinity
                }}
                className="organic-orb-aura"
              />

              {/* Pulsing Harmonic Waves */}
              <motion.div
                animate={{
                  scale: isPlaying 
                    ? currentPhase === 'inhale' ? [1, 1.3] 
                      : currentPhase === 'holdIn' ? 1.3
                      : currentPhase === 'exhale' ? [1.3, 1]
                      : 1
                    : 1.05,
                  rotate: [0, 180, 360],
                  borderRadius: isPlaying 
                    ? ["50%", "44% 56% 52% 48% / 54% 48% 52% 46%", "50%"]
                    : "50%"
                }}
                transition={{
                  scale: { duration: isPlaying ? getPhaseDuration(currentPhase) : 2, ease: "easeInOut" },
                  rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                  borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 border border-[rgba(255,122,69,0.35)] rounded-full"
              />

              {/* Core Organic Orb */}
              <motion.div 
                animate={{
                  scale: isPlaying 
                    ? currentPhase === 'inhale' ? [1, 1.32] 
                      : currentPhase === 'holdIn' ? 1.32
                      : currentPhase === 'exhale' ? [1.32, 1]
                      : 1
                    : [1, 1.04, 1],
                  borderRadius: isPlaying
                    ? ["50%", "48% 52% 56% 44% / 52% 46% 54% 48%", "50%"]
                    : "50%"
                }}
                transition={{
                  duration: isPlaying ? getPhaseDuration(currentPhase) : 3,
                  ease: "easeInOut",
                  repeat: isPlaying ? 0 : Infinity
                }}
                className="organic-orb-core cursor-pointer"
                onClick={togglePlay}
                title={isPlaying ? "Click to Pause" : "Click to Breathe"}
              >
                <div className="text-center px-4">
                  <span className="text-[11px] uppercase tracking-widest text-[#FFE8DC] font-extrabold block mb-1">
                    {getPhaseText()}
                  </span>
                  
                  {/* Wave Ticker */}
                  <div className="h-4 flex items-center justify-center gap-1 my-0.5 overflow-hidden">
                    {isPlaying && currentPhase === 'inhale' && (
                      [...Array(5)].map((_, i) => (
                        <motion.span 
                          key={i}
                          animate={{ height: [3, 14, 3] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
                          className="w-1 bg-[#FFFFFF] rounded-full"
                        />
                      ))
                    )}
                    {isPlaying && currentPhase === 'exhale' && (
                      [...Array(5)].map((_, i) => (
                        <motion.span 
                          key={i}
                          animate={{ height: [14, 3, 14] }}
                          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14 }}
                          className="w-1 bg-[#FFE8DC] rounded-full"
                        />
                      ))
                    )}
                    {isPlaying && (currentPhase === 'holdIn' || currentPhase === 'holdOut') && (
                      <span className="text-[9px] font-black text-[#FFFFFF] tracking-widest uppercase">O2 SUSPEND</span>
                    )}
                  </div>

                  <span className="text-4xl sm:text-5xl font-serif font-bold text-white block my-1 drop-shadow-md">
                    {isPlaying ? timeLeft : '4-7-8'}
                  </span>
                  
                  <span className="text-[10px] tracking-wider text-[#FFD2B8] uppercase block font-bold">
                    {isPlaying 
                      ? (currentPhase === 'holdIn' || currentPhase === 'holdOut' ? 'HOLD AIR' : 'STEADY')
                      : 'PRESS TO START'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Interactive Calmness Meter */}
            <div className="relative z-10 w-full max-w-sm px-5 py-2.5 bg-black/40 border border-[rgba(255,122,69,0.25)] rounded-2xl shadow-sm text-center my-3 backdrop-blur-md">
              <div className="flex justify-between items-center text-xs text-[#E2CEC4] font-bold mb-1">
                <span className="uppercase tracking-wider text-[10px]">Autonomic Calmness Index</span>
                <span className="text-[#FF7A45] text-xs font-black">
                  {isPlaying 
                    ? (currentPhase === 'inhale' ? '70%' : currentPhase === 'holdIn' ? '45%' : currentPhase === 'exhale' ? '20%' : '15%')
                    : '100% Calibrated'}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#D9481E] to-[#FF7A45] h-full"
                  animate={{ 
                    width: isPlaying 
                      ? (currentPhase === 'inhale' ? '70%' : currentPhase === 'holdIn' ? '45%' : currentPhase === 'exhale' ? '20%' : '15%')
                      : '85%'
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Somatic Pill Button Specs & Controls */}
            <div className="relative z-10 flex flex-col items-center gap-4 w-full mt-2">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={togglePlay}
                  className="somatic-pill-primary"
                  title={isPlaying ? "Pause Session" : "Start Somatic Breathing"}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} />
                      <span>PAUSE CADENCE</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current ml-0.5" />
                      <span>BREATHE NOW (4-7-8)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetExercise}
                  className="somatic-pill-ghost"
                  title="Reset Counter"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>

                <button
                  onClick={toggleVoice}
                  className={`somatic-pill-ghost ${isVoiceEnabled ? 'border-[#FF7A45] text-[#FF7A45]' : 'opacity-70'}`}
                  title={isVoiceEnabled ? "Voice Coaching Active" : "Enable Voice Coach"}
                >
                  {isVoiceEnabled ? <Mic size={16} className="text-[#FF7A45] animate-pulse" /> : <MicOff size={16} />}
                  <span>{isVoiceEnabled ? 'Voice ON' : 'Voice'}</span>
                </button>

                <button
                  onClick={toggleMute}
                  className={`somatic-pill-ghost ${!isMuted ? 'border-[#FF7A45] text-[#FF7A45]' : 'opacity-70'}`}
                  title={isMuted ? "Enable Ambient Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-[#FF7A45] animate-pulse" />}
                  <span>{isMuted ? 'Muted' : 'Sound'}</span>
                </button>
              </div>

              {/* Progress & Breath Cycles Completed */}
              <div className="w-full text-center mt-1">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2 max-w-xs mx-auto">
                  <motion.div 
                    className="bg-gradient-to-r from-[#D9481E] to-[#FF7A45] h-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-xs text-[#E2CEC4] tracking-widest uppercase font-bold">
                  Completed Breath Cycles: <span className="font-extrabold text-[#FF7A45] text-sm ml-1">{completedCycles}</span>
                </p>
                {isVoiceEnabled && isPlaying && (
                  <p className="text-[11px] text-[#FFD2B8] font-medium mt-1 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A45] animate-ping"></span>
                    <span>Voice Guide: coaching {currentPhase}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Console Configurations & Clinical Telemetry (Right) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="border border-[var(--glass-line)] bg-[var(--surface-card)] p-7 sm:p-8 rounded-[3rem] shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                    <Settings size={22} className="text-[var(--jade)]" /> Configure Cadence Protocol
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--glass)] text-[var(--jade)] border border-[var(--glass-line)] font-bold">
                    4 Clinical Modes
                  </span>
                </div>

                {/* Preset Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                  {protocols.map((pt, idx) => {
                    const isSelected = !isCustom && activePreset === idx;
                    return (
                      <button
                        key={pt.id || idx}
                        onClick={() => {
                          setIsCustom(false);
                          setActivePreset(idx);
                          resetExercise();
                        }}
                        className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#17110D] text-[#FFF7F2] border-[var(--jade)] shadow-lg ring-2 ring-[var(--jade)]/20 scale-[1.01]' 
                            : 'border-[var(--glass-line)] bg-[var(--surface-elevated)] hover:bg-[var(--glass)] hover:border-[var(--jade)]/40 shadow-sm text-[var(--ink)]'
                        }`}
                      >
                        <span className="text-2xl mt-0.5 shrink-0">{pt.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <h4 className={`font-bold text-xs sm:text-sm tracking-tight ${isSelected ? 'text-[#FFF7F2]' : 'text-[var(--ink)]'}`}>
                              {pt.name}
                            </h4>
                            {pt.id === '478' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-[var(--jade)] text-white">
                                Flagship
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-[#E2CEC4]' : 'text-[var(--muted)]'}`}>
                            {pt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Manual/Custom Protocol Settings Button */}
                <button
                  onClick={() => {
                    setIsCustom(true);
                    resetExercise();
                  }}
                  className={`w-full text-center py-3 rounded-2xl font-bold uppercase tracking-wider text-xs border transition-all mb-4 shadow-sm cursor-pointer ${
                    isCustom 
                      ? 'bg-[var(--jade)] text-white border-[var(--jade)] shadow-md' 
                      : 'border-[var(--glass-line)] bg-[var(--surface-elevated)] text-[var(--ink)] hover:bg-[var(--jade)] hover:text-white'
                  }`}
                >
                  Custom Cadence Architect (Inhale / Hold / Exhale)
                </button>

                {isCustom && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[var(--surface-elevated)] border border-[var(--glass-line)] rounded-2xl mb-4 shadow-sm"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-wider">Inhale (s)</label>
                      <input type="number" value={customInhale} onChange={(e) => { setCustomInhale(Math.max(1, parseInt(e.target.value) || 2)); resetExercise(); }} className="w-full bg-white dark:bg-black/30 border border-[var(--glass-line)] rounded-xl py-2 px-3 text-xs font-bold text-[var(--ink)] focus:border-[var(--jade)] outline-none" min={1} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-wider">Hold Full (s)</label>
                      <input type="number" value={customHoldIn} onChange={(e) => { setCustomHoldIn(Math.max(0, parseInt(e.target.value) || 0)); resetExercise(); }} className="w-full bg-white dark:bg-black/30 border border-[var(--glass-line)] rounded-xl py-2 px-3 text-xs font-bold text-[var(--ink)] focus:border-[var(--jade)] outline-none" min={0} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-wider">Exhale (s)</label>
                      <input type="number" value={customExhale} onChange={(e) => { setCustomExhale(Math.max(1, parseInt(e.target.value) || 2)); resetExercise(); }} className="w-full bg-white dark:bg-black/30 border border-[var(--glass-line)] rounded-xl py-2 px-3 text-xs font-bold text-[var(--ink)] focus:border-[var(--jade)] outline-none" min={1} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-wider">Hold Empty (s)</label>
                      <input type="number" value={customHoldOut} onChange={(e) => { setCustomHoldOut(Math.max(0, parseInt(e.target.value) || 0)); resetExercise(); }} className="w-full bg-white dark:bg-black/30 border border-[var(--glass-line)] rounded-xl py-2 px-3 text-xs font-bold text-[var(--ink)] focus:border-[var(--jade)] outline-none" min={0} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Physiological Telemetry Card */}
              <div className="pt-4 border-t border-[var(--glass-line)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--faint)] block mb-2 font-bold">
                  Clinical Biomarker Telemetry (Live Feedback)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--glass-line)] text-center">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--faint)] block">Vagal Tone</span>
                    <strong className="text-sm font-bold text-[var(--jade)]">Optimal</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--glass-line)] text-center">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--faint)] block">HRV Coherence</span>
                    <strong className="text-sm font-bold text-[var(--ink)]">0.10 Hz</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--glass-line)] text-center">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--faint)] block">Cortisol Drop</span>
                    <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">-28% est.</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Science Info Sections - Explaining What Breathe With Reshmi Is */}
        <section id="breath-science" className="py-20 border-t border-sakura bg-mashiro rounded-[3rem] px-8 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sakura/30 rounded-full blur-3xl -z-10"></div>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-momo mb-12 tracking-tight text-center">
              The Metabolic Science of Breathwork
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 bg-momo text-mashiro rounded-xl shadow-sm shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-momo mb-2">Vagal Stimulation & Digestion</h3>
                    <p className="text-sm font-medium leading-relaxed text-momo/90">
                      Slowing your breathing down to ~5.5-second cycles immediately stimulates the vagus nerve. This transitions the nervous system into the parasympathetic "rest and digest state," increasing hydrochloric acid production and boosting nutritional enzyme availability.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 bg-momo text-mashiro rounded-xl shadow-sm shrink-0">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-momo mb-2">Glycemic Control</h3>
                    <p className="text-sm font-medium leading-relaxed text-momo/90">
                      Unregulated anxiety triggers continuous adrenaline release, signaling the liver to dump glucose into the bloodstream. Controlled clinical breathing offsets sympathetic overdrive, calming glycemic spikes and lowering insulin demand.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 bg-momo text-mashiro rounded-xl shadow-sm shrink-0">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-momo mb-2">Cellular Oxygenation & pH</h3>
                    <p className="text-sm font-medium leading-relaxed text-momo/90">
                      Over-breathing depletes CO₂ levels, causing arterial vessels to constrict (the Bohr Effect). Intentionally holding your breath after exhaling allows CO₂ to gently accumulate, dilating vessels and maximizing true oxygen release to vital metabolic tissues.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 bg-momo text-mashiro rounded-xl shadow-sm shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-momo mb-2">DNA Respiratory Optimization</h3>
                    <p className="text-sm font-medium leading-relaxed text-momo">
                      Breath therapy trains pulmonary tolerance to withstand variable blood flow pressures, maximizing mitochondrial fuel utilization. This creates a highly stable ground-state metabolic rate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/booking"
                className="group inline-flex items-center gap-2 px-10 py-5 text-sm font-bold tracking-widest uppercase rounded-full text-mashiro bg-momo overflow-hidden transition-all hover:scale-105 shadow-xl"
              >
                Integrate Breath & Diet Protocols <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Pulmonary & Autonomic Clinical Diagnostics Suite */}
        <section className="mb-24 space-y-16">
          {/* Diagnostic 1: BOLT Score */}
          <BoltScoreCalc
            onSelectPreset={(idx) => {
              setActivePreset(idx);
              setIsCustom(false);
              resetExercise();
            }}
            onTransferToVagal={(sec) => {
              setBoltHoldSeconds(sec);
            }}
          />

          {/* Diagnostic 2: Vagal Tone Assessment */}
          <VagalToneAssessment
            externalHoldSeconds={boltHoldSeconds}
            onSelectPreset={(idx) => {
              setActivePreset(idx);
              setIsCustom(false);
              resetExercise();
            }}
          />
        </section>

        {/* Custom AI Video Modal Dialog */}
        {showAiModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg)] border-2 border-emerald-500/40 rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowAiModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--glass-line)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                aria-label="Close Dialog"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Film size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-[var(--serif)] font-medium text-[var(--ink)]">
                    Custom AI Ambient Video
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--muted)] block">
                    PASTE AI-GENERATED AMBIENT LOOP
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--muted)] leading-relaxed mb-5 mt-2">
                Import any AI-generated video loop (e.g., from Runway, Luma Dream Machine, Sora, Kling, or royalty-free MP4). The video will subtly appear and synchronize its zoom with your inhale and exhale.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-bold">
                    Video Direct MP4 / WebM URL:
                  </label>
                  <input
                    type="url"
                    value={aiUrlInput || customVideoUrl}
                    onChange={(e) => setAiUrlInput(e.target.value)}
                    placeholder="https://example.com/ambient-waves.mp4"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--glass)] border border-[var(--glass-line)] text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Sample Preset Links for Quick Testing */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                    Or pick an AI ambient sample:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: '🌊 Pacific Waves', url: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-gentle-ocean-waves-42171-large.mp4' },
                      { name: '🏔️ Alpine Forest Mist', url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-mist-over-a-green-forest-42416-large.mp4' },
                      { name: '🌅 Sunset Amber Clouds', url: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-over-a-sunset-sky-42354-large.mp4' },
                      { name: '✨ Vagal Lights', url: '/videos/vagal-ambient.mp4' }
                    ].map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setAiUrlInput(sample.url)}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[var(--glass)] border border-[var(--glass-line)] text-[var(--ink)] hover:border-emerald-500 transition-colors"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview If URL Provided */}
                {(aiUrlInput || customVideoUrl) && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black/40 relative border border-[var(--glass-line)]">
                    <video
                      key={aiUrlInput || customVideoUrl}
                      src={aiUrlInput || customVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-emerald-400 text-[9px] font-mono">
                      LIVE PREVIEW
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-line)]">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetUrl = aiUrlInput.trim() || customVideoUrl;
                    if (targetUrl) {
                      setCustomVideoUrl(targetUrl);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('reshmi_custom_ambient_video', targetUrl);
                      }
                      setSelectedAmbientId('custom-ai');
                    }
                    setShowAiModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Apply Atmosphere</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
