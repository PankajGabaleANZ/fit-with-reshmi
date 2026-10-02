import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, Play, Square, RotateCcw, AlertTriangle, CheckCircle2, 
  Wind, Activity, ArrowRight, HelpCircle, Sparkles, Heart, 
  Info, Flame, ShieldAlert, Zap, ArrowDown
} from 'lucide-react';

interface BoltScoreCalcProps {
  onSelectPreset?: (presetIndex: number) => void;
  onTransferToVagal?: (holdSeconds: number) => void;
}

interface BoltTier {
  range: string;
  name: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  summary: string;
  physiologicalStatus: string;
  symptoms: string[];
  recommendedPresetIndex: number;
  recommendedPresetName: string;
  actionProtocol: string;
}

const BOLT_TIERS: { [key: string]: BoltTier } = {
  severe: {
    range: '< 10 Seconds',
    name: 'Severe Functional Limitation / Sympathetic Overdrive',
    badgeColor: 'bg-red-500/10 text-red-700 dark:text-red-400',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-400/40',
    summary: 'Extreme carbon dioxide hypersensitivity. The brain triggers an emergency breath urge almost immediately, indicating chronic unconscious over-breathing.',
    physiologicalStatus: 'High sympathetic fight-or-flight dominance, chronic hypocapnia (low arterial CO₂), poor cellular oxygen delivery via the Bohr effect, constricted airways and blood vessels.',
    symptoms: [
      'Frequent unconscious mouth breathing or heavy sighing',
      'Habitual loud snoring, dry mouth upon waking, or sleep fragmentation',
      'Rapid shortness of breath during low-intensity stair climbs or walking',
      'Cold hands and feet due to peripheral vasoconstriction'
    ],
    recommendedPresetIndex: 2, // Coherent Metabolism Harmony (5-5)
    recommendedPresetName: 'Coherent Metabolism Harmony (5-5)',
    actionProtocol: 'Gentle, continuous nasal-only breathing throughout the day and night. Practice 10 minutes of gentle Coherent (5-5) breathing twice daily to recalibrate brainstem chemoreceptors.'
  },
  compromised: {
    range: '10 – 19 Seconds',
    name: 'Compromised CO₂ Tolerance / Moderate Limitation',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400/40',
    summary: 'Suboptimal respiratory efficiency. You likely over-breathe when experiencing cognitive stress or physical exertion.',
    physiologicalStatus: 'Moderate CO₂ sensitivity. Tissues receive adequate oxygen at rest, but acute stress triggers hyperventilation and lactic acid accumulation.',
    symptoms: [
      'Occasional nocturnal breathing interruptions or morning grogginess',
      'Noticeable breathlessness when engaging in brisk cardiovascular activities',
      'Tendency to breathe into the upper chest rather than the diaphragm during work',
      'Periodic afternoon brain fog and fatigue'
    ],
    recommendedPresetIndex: 0, // Box Breathing (Navy SEALs)
    recommendedPresetName: 'Box Breathing (Navy SEALs)',
    actionProtocol: 'Integrate Box Breathing (4-4-4-4) for 5–10 minutes before meals and high-focus tasks. Focus on strictly nasal breathing during zone 2 physical activity.'
  },
  baseline: {
    range: '20 – 29 Seconds',
    name: 'Functional Baseline Breathing',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-400/40',
    summary: 'Satisfactory functional respiratory health. Your arterial blood-gas exchange is well-balanced for typical daily demands.',
    physiologicalStatus: 'Healthy baseline CO₂ tolerance. Your diaphragm engages naturally, and nasal nitric oxide is adequately delivered to your bronchial tree.',
    symptoms: [
      'Clear nasal passages most of the day with rare mouth breathing',
      'Stable daytime energy with minimal unexpected shortness of breath',
      'Moderate athletic recovery and balanced autonomic responsiveness'
    ],
    recommendedPresetIndex: 1, // Rest & Relieve (4-7-8)
    recommendedPresetName: 'Rest & Relieve Protocol (4-7-8)',
    actionProtocol: 'Expand your CO₂ capacity toward the optimal 30-40 second range by practicing extended exhalations (4-7-8 Protocol) before bed and maintaining nasal breathing during light jogs.'
  },
  optimal: {
    range: '30 – 39 Seconds',
    name: 'Optimal Functional Breathing & High Aerobic Economy',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-400/40',
    summary: 'Superior physiological efficiency. Tissues and brain cells receive maximum oxygen liberation via the Bohr effect.',
    physiologicalStatus: 'High CO₂ tolerance and exceptional parasympathetic elasticity. Low resting heart rate, high Heart Rate Variability (HRV), and minimal exercise-induced fatigue.',
    symptoms: [
      'Deep, silent, invisible breathing patterns at rest',
      'Deep, unfragmented restorative sleep and refreshed morning vitality',
      'Excellent cardiovascular endurance and fast post-exercise heart rate recovery',
      'High baseline psychological stress resilience'
    ],
    recommendedPresetIndex: 1, // Rest & Relieve (4-7-8)
    recommendedPresetName: 'Rest & Relieve Protocol (4-7-8)',
    actionProtocol: 'Sustain your pristine respiratory volume. Incorporate contrast breathwork or hypoxic breath-holds during structured warmups to challenge metabolic limits.'
  },
  elite: {
    range: '40+ Seconds',
    name: 'Elite Olympic-Grade Respiratory Health',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-400/40',
    summary: 'World-class oxygen economy. Matches the physiological conditioning of elite endurance athletes and free-divers.',
    physiologicalStatus: 'Flawless chemoreceptor adaptation. Maximal aerobic capacity, supreme mitochondrial efficiency, and robust vagal nerve signaling.',
    symptoms: [
      'Total physiological calm even under high cognitive or metabolic load',
      'Peak VO₂ max efficiency and effortless diaphragmatic breathing'
    ],
    recommendedPresetIndex: 3, // Soma Quick Energizer
    recommendedPresetName: 'Soma Quick Energizer',
    actionProtocol: 'Maintain your gold-standard respiratory mechanics with high-contrast breath training such as the Soma Quick Energizer.'
  }
};

export default function BoltScoreCalc({ onSelectPreset, onTransferToVagal }: BoltScoreCalcProps) {
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'stopwatch' | 'manual'>('stopwatch');
  const [showGuide, setShowGuide] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Keyboard shortcut: Spacebar to toggle stopwatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputMode !== 'stopwatch') return;
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isTimerRunning) {
          stopTimer();
        } else if (!finalScore) {
          startTimer();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimerRunning, inputMode, finalScore]);

  const startTimer = () => {
    setFinalScore(null);
    setElapsedMs(0);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 50);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const finalSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 100) / 10);
    setIsTimerRunning(false);
    setFinalScore(finalSeconds);
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setElapsedMs(0);
    setFinalScore(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualInput);
    if (!isNaN(val) && val > 0) {
      setFinalScore(Math.round(val * 10) / 10);
    }
  };

  // Determine Tier
  const getTier = (score: number): BoltTier => {
    if (score < 10) return BOLT_TIERS.severe;
    if (score < 20) return BOLT_TIERS.compromised;
    if (score < 30) return BOLT_TIERS.baseline;
    if (score < 40) return BOLT_TIERS.optimal;
    return BOLT_TIERS.elite;
  };

  const activeTier = finalScore !== null ? getTier(finalScore) : null;

  return (
    <div id="bolt-diagnostic" className="w-full bg-mashiro border border-sakura rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sakura/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sakura pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sakura/50 border border-momo/20 text-momo text-xs font-bold uppercase tracking-widest mb-3">
            <Timer size={14} className="text-momo" />
            <span>Clinical Respiratory Biomarker</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-momo tracking-tight">
            BOLT Score Diagnostic
          </h2>
          <p className="text-momo text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            The <strong>Body Oxygen Level Test (BOLT)</strong> measures functional CO₂ tolerance, aerobic breathing efficiency, and true cellular oxygen delivery via the Bohr Effect.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-1 bg-sakura/30 border border-sakura p-1 rounded-full self-start md:self-center">
          <button
            type="button"
            onClick={() => { setInputMode('stopwatch'); resetTimer(); }}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              inputMode === 'stopwatch'
                ? 'bg-momo text-mashiro shadow-md'
                : 'text-momo hover:bg-sakura/40'
            }`}
          >
            Live Stopwatch
          </button>
          <button
            type="button"
            onClick={() => { setInputMode('manual'); resetTimer(); }}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              inputMode === 'manual'
                ? 'bg-momo text-mashiro shadow-md'
                : 'text-momo hover:bg-sakura/40'
            }`}
          >
            Enter Seconds
          </button>
        </div>
      </div>

      {/* Prominent Step-by-Step Instructions Banner */}
      <div className="bg-sakura/25 border-2 border-sakura/70 rounded-3xl p-6 sm:p-8 mb-8 relative">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-momo text-mashiro flex items-center justify-center font-bold text-sm shadow-sm">
              <Info size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-momo">
                How to Accurately Perform the BOLT Test
              </h3>
              <p className="text-xs text-momo font-semibold">
                Follow these 4 scientific steps for an accurate, repeatable measurement
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-bold text-momo underline uppercase tracking-wider hover:opacity-80 transition-opacity hidden sm:block"
          >
            {showGuide ? 'Hide Physiology Details' : 'Why Does BOLT Matter?'}
          </button>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-mashiro border border-momo/20 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-sakura text-momo font-bold text-xs flex items-center justify-center">1</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Normal Inhale</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Take a calm, silent, gentle breath in through your nose (2–3 seconds). <strong>Do not take a deep breath.</strong>
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-sakura text-momo font-bold text-xs flex items-center justify-center">2</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Normal Exhale</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Allow a normal, silent breath out through your nose. <strong>Do not force air out; leave your natural resting volume.</strong>
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-sakura text-momo font-bold text-xs flex items-center justify-center">3</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Pinch & Start</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Pinch your nostrils with your fingers to prevent air entry and tap <strong>"Start BOLT Timer"</strong> below.
            </p>
          </div>

          <div className="bg-mashiro border border-momo/20 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-momo text-mashiro font-bold text-xs flex items-center justify-center">4</span>
              <span className="text-xs font-bold uppercase tracking-wider text-momo">Stop at First Urge</span>
            </div>
            <p className="text-xs text-momo font-medium leading-relaxed">
              Stop the timer at the <strong>first definite desire to breathe</strong> or first involuntary diaphragm flutter.
            </p>
          </div>
        </div>

        {/* The Golden Rule Callout Banner (Crucial for test accuracy) */}
        <div className="bg-momo/15 border-l-4 border-momo rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-momo shrink-0 mt-0.5" size={20} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-momo block mb-0.5">
              The Golden Rule: This is NOT a breath-holding contest!
            </span>
            <p className="text-xs text-momo font-medium leading-relaxed">
              When you release your nose, <strong>your first breath in must be completely calm and normal through your nose</strong>. If you gasp, swallow forcefully, or take a deep gulp of air, you held your breath too long and your score is invalid.
            </p>
          </div>
        </div>

        {/* Expandable Physiology Details */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-sakura overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-momo font-medium">
                <div className="bg-mashiro border border-momo/20 p-3 rounded-xl">
                  <span className="font-bold text-momo block mb-1">1. The Bohr Effect</span>
                  Carbon dioxide is not merely a waste gas—it is the chemical key that triggers hemoglobin to release oxygen to working muscles, the heart, and the brain.
                </div>
                <div className="bg-mashiro border border-momo/20 p-3 rounded-xl">
                  <span className="font-bold text-momo block mb-1">2. Airway & Sleep Quality</span>
                  A BOLT score below 20 seconds strongly correlates with nighttime airway collapse, snoring, mouth breathing, and compromised deep REM sleep.
                </div>
                <div className="bg-mashiro border border-momo/20 p-3 rounded-xl">
                  <span className="font-bold text-momo block mb-1">3. Vagal & Cortisol Modulation</span>
                  Higher CO₂ tolerance calms the respiratory center in the brainstem, keeping your autonomic nervous system firmly in the parasympathetic restorative state.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Testing Interactive Area */}
      <div className="mb-10">
        {inputMode === 'stopwatch' ? (
          <div className="bg-sakura/10 border border-sakura rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Live Timer Display */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-momo block mb-2">
                {isTimerRunning ? 'Measuring First Physiological Urge...' : finalScore ? 'Recorded BOLT Score' : 'Ready to Time'}
              </span>
              <div className="text-6xl sm:text-8xl font-serif font-bold text-momo tracking-tight font-mono">
                {isTimerRunning ? (elapsedMs / 1000).toFixed(1) : finalScore ? finalScore.toFixed(1) : '0.0'}
                <span className="text-2xl sm:text-4xl text-momo/70 font-sans ml-1">s</span>
              </div>
              <p className="text-xs text-momo mt-2 font-medium">
                {isTimerRunning ? (
                  <span className="inline-flex items-center gap-1.5 text-momo font-bold animate-pulse">
                    <Wind size={14} /> Normal breath out... Pinch nose... Stop at first urge!
                  </span>
                ) : (
                  <span>Tip: You can also tap the Spacebar on desktop to Start and Stop</span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {!isTimerRunning ? (
                <>
                  <button
                    type="button"
                    onClick={startTimer}
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-momo text-mashiro font-bold text-sm uppercase tracking-wider hover:bg-momo/90 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>{finalScore ? 'Retest BOLT Score' : 'Start BOLT Timer'}</span>
                  </button>
                  {finalScore !== null && (
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-full border border-momo/40 bg-mashiro text-momo font-bold text-xs uppercase tracking-wider hover:bg-sakura/30 transition-all cursor-pointer shadow-sm"
                    >
                      <RotateCcw size={16} />
                      <span>Reset</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={stopTimer}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-red-600 text-white font-bold text-base uppercase tracking-wider animate-pulse hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
                >
                  <Square size={20} fill="currentColor" />
                  <span>Tap At First Urge To Breathe</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Manual Input Mode */
          <div className="bg-sakura/10 border border-sakura rounded-3xl p-6 sm:p-10 max-w-xl mx-auto">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <label className="block text-sm font-bold text-momo uppercase tracking-wider">
                Enter Measured BOLT Score (Seconds)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="120"
                  required
                  placeholder="e.g. 18"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 bg-mashiro border border-sakura rounded-2xl p-4 text-xl font-bold text-momo focus:border-momo outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-momo text-mashiro rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-momo/90 transition-all hover:scale-105"
                >
                  Analyze
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-[11px] text-momo font-bold uppercase tracking-wider">Quick Presets:</span>
                {[8, 14, 22, 32, 42].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setManualInput(s.toString()); setFinalScore(s); }}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-mashiro border border-momo/30 text-momo hover:bg-momo hover:text-mashiro transition-colors"
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {activeTier && finalScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-sakura pt-8"
          >
            {/* Score Summary Card */}
            <div className={`border ${activeTier.borderColor} bg-mashiro rounded-3xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sakura/60 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${activeTier.badgeColor}`}>
                      {activeTier.range}
                    </span>
                    <span className="text-xs text-momo font-bold uppercase tracking-wider">
                      Validated Result: {finalScore} seconds
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-momo">
                    {activeTier.name}
                  </h3>
                  <p className="text-sm text-momo mt-2 max-w-2xl font-medium leading-relaxed">
                    {activeTier.summary}
                  </p>
                </div>

                {/* Score Big Display */}
                <div className="bg-sakura/30 border border-momo/20 p-6 rounded-2xl text-center min-w-[140px] self-stretch md:self-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-momo block">BOLT Score</span>
                  <div className="text-4xl font-serif font-bold text-momo mt-1">
                    {finalScore}<span className="text-lg text-momo font-sans ml-0.5">s</span>
                  </div>
                  <span className="text-[10px] text-momo font-bold block mt-1">
                    {finalScore >= 30 ? 'Target Achieved' : `Goal: 30–40s`}
                  </span>
                </div>
              </div>

              {/* Physiological Analysis & Clinical Observations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-momo uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity size={15} className="text-momo" /> Physiological Dynamics
                  </h4>
                  <p className="text-xs text-momo font-medium leading-relaxed mb-4">
                    {activeTier.physiologicalStatus}
                  </p>
                  <div className="text-[11px] font-bold text-momo uppercase tracking-wider mb-2">Common Correlating Patterns:</div>
                  <ul className="space-y-1.5">
                    {activeTier.symptoms.map((symptom, idx) => (
                      <li key={idx} className="text-xs text-momo flex items-start gap-2 font-medium">
                        <span className="text-momo font-bold mt-0.5">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-mashiro border border-momo/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-momo uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={15} className="text-momo" /> Recommended Breathwork Protocol
                    </h4>
                    <div className="bg-sakura/20 border border-momo/20 p-4 rounded-xl mb-4">
                      <div className="text-xs font-bold text-momo">{activeTier.recommendedPresetName}</div>
                      <p className="text-xs text-momo font-medium mt-1 leading-relaxed">
                        {activeTier.actionProtocol}
                      </p>
                    </div>
                  </div>

                  {onSelectPreset && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(activeTier.recommendedPresetIndex);
                        const el = document.getElementById('breath-pacer-top');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-momo text-mashiro rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-momo/90 transition-all hover:scale-[1.02] cursor-pointer shadow-md"
                    >
                      <span>Practice {activeTier.recommendedPresetName} Above</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Cross-Link to Vagal Tone Assessment */}
              <div className="bg-sakura/30 border border-momo/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-momo text-mashiro flex items-center justify-center font-bold text-sm shrink-0">
                    <Heart size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-momo">
                      Transfer BOLT Score to Vagal Tone Assessment
                    </div>
                    <p className="text-xs text-momo font-medium">
                      Use your {finalScore}s CO₂ tolerance directly in the autonomic nervous system diagnostic below.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onTransferToVagal) onTransferToVagal(finalScore);
                    const el = document.getElementById('vagal-check');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-momo text-mashiro rounded-full text-xs font-bold uppercase tracking-wider hover:bg-momo/90 transition-all hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Apply & Jump to Vagal Tone</span>
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
