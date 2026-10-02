import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Activity, Info, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StopBangQuestion {
  id: string;
  char: string;
  title: string;
  question: string;
  tooltip: string;
}

const STOP_BANG_QUESTIONS: StopBangQuestion[] = [
  {
    id: 'snore',
    char: 'S',
    title: 'Snoring Loudly',
    question: 'Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?',
    tooltip: 'Loud snoring is caused by airway narrowing and vibration of lax tissues in the upper respiratory tract.'
  },
  {
    id: 'tired',
    char: 'T',
    title: 'Tired / Fatigued',
    question: 'Do you often feel tired, fatigued, or sleepy during the daytime (like falling asleep during driving or conversation)?',
    tooltip: 'Daytime fatigue indicates chronic sleep fragmentation and continuous micro-arousals during the night.'
  },
  {
    id: 'observed',
    char: 'O',
    title: 'Observed Apnea',
    question: 'Has anyone observed you stop breathing, choking, or gasping during your sleep?',
    tooltip: 'Directly points to obstructive hypopnea/apnea phases where the airway is completely occluded.'
  },
  {
    id: 'pressure',
    char: 'P',
    title: 'High Blood Pressure',
    question: 'Do you have or are you being treated for high blood pressure (hypertension)?',
    tooltip: 'Chronic nighttime hypoxia triggers sympathetic nerve surges, causing permanent blood vessel constriction.'
  },
  {
    id: 'bmi',
    char: 'B',
    title: 'Body Mass Index (>35)',
    question: 'Is your Body Mass Index (BMI) greater than 35 kg/m²?',
    tooltip: 'Excess visceral fat accumulation around neck tissues dramatically increases critical pharyngeal collapse.'
  },
  {
    id: 'age',
    char: 'A',
    title: 'Age (>50)',
    question: 'Are you older than 50 years of age?',
    tooltip: 'Natural loss of muscle tone in the upper airway dilatator muscle tissues occurs with biological aging.'
  },
  {
    id: 'neck',
    char: 'N',
    title: 'Neck Circumference',
    question: 'Is your neck circumference greater than 40 cm (16 inches) for both genders?',
    tooltip: 'A wider neck indicates direct adipose load compressing the tracheal columns during sleep relaxation.'
  },
  {
    id: 'gender',
    char: 'G',
    title: 'Gender Male',
    question: 'Are you of male biological gender?',
    tooltip: 'Testosterone enhances upper airway collapse variables, whereas estrogen offers muscle protectiveness.'
  }
];

export default function StopBangCalc() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    snore: false,
    tired: false,
    observed: false,
    pressure: false,
    bmi: false,
    age: false,
    neck: false,
    gender: false,
  });

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  const toggleAnswer = (id: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const getScore = () => {
    return Object.values(answers).filter(Boolean).length;
  };

  const score = getScore();

  // MDCalc STOP-BANG Obstructive Sleep Apnea scoring logic
  const getRiskAndRecommendation = () => {
    const isMale = answers.gender;
    const highBScore = answers.snore || answers.tired || answers.observed || answers.pressure;
    
    let risk: 'Low' | 'Intermediate' | 'High' = 'Low';
    
    if (score >= 5) {
      risk = 'High';
    } else if (score >= 3) {
      // Special high-risk criteria for lower scores (MDCalc clinical rules)
      if (
        (score === 3 || score === 4) && 
        ((answers.snore && answers.observed) || 
         (isMale && answers.snore) || 
         (answers.bmi && answers.snore))
      ) {
        risk = 'High';
      } else {
        risk = 'Intermediate';
      }
    }

    let recommendation = '';
    let protocol = '';

    if (risk === 'Low') {
      recommendation = 'Minimal statistical probability of severe obstructive events. Your upper airway muscle tone remains strong.';
      protocol = 'Maintain airway elasticity using 4-7-8 functional carbon dioxide hyper-tolerance cycles daily before bedtime.';
    } else if (risk === 'Intermediate') {
      recommendation = 'Moderate risk of biological airway collapse. Sleep fragmentation and mild intermittent blood oxygen dips are likely.';
      protocol = 'Deploy clinical biochemical alignment & active nasal expansion exercises in our Breathe Sanctuary to restore diaphragm recruitment.';
    } else {
      recommendation = 'Highly significant probability of Obstructive Sleep Apnea (OSA). Your gas exchanges are likely compromised during sleep stages.';
      protocol = 'Schedule an immediate diagnostic Dexa-composition and full metabolic diagnostic review with Reshmi to reverse visceral fat load.';
    }

    return { risk, recommendation, protocol };
  };

  const { risk, recommendation, protocol } = getRiskAndRecommendation();

  const resetCalc = () => {
    setAnswers({
      snore: false,
      tired: false,
      observed: false,
      pressure: false,
      bmi: false,
      age: false,
      neck: false,
      gender: false,
    });
  };

  return (
    <div className="w-full bg-sakura/10 border border-sakura/80 rounded-[3rem] p-6 sm:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-sakura/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-sakura/50">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sakura rounded-lg text-[10px] font-bold uppercase tracking-widest text-momo mb-2">
            <Activity size={12} className="text-momo" />
            <span>Reshmi\'s Functional Clinical Tools</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-momo tracking-tight">STOP-BANG Sleep Apnea Calculator</h3>
          <p className="text-xs sm:text-sm text-momo/70 font-light mt-1">
            Obstructive Sleep Apnea (OSA) is the prime silent disruptor of hormonal balance, fat loss efforts, and heart rate variability.
          </p>
        </div>
        <button
          onClick={resetCalc}
          className="flex items-center gap-2 px-4 py-2 bg-mashiro border border-momo/30 hover:bg-momo hover:text-mashiro text-momo rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
        >
          <RefreshCw size={12} />
          Reset Calc
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Side: 8 screening toggles */}
        <div className="col-span-1 lg:col-span-7 space-y-4">
          {STOP_BANG_QUESTIONS.map((q) => (
            <div 
              key={q.id} 
              className="group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-mashiro border border-sakura/40 hover:border-momo/30 transition-all relative"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-sakura text-momo flex items-center justify-center font-bold text-xs select-none shadow-sm">
                    {q.char}
                  </span>
                  <span className="font-serif font-extrabold text-sm text-momo">{q.title}</span>
                  <div className="relative inline-block">
                    <button
                      onMouseEnter={() => setHoveredInfo(q.id)}
                      onMouseLeave={() => setHoveredInfo(null)}
                      focus-id={`info-btn-${q.id}`}
                      className="text-momo/40 hover:text-momo/85 transition-colors"
                      type="button"
                    >
                      <Info size={14} />
                    </button>
                    <AnimatePresence>
                      {hoveredInfo === q.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-momo text-mashiro text-[10px] leading-relaxed rounded-xl shadow-xl z-30 pointer-events-none"
                        >
                          {q.tooltip}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-xs text-momo/70 font-light mt-1.5 leading-relaxed pl-9">{q.question}</p>
              </div>

              {/* Yes / No Binary Button Pair */}
              <div className="flex bg-sakura/30 p-1 rounded-xl shrink-0 self-end sm:self-auto border border-sakura/20">
                <button
                  onClick={() => toggleAnswer(q.id, false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    !answers[q.id] 
                      ? 'bg-mashiro text-momo shadow-sm' 
                      : 'text-momo/40 hover:text-momo/70'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => toggleAnswer(q.id, true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    answers[q.id] 
                      ? 'bg-momo text-mashiro shadow-sm' 
                      : 'text-momo/40 hover:text-momo/70'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Medical Diagnostics Meter */}
        <div className="col-span-1 lg:col-span-5 bg-mashiro rounded-3xl p-6 sm:p-8 border border-sakura/80 shadow-md flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-6">
            <h4 className="text-center text-xs font-black uppercase tracking-widest text-momo/50">Sleep Apnea Risk Diagnosis</h4>
            
            {/* Round Clinical Circular Meter */}
            <div className="flex flex-col items-center justify-center relative py-4">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Track Circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  className="stroke-sakura"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Score representation circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="64"
                  className={`${
                    risk === 'Low' ? 'stroke-green-500' : risk === 'Intermediate' ? 'stroke-amber-500' : 'stroke-red-500'
                  } transition-colors duration-500`}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 64}
                  animate={{
                    strokeDashoffset: (2 * Math.PI * 64) * (1 - score / 8)
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black font-serif text-momo">{score}</span>
                <span className="text-[9px] text-momo/40 font-bold tracking-widest uppercase">Score Out of 8</span>
              </div>
            </div>

            {/* Risk Category banner */}
            <div className={`p-4 rounded-2xl text-center border font-bold uppercase tracking-wider text-sm transition-colors ${
              risk === 'Low' 
                ? 'bg-green-50 border-green-500/20 text-green-700' 
                : risk === 'Intermediate' 
                ? 'bg-amber-50 border-amber-500/20 text-amber-700' 
                : 'bg-red-50 border-red-500/20 text-red-700'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {risk === 'High' && <AlertTriangle size={16} />}
                {risk === 'Low' && <CheckCircle size={16} />}
                {risk === 'Intermediate' && <Activity size={16} />}
                <span>{risk} Severity Risk</span>
              </div>
            </div>

            {/* Medical Assessment */}
            <div className="space-y-3 pt-2">
              <p className="text-xs uppercase tracking-widest font-black text-momo/40">Clinical Gaseous Profile</p>
              <p className="text-xs text-momo/85 leading-relaxed font-light bg-sakura/10 p-4 rounded-xl border border-sakura/20">
                {recommendation}
              </p>
            </div>

            {/* Reshmi's recommended protocol */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-momo animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold text-momo">Reshmi\'s Recommended Protocol</span>
              </div>
              <p className="text-xs font-medium text-momo leading-relaxed border-l-2 border-momo pl-3.5 italic">
                "{protocol}"
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/booking"
              className="flex items-center justify-center gap-2 w-full py-4 bg-momo text-mashiro font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-momo/95 duration-500 shadow-md"
            >
              <span>Consult with Reshmi</span>
              <Activity size={14} />
            </Link>
            <p className="text-[10px] text-center text-momo/40 mt-3 italic font-light">
              *Designed as premium functional pre-screening utility in accordance with the STOP-BANG sleep protocol.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
