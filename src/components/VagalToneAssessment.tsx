import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Activity, Wind, Sparkles, AlertCircle, CheckCircle2, 
  HelpCircle, ArrowRight, RotateCcw, Clock, ShieldCheck, 
  Brain, Utensils, Zap, ChevronDown, ChevronUp, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface VagalToneAssessmentProps {
  externalHoldSeconds?: number | null;
  onSelectPreset?: (presetIndex: number) => void;
}

interface AssessmentResult {
  score: number;
  level: string;
  autonomicClass: 'optimal' | 'moderate' | 'sympathetic';
  hrvStatus: string;
  digestionImpact: string;
  metabolicImpact: string;
  recommendations: string[];
  dietaryCoFactors: string[];
  recommendedPresetIndex: number;
  recommendedPresetName: string;
}

export default function VagalToneAssessment({ 
  externalHoldSeconds, 
  onSelectPreset 
}: VagalToneAssessmentProps) {
  // Assessment Inputs
  const [holdTimeInput, setHoldTimeInput] = useState('');
  const [breathsPerMin, setBreathsPerMin] = useState('14');
  const [energyLevel, setEnergyLevel] = useState('5');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // 60-Second Real-Time Breath Counter Helper Modal/Tool
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterSecondsLeft, setCounterSecondsLeft] = useState(60);
  const [isCountingRunning, setIsCountingRunning] = useState(false);
  const [countedBreaths, setCountedBreaths] = useState(0);
  const counterTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external hold seconds from BOLT test if user clicks import or updates
  useEffect(() => {
    if (externalHoldSeconds && externalHoldSeconds > 0) {
      setHoldTimeInput(externalHoldSeconds.toString());
    }
  }, [externalHoldSeconds]);

  // Clean up counter timer
  useEffect(() => {
    return () => {
      if (counterTimerRef.current) clearInterval(counterTimerRef.current);
    };
  }, []);

  const startBreathCounter = () => {
    setCounterSecondsLeft(60);
    setCountedBreaths(0);
    setIsCountingRunning(true);

    if (counterTimerRef.current) clearInterval(counterTimerRef.current);
    counterTimerRef.current = setInterval(() => {
      setCounterSecondsLeft((prev) => {
        if (prev <= 1) {
          if (counterTimerRef.current) clearInterval(counterTimerRef.current);
          setIsCountingRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const registerBreathTap = () => {
    if (!isCountingRunning && counterSecondsLeft === 60) {
      startBreathCounter();
    }
    if (isCountingRunning || counterSecondsLeft > 0) {
      setCountedBreaths((c) => c + 1);
    }
  };

  const applyBreathCount = () => {
    // Map counted breaths to the select option or closest value
    let bpm = countedBreaths;
    if (counterSecondsLeft > 0 && counterSecondsLeft < 60) {
      // Extrapolate if user stopped early after at least 30s
      const elapsed = 60 - counterSecondsLeft;
      if (elapsed >= 20) {
        bpm = Math.round((countedBreaths / elapsed) * 60);
      }
    }
    
    if (bpm <= 6) setBreathsPerMin('6');
    else if (bpm <= 10) setBreathsPerMin('10');
    else if (bpm <= 14) setBreathsPerMin('14');
    else if (bpm <= 18) setBreathsPerMin('18');
    else setBreathsPerMin('22');

    setIsCounterOpen(false);
    if (counterTimerRef.current) clearInterval(counterTimerRef.current);
    setIsCountingRunning(false);
  };

  // Process Diagnostic
  const processAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const holdSecs = parseFloat(holdTimeInput) || 0;
    const rateBpm = parseInt(breathsPerMin) || 14;
    const energy = parseInt(energyLevel) || 5;

    // Standard scientific scoring model (0 - 100)
    let score = 0;
    
    // 1. CO2 tolerance / BOLT component (Max 40 pts)
    if (holdSecs >= 40) score += 40;
    else if (holdSecs >= 30) score += 34;
    else if (holdSecs >= 20) score += 26;
    else if (holdSecs >= 12) score += 18;
    else score += 10;

    // 2. Resting Respiration Rate (Max 35 pts)
    if (rateBpm <= 6) score += 35;
    else if (rateBpm <= 10) score += 30;
    else if (rateBpm <= 14) score += 22;
    else if (rateBpm <= 18) score += 14;
    else score += 6;

    // 3. Subjective Restorative Vitality (Max 25 pts)
    if (energy >= 8) score += 25;
    else if (energy >= 6) score += 18;
    else if (energy >= 4) score += 12;
    else score += 6;

    let level = 'Moderate Vagal Tone';
    let autonomicClass: 'optimal' | 'moderate' | 'sympathetic' = 'moderate';
    let hrvStatus = 'Balanced Heart Rate Variability with moderate post-stress rebound speed.';
    let digestionImpact = 'Sufficient gastric acid secretion; mild sensitivity to stress-induced bloating or erratic motility.';
    let metabolicImpact = 'Normal baseline insulin sensitivity; acute emotional spikes may elevate cortisol-driven blood sugar.';
    let recommendedPresetIndex = 1; // 4-7-8
    let recommendedPresetName = 'The Rest & Relieve Protocol (4-7-8)';

    let recommendations = [
      'Practice 10 minutes of Coherent Breathing (5-5 cadence) daily upon waking to calibrate your heart-brain rhythm.',
      'Incorporate 4-7-8 extended exhalations before your largest meal to activate parasympathetic digestive enzymes.',
      'Avoid high-stress multi-tasking while eating; chew slowly to stimulate glossopharyngeal and vagus nerve branches.'
    ];

    let dietaryCoFactors = [
      'Magnesium Glycinate (300-400mg) at night to support GABA transmission and neural calming.',
      'Wild cold-water fish or algae Omega-3 (high EPA/DHA) to nourish the myelin sheaths of the vagus nerve.',
      'Polyphenol-rich berries, leafy greens, and prebiotic artichoke to fuel gut microbiome neurotransmitter synthesis.'
    ];

    if (score >= 78) {
      level = 'Optimal Parasympathetic Elasticity';
      autonomicClass = 'optimal';
      hrvStatus = 'Superior Heart Rate Variability (HRV). High vagal brake capacity quickly lowers heart rate within seconds of exhalation.';
      digestionImpact = 'Robust digestive resilience. Optimal stomach acid (HCl) production and smooth intestinal peristalsis.';
      metabolicImpact = 'Stable glycogen and cortisol curves. High cellular insulin sensitivity and rapid recovery from physical exertion.';
      recommendedPresetIndex = 0; // Box Breathing
      recommendedPresetName = 'Box Breathing (Navy SEALs)';
      recommendations = [
        'Maintain nervous system tone with Box Breathing (4-4-4-4) as a high-focus mental workout before demanding presentations.',
        'Experiment with cold facial plunges or contrast showers to further heighten vagal nerve plasticity.',
        'Sustain intermittent high-fiber prebiotic protocols to keep gut-brain neurochemical signalling at peak performance.'
      ];
      dietaryCoFactors = [
        'Diverse prebiotic fibers (inulin, resistant starch, flaxseeds) to sustain robust short-chain fatty acid (SCFA) levels.',
        'Electrolyte optimization (potassium, sodium, magnesium) for nerve transmission efficiency.',
        'Adaptogenic herbs like Ashwagandha or Holy Basil (Tulsi) for sustaining high autonomic reserve.'
      ];
    } else if (score < 52) {
      level = 'Vagal Tone De-conditioning (Sympathetic Dominance)';
      autonomicClass = 'sympathetic';
      hrvStatus = 'Suppressed Heart Rate Variability. Nervous system is locked in chronic low-grade fight-or-flight overdrive.';
      digestionImpact = 'Compromised digestive fire. Stress redirects blood flow away from the gut, frequently causing sluggish digestion, reflux, or dysbiosis.';
      metabolicImpact = 'Persistent sympathetic signalling causes adrenal cortisol dumps, driving stubborn visceral fat retention and sugar cravings.';
      recommendedPresetIndex = 2; // Coherent Metabolism Harmony
      recommendedPresetName = 'Coherent Metabolism Harmony (5-5)';
      recommendations = [
        'Daily mandatory 10–15 minutes of slow Coherent (5-5) breathing before breakfast and before sleep.',
        'Strictly switch to 100% nasal breathing during sleep and daily computer work to prevent chronic hyperventilation.',
        'Schedule a 1-on-1 functional nutrition consultation with Reshmi to identify underlying gut permeability and cortisol triggers.'
      ];
      dietaryCoFactors = [
        'L-Theanine and Phosphatidylserine to buffer acute evening cortisol spikes and quiet adrenal over-activation.',
        'Warm bone broth or collagen with glutamine to soothe the gut mucosal lining and strengthen vagus receptor sensitivity.',
        'Eliminate refined seed oils and ultra-processed carbohydrates that inflame vagus nerve endings.'
      ];
    }

    setAssessmentResult({
      score,
      level,
      autonomicClass,
      hrvStatus,
      digestionImpact,
      metabolicImpact,
      recommendations,
      dietaryCoFactors,
      recommendedPresetIndex,
      recommendedPresetName
    });
  };

  return (
    <div id="vagal-check" className="w-full bg-sakura/10 border-2 border-sakura rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sakura border border-momo/20 text-momo text-xs font-bold uppercase tracking-widest mb-3">
          <Activity size={14} />
          <span>Autonomic Nervous System Diagnostic</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-momo tracking-tight mb-3">
          Vagal Tone Auto-Assessment
        </h2>
        <p className="text-momo text-sm sm:text-base font-normal leading-relaxed">
          Evaluates the functional elasticity of your <strong>Vagus Nerve (Cranial Nerve X)</strong>—your body's prime neurological brake that slows rapid heart rates, restores deep sleep, optimizes digestive enzymes, and quenches inflammatory cortisol spikes.
        </p>
      </div>

      {/* Prominent, Unmissable Step-by-Step Instructions Banner */}
      <div className="bg-mashiro border-2 border-momo/30 rounded-3xl p-6 sm:p-8 mb-10 shadow-md">
        <div className="flex items-center gap-3 border-b border-sakura pb-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-momo text-mashiro flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-momo">
              Testing Instructions & Preparation Protocol
            </h3>
            <p className="text-xs text-momo font-semibold">
              Read these 4 simple clinical steps before entering your biomarker data below
            </p>
          </div>
        </div>

        {/* 4 Clear Step Cards with High-Contrast Typography */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-momo text-mashiro font-bold text-xs flex items-center justify-center">1</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Rest 2 Minutes</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Sit upright with your feet flat on the floor in a quiet space. Do not test immediately after intense exercise or caffeinated beverages.
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-momo text-mashiro font-bold text-xs flex items-center justify-center">2</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Measure Breaths / Min</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Count how many natural breath cycles (Inhale + Exhale = 1 breath) you take in 60 seconds without consciously slowing down.
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-momo text-mashiro font-bold text-xs flex items-center justify-center">3</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">CO₂ Tolerance (BOLT)</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Record your post-exhale breath-hold duration before the first urge to breathe, or click <strong>"Import BOLT Score"</strong> from above.
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-momo text-mashiro font-bold text-xs flex items-center justify-center">4</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Restorative Vitality</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Rate your current baseline energy, morning wakefulness, and digestive ease on the 1–10 autonomic slider.
            </p>
          </div>
        </div>

        {/* Why Vagal Tone Matters Callout */}
        <div className="bg-sakura/40 border border-momo/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-momo">
          <div className="flex items-center gap-2 font-medium">
            <Brain size={16} className="text-momo shrink-0" />
            <span>
              <strong>Clinical Insight:</strong> The vagus nerve controls 75% of all parasympathetic nerve fibers in the human body, directing gastric juices, heart deceleration, and metabolic repair.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCounterOpen(!isCounterOpen)}
            className="text-xs font-bold uppercase tracking-wider text-momo bg-mashiro border border-sakura px-4 py-2 rounded-full hover:bg-sakura transition-all shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Clock size={14} />
            <span>Need Help Counting Breaths?</span>
          </button>
        </div>

        {/* 60-Second Real-Time Breath Counter Tool */}
        <AnimatePresence>
          {isCounterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-sakura overflow-hidden"
            >
              <div className="bg-sakura/30 border border-sakura p-5 rounded-2xl text-center">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-momo flex items-center gap-1.5">
                    <Clock size={14} /> 60-Second Live Breath Counter
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCounterOpen(false)}
                    className="text-xs text-momo hover:underline font-bold"
                  >
                    Close Tool
                  </button>
                </div>
                <p className="text-xs text-momo font-medium mb-4 max-w-xl mx-auto">
                  Breathe normally. Each time you finish an exhale, tap the button below. The tool will calculate your exact resting breaths per minute.
                </p>

                <div className="flex items-center justify-center gap-6 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-momo tracking-wider block">Time Remaining</span>
                    <div className="text-3xl font-serif font-bold text-momo font-mono">{counterSecondsLeft}s</div>
                  </div>
                  <div className="h-10 w-px bg-sakura"></div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-momo tracking-wider block">Breaths Counted</span>
                    <div className="text-3xl font-serif font-bold text-momo font-mono">{countedBreaths}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={registerBreathTap}
                    className="px-6 py-3 bg-momo text-mashiro rounded-full text-xs font-bold uppercase tracking-wider hover:bg-momo/90 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {isCountingRunning ? 'Tap on Each Exhale' : 'Start & Tap on Exhale'}
                  </button>

                  {countedBreaths > 0 && (
                    <button
                      type="button"
                      onClick={applyBreathCount}
                      className="px-5 py-3 bg-sakura text-momo rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sakura/80 transition-all cursor-pointer shadow-sm"
                    >
                      Apply To Form ({countedBreaths} bpm)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (counterTimerRef.current) clearInterval(counterTimerRef.current);
                      setIsCountingRunning(false);
                      setCounterSecondsLeft(60);
                      setCountedBreaths(0);
                    }}
                    className="p-3 text-momo hover:bg-sakura/50 rounded-full transition-all cursor-pointer"
                    title="Reset Counter"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form or Results */}
      {!assessmentResult ? (
        <form onSubmit={processAssessment} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input 1: CO2 Tolerance Hold Time */}
            <div className="bg-mashiro border border-momo/20 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-bold text-momo uppercase tracking-wider">
                    CO₂ Tolerance Hold Time
                  </label>
                  {externalHoldSeconds && (
                    <button
                      type="button"
                      onClick={() => setHoldTimeInput(externalHoldSeconds.toString())}
                      className="text-[10px] font-bold uppercase tracking-wider bg-momo text-mashiro px-2.5 py-0.5 rounded-full hover:bg-momo/80 transition-colors shadow-sm"
                      title="Use BOLT Score from above"
                    >
                      Use BOLT ({externalHoldSeconds}s)
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="1"
                    max="180"
                    required
                    placeholder="e.g. 24" 
                    value={holdTimeInput}
                    onChange={(e) => setHoldTimeInput(e.target.value)}
                    className="w-full bg-mashiro border border-momo/30 rounded-2xl p-4 text-xl font-bold text-momo focus:border-momo outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-momo font-bold">
                    seconds
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sakura">
                <span className="text-xs text-momo block leading-relaxed font-medium">
                  Hold time following a calm, normal exhalation until the <strong>first involuntary urge to breathe</strong>. (Matches your BOLT score).
                </span>
              </div>
            </div>

            {/* Input 2: Respiration Rate */}
            <div className="bg-mashiro border border-momo/20 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-momo uppercase tracking-wider mb-2">
                  Resting Respiration Rate
                </label>
                <select 
                  value={breathsPerMin}
                  onChange={(e) => setBreathsPerMin(e.target.value)}
                  className="w-full bg-mashiro border border-momo/30 rounded-2xl p-4 text-sm font-bold text-momo focus:border-momo outline-none transition-colors"
                >
                  <option value="6">4–6 bpm (Super-Coherent / Resonant)</option>
                  <option value="10">7–10 bpm (Deep Restorative Baseline)</option>
                  <option value="14">11–14 bpm (Standard Resting Adult)</option>
                  <option value="18">15–18 bpm (Mild Sympathetic Overdrive)</option>
                  <option value="22">19+ bpm (Rapid / Shallow Hyper-drive)</option>
                </select>
              </div>

              <div className="mt-4 pt-3 border-t border-sakura">
                <span className="text-xs text-momo block leading-relaxed font-medium">
                  Your typical breath cycles per minute when quietly resting at a desk without talking or moving.
                </span>
              </div>
            </div>

            {/* Input 3: Restorative Energy Level */}
            <div className="bg-mashiro border border-momo/20 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-momo uppercase tracking-wider">
                    Restorative Vitality & Sleep
                  </label>
                  <span className="text-sm font-bold text-momo bg-sakura px-2.5 py-0.5 rounded-full border border-momo/20">
                    {energyLevel} / 10
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full h-8 accent-momo bg-sakura/50 rounded-lg cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-momo font-bold uppercase tracking-wider mt-1">
                  <span>1: Burnout/Exhausted</span>
                  <span>10: Vibrant/Deep Rest</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sakura">
                <span className="text-xs text-momo block leading-relaxed font-medium">
                  Reflects morning refreshedness, afternoon stamina, and resilience against stress-induced acid reflux or palpitations.
                </span>
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <div className="text-center pt-2">
            <button 
              type="submit"
              className="px-12 py-5 bg-momo text-mashiro rounded-full text-xs font-bold uppercase tracking-widest hover:bg-momo/90 transition-all hover:scale-105 shadow-xl cursor-pointer"
            >
              Analyze My Vagal Tone & Biomarkers
            </button>
          </div>
        </form>
      ) : (
        /* Comprehensive Diagnostic Results */
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-mashiro border-2 border-sakura p-6 sm:p-10 rounded-3xl shadow-lg"
        >
          {/* Header Score Rating */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-sakura pb-6 mb-8 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                  assessmentResult.autonomicClass === 'optimal'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : assessmentResult.autonomicClass === 'moderate'
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}>
                  {assessmentResult.level}
                </span>
                <span className="text-xs text-momo font-bold uppercase tracking-wider">
                  Autonomic Profile
                </span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-momo">
                {assessmentResult.level}
              </h3>
            </div>

            <div className="bg-sakura/30 border border-momo/20 px-8 py-5 rounded-2xl text-center self-stretch md:self-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-momo tracking-widest block">
                Parasympathetic Elasticity
              </span>
              <div className="text-4xl sm:text-5xl font-serif font-bold text-momo mt-1">
                {assessmentResult.score} <span className="text-sm text-momo font-sans">/100</span>
              </div>
              <span className="text-[10px] text-momo font-bold block mt-1">
                {assessmentResult.score >= 78 ? 'Optimal Vagal Power' : assessmentResult.score >= 52 ? 'Balanced Baseline' : 'Sympathetic Dominance'}
              </span>
            </div>
          </div>

          {/* Organ-System Physiological Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-momo">
                <Heart size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Heart Rate Variability (HRV)</h4>
              </div>
              <p className="text-xs text-momo font-medium leading-relaxed">
                {assessmentResult.hrvStatus}
              </p>
            </div>

            <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-momo">
                <Utensils size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Gut-Brain & Digestion Axis</h4>
              </div>
              <p className="text-xs text-momo font-medium leading-relaxed">
                {assessmentResult.digestionImpact}
              </p>
            </div>

            <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-momo">
                <Zap size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Metabolic & Cortisol Curve</h4>
              </div>
              <p className="text-xs text-momo font-medium leading-relaxed">
                {assessmentResult.metabolicImpact}
              </p>
            </div>
          </div>

          {/* Recommended Protocols & Dietary Co-Factors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Breath Protocols */}
            <div className="bg-mashiro border border-momo/20 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-bold text-momo uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Wind size={16} className="text-momo" /> Prescribed Neuromodulation Breathwork
                </h4>
                <div className="bg-sakura/20 border border-momo/20 p-4 rounded-xl mb-4">
                  <span className="text-xs font-bold text-momo block mb-1">
                    Primary Protocol: {assessmentResult.recommendedPresetName}
                  </span>
                  <ul className="space-y-2 mt-2">
                    {assessmentResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs font-medium text-momo leading-relaxed">
                        <span className="text-momo font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {onSelectPreset && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPreset(assessmentResult.recommendedPresetIndex);
                    const el = document.getElementById('breath-pacer-top');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 px-4 bg-momo text-mashiro rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-momo/90 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Practice {assessmentResult.recommendedPresetName} Above</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Nutrition & Supplement Co-Factors */}
            <div className="bg-mashiro border border-momo/20 p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-momo uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-momo" /> Reshmi's Nutritional Vagal Co-Factors
              </h4>
              <div className="bg-sakura/20 border border-momo/20 p-4 rounded-xl">
                <span className="text-xs font-bold text-momo block mb-2">
                  Functional Nutrient Strategy:
                </span>
                <ul className="space-y-2.5">
                  {assessmentResult.dietaryCoFactors.map((coFactor, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs font-medium text-momo leading-relaxed">
                      <span className="text-momo font-bold mt-0.5">•</span>
                      <span>{coFactor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-sakura pt-6">
            <button
              type="button"
              onClick={() => setAssessmentResult(null)}
              className="inline-flex items-center gap-2 border border-momo text-momo font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-sakura/30 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retest Vagal Biomarkers</span>
            </button>

            <Link
              to="/booking"
              className="inline-flex items-center gap-2 bg-momo text-mashiro font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-momo/90 hover:scale-105 transition-all text-center shadow-md"
            >
              <span>Book Clinical Vagal & Metabolic Consultation</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
