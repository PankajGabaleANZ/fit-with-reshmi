import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Activity, Route, Dna, X, Sparkles, ArrowRight, ChevronRight, BrainCircuit, ScanLine, Fingerprint } from 'lucide-react';

async function callAIGenerate(prompt: string): Promise<string> {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to connect to AI engine');
  }
  return data.text || '';
}

type ToolType = 'assessment' | 'journey' | 'matcher' | null;

export default function AILab() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  
  // Shared State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  // Assessment State
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  // Journey State
  const [history, setHistory] = useState('');
  const [target, setTarget] = useState('');

  // Matcher State
  const [preferences, setPreferences] = useState('');

  const handleClose = () => {
    setActiveTool(null);
    setResult('');
  };

  const runAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const prompt = `Act as an advanced AI fitness diagnostic system for 'Fit with Reshmi'. The user is ${age} years old, weighs ${weight}, and their goal is: '${goal}'. Provide a highly precise, futuristic, and encouraging assessment. Structure the response with: 1. Current State Analysis, 2. The Gap (what needs to change), and 3. Recommended Protocol. Use markdown formatting, bullet points, and keep the tone punchy, high-tech, and motivational.`;
      const text = await callAIGenerate(prompt);
      setResult(text || 'Error generating assessment.');
    } catch (err: any) {
      setResult(err.message || 'Failed to connect to AI core.');
    }
    setIsGenerating(false);
  };

  const runJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const prompt = `Act as a predictive health simulation AI for 'Fit with Reshmi'. User history: '${history}'. Target outcome: '${target}'. Generate a highly detailed, futuristic 100-day journey simulation. Break it down into precise milestones: Day 0 (Baseline), Day 30 (Adaptation Phase), Day 60 (Optimization Phase), and Day 100 (Target Realization). Describe the physiological and lifestyle changes at each stage. Use markdown, bold text for emphasis, and maintain a clinical yet inspiring futuristic tone.`;
      const text = await callAIGenerate(prompt);
      setResult(text || 'Error running simulation.');
    } catch (err: any) {
      setResult(err.message || 'Failed to connect to AI core.');
    }
    setIsGenerating(false);
  };

  const runMatcher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const prompt = `Act as a cutting-edge AI nutrition matching algorithm for 'Fit with Reshmi'. User preferences, allergies, and lifestyle: '${preferences}'. Analyze these data points and recommend the absolute best nutrition plan framework (e.g., Mediterranean, High-Protein, Functional Nutrition). Structure the output with: 1. The Match (the recommended plan), 2. Why It Works (scientific/logical reasoning based on their input), and 3. Key Guidelines (3-4 actionable rules). Use markdown and a futuristic, expert tone.`;
      const text = await callAIGenerate(prompt);
      setResult(text || 'Error running matcher.');
    } catch (err: any) {
      setResult(err.message || 'Failed to connect to AI core.');
    }
    setIsGenerating(false);
  };

  return (
    <section id="ai-lab" className="py-24 relative overflow-hidden bg-mashiro">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mashiro"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-momo/30 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sakura/50 border border-momo/20 text-momo text-sm font-bold mb-6 uppercase tracking-widest backdrop-blur-sm"
          >
            <BrainCircuit size={16} className="animate-pulse" />
            <span>Powered by Neural Analysis</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-momo mb-6 tracking-tight"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-momo to-momo/60">Future</span> of Functional Nutrition
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-momo/80 text-lg font-light leading-relaxed"
          >
            Access cutting-edge simulation modules and calculators. Assess your current state, simulate your 100-day journey, or find your perfect nutrition match instantly using our advanced AI models.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tool 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActiveTool('assessment')}
            className="group cursor-pointer bg-mashiro/50 backdrop-blur-xl border border-sakura p-8 rounded-3xl hover:border-momo/40 transition-all relative overflow-hidden shadow-lg hover:shadow-xl"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-sakura/50 rounded-full blur-3xl group-hover:bg-momo/20 transition-colors"></div>
            <div className="w-14 h-14 bg-sakura rounded-2xl flex items-center justify-center mb-6 border border-momo/20 group-hover:border-momo/50 transition-colors relative overflow-hidden">
              <ScanLine className="w-7 h-7 text-momo relative z-10" />
              <div className="absolute inset-0 bg-momo/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </div>
            <h3 className="text-xl font-bold text-momo mb-3">Biometric Assessment</h3>
            <p className="text-momo/70 text-sm mb-6 font-light">
              Instantly analyze the gap between where you are and where you want to be using our diagnostic engine.
            </p>
            <div className="flex items-center text-momo text-sm font-bold uppercase tracking-wider">
              Initialize <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Tool 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActiveTool('journey')}
            className="group cursor-pointer bg-mashiro/50 backdrop-blur-xl border border-sakura p-8 rounded-3xl hover:border-momo/40 transition-all relative overflow-hidden shadow-lg hover:shadow-xl"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-sakura/50 rounded-full blur-3xl group-hover:bg-momo/20 transition-colors"></div>
            <div className="w-14 h-14 bg-sakura rounded-2xl flex items-center justify-center mb-6 border border-momo/20 group-hover:border-momo/50 transition-colors relative overflow-hidden">
              <Route className="w-7 h-7 text-momo relative z-10" />
              <div className="absolute inset-0 bg-momo/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </div>
            <h3 className="text-xl font-bold text-momo mb-3">100-Day Simulator</h3>
            <p className="text-momo/70 text-sm mb-6 font-light">
              Input your history and target. Watch our AI simulate your precise milestones from Day 0 to Day 100.
            </p>
            <div className="flex items-center text-momo text-sm font-bold uppercase tracking-wider">
              Initialize <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Tool 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActiveTool('matcher')}
            className="group cursor-pointer bg-mashiro/50 backdrop-blur-xl border border-sakura p-8 rounded-3xl hover:border-momo/40 transition-all relative overflow-hidden shadow-lg hover:shadow-xl"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-sakura/50 rounded-full blur-3xl group-hover:bg-momo/20 transition-colors"></div>
            <div className="w-14 h-14 bg-sakura rounded-2xl flex items-center justify-center mb-6 border border-momo/20 group-hover:border-momo/50 transition-colors relative overflow-hidden">
              <Fingerprint className="w-7 h-7 text-momo relative z-10" />
              <div className="absolute inset-0 bg-momo/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </div>
            <h3 className="text-xl font-bold text-momo mb-3">DNA Protocol Matcher</h3>
            <p className="text-momo/70 text-sm mb-6 font-light">
              Not sure which diet suits you? Let our matching algorithm analyze your preferences and find the perfect fit.
            </p>
            <div className="flex items-center text-momo text-sm font-bold uppercase tracking-wider">
              Initialize <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeTool && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-mashiro/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-mashiro border border-sakura rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-sakura flex justify-between items-center bg-sakura/30">
                <div className="flex items-center gap-3">
                  {activeTool === 'assessment' && <ScanLine className="text-momo" />}
                  {activeTool === 'journey' && <Route className="text-momo" />}
                  {activeTool === 'matcher' && <Fingerprint className="text-momo" />}
                  <h3 className="font-bold text-momo uppercase tracking-widest text-sm">
                    {activeTool === 'assessment' && 'Biometric Assessment Engine'}
                    {activeTool === 'journey' && 'Journey Simulator'}
                    {activeTool === 'matcher' && 'DNA Protocol Matcher'}
                  </h3>
                </div>
                <button onClick={handleClose} className="text-momo/70 hover:text-momo p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {!result ? (
                  <form 
                    onSubmit={
                      activeTool === 'assessment' ? runAssessment : 
                      activeTool === 'journey' ? runJourney : runMatcher
                    } 
                    className="space-y-5"
                  >
                    {activeTool === 'assessment' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Age</label>
                            <input type="text" required value={age} onChange={e => setAge(e.target.value)} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none transition-all" placeholder="e.g. 32" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Current Weight</label>
                            <input type="text" required value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none transition-all" placeholder="e.g. 180 lbs" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Primary Goal</label>
                          <textarea required value={goal} onChange={e => setGoal(e.target.value)} rows={3} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none resize-none transition-all" placeholder="e.g. I want to lose 20 lbs and have more energy for my kids." />
                        </div>
                      </motion.div>
                    )}

                    {activeTool === 'journey' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Health History / Current Habits</label>
                          <textarea required value={history} onChange={e => setHistory(e.target.value)} rows={3} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none resize-none transition-all" placeholder="e.g. Sedentary job, eat out 4x a week, sleep 6 hours." />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Target Outcome</label>
                          <input type="text" required value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none transition-all" placeholder="e.g. Run a 5k and cook meals at home." />
                        </div>
                      </motion.div>
                    )}

                    {activeTool === 'matcher' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-momo/70 mb-1 uppercase tracking-wider">Preferences, Allergies & Lifestyle</label>
                          <textarea required value={preferences} onChange={e => setPreferences(e.target.value)} rows={4} className="w-full bg-mashiro border border-sakura rounded-xl px-4 py-3 text-momo focus:border-momo focus:ring-1 focus:ring-momo outline-none resize-none transition-all" placeholder="e.g. I hate cooking, love meat, allergic to dairy, and workout in the mornings." />
                        </div>
                      </motion.div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isGenerating}
                      className={`w-full py-4 rounded-xl font-bold text-mashiro flex items-center justify-center gap-2 transition-all bg-momo hover:bg-momo/90 disabled:opacity-50 uppercase tracking-widest text-sm mt-4`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-mashiro/30 border-t-mashiro rounded-full animate-spin" />
                          Processing Data...
                        </>
                      ) : (
                        <>
                          Run Analysis <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-momo max-w-none text-momo"
                  >
                    <Markdown>{result}</Markdown>
                    <button 
                      onClick={() => setResult('')}
                      className="mt-8 px-6 py-3 rounded-xl border border-momo text-momo hover:bg-sakura transition-colors text-sm font-bold uppercase tracking-widest w-full"
                    >
                      Run Another Analysis
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
