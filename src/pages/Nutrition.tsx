import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Dna, Activity, Zap, Shield, Heart, Clock, 
  ChevronRight, ArrowRight, CheckCircle2, Flame, Droplets, 
  Layers, Compass, Atom, Eye, Microscope, Cpu, Sliders, ExternalLink
} from 'lucide-react';
import '../styles-design.css';

// Futuristic 6-Pillar Cellular Bio-Matrix Data
interface BioPillar {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  summary: string;
  bioMarkers: string[];
  keyMolecules: string[];
  cellularAction: string;
  clinicalImpact: string;
  wavelengthColor: string;
  accentHex: string;
}

const BIO_PILLARS: BioPillar[] = [
  {
    id: 'mitochondria',
    code: 'BIO-CELL // 01',
    title: 'Mitochondrial Bio-Energetics',
    subtitle: 'ATP Synthesis & NAD+ Recycling',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    category: 'Cellular Engine',
    summary: 'Fueling the cellular powerhouses. We target electron transport chain efficiency, coenzyme Q10 synthesis, and mitochondrial biogenesis to eradicate afternoon exhaustion.',
    bioMarkers: ['Fasting Glucose: Optimal', 'Lactate/Pyruvate: Balanced', 'Cellular ATP: High Flux'],
    keyMolecules: ['Pyrroloquinoline Quinone (PQQ)', 'Alpha Lipoic Acid', 'Active CoQ10', 'NAD+ Precursors'],
    cellularAction: 'Upregulates PGC-1alpha transcription to stimulate fresh mitochondrial density within muscle and hepatic tissue.',
    clinicalImpact: 'Eliminates chronic mitochondrial drag, restoring sharp cognitive velocity and cellular resilience.',
    wavelengthColor: 'from-emerald-500/20 to-teal-900/40',
    accentHex: '#10B981'
  },
  {
    id: 'microbiome',
    code: 'BIO-GUT // 02',
    title: 'Gut Microbiome & Postbiotics',
    subtitle: 'Microbial Ecology & Mucosal Defense',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    category: 'Ecosystem',
    summary: 'Cultivating the 100-trillion microbial collective. We nourish key species like Akkermansia muciniphila with targeted polyphenols to seal tight junctions and optimize serotonin synthesis.',
    bioMarkers: ['Zonulin: Suppressed', 'SCFA Butyrate: Elevated', 'Microbial Richness: >94th %ile'],
    keyMolecules: ['Sodium Butyrate', 'Prebiotic Arabinogalactans', 'Polyphenol Ellagitannins', 'Spore Biotics'],
    cellularAction: 'Stimulates intestinal goblet cells to reinforce secretory IgA and tighten claudin/occludin protein junctions.',
    clinicalImpact: 'Heals systemic endotoxemia, abolishing food sensitivities, skin eruptions, and stubborn brain fog.',
    wavelengthColor: 'from-lime-500/20 to-emerald-950/40',
    accentHex: '#84CC16'
  },
  {
    id: 'phyto-spectrum',
    code: 'BIO-CHROMA // 03',
    title: 'Phyto-Chemical Spectral Array',
    subtitle: 'Chromophore Frequencies & Nrf2 Activation',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    category: 'Plant Information',
    summary: 'Food as biological data. Deep anthocyanins, curcuminoids, and sulforaphane bind to cellular antioxidant response elements, switching on endogenous longevity genetics.',
    bioMarkers: ['hs-CRP: <0.5 mg/L', 'Total Antioxidant Capacity: Peak', 'Oxidized LDL: Minimized'],
    keyMolecules: ['Sulforaphane Glucosinolates', 'Anthocyanin-3-Glucosides', 'Curcumin Phyto-Complex', 'Lycopene Isomers'],
    cellularAction: 'Binds Keap1 to release Nrf2 transcription factor, initiating massive endogenous glutathione synthesis.',
    clinicalImpact: 'Quenches systemic vascular inflammation and shields cellular DNA from environmental oxidative damage.',
    wavelengthColor: 'from-amber-500/20 to-orange-950/40',
    accentHex: '#F59E0B'
  },
  {
    id: 'endocrine',
    code: 'BIO-HORMON // 04',
    title: 'Endocrine & Insulin Sensitivity',
    subtitle: 'Glucose Kinetics & Hormonal Alchemy',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    category: 'Metabolic Balance',
    summary: 'Mastering the insulin-glucagon axis. By sequencing nutrient ingestion and mineral cofactors, we eliminate glucose spikes, quiet cortisol surges, and restore thyroid sensitivity.',
    bioMarkers: ['Fasting Insulin: 2.5–5.0 uIU/mL', 'HbA1c: <5.1%', 'HOMA-IR: <1.0'],
    keyMolecules: ['Myo-Inositol & D-Chiro', 'Chromium Picolinate', 'Berberine Phytosome', 'Magnesium Bisglycinate'],
    cellularAction: 'Promotes GLUT4 receptor translocation to cell membrane without requiring hyperinsulinemic compensation.',
    clinicalImpact: 'Shuts down obsessive carbohydrate cravings, melts visceral adiposity, and stabilizes emotional baseline.',
    wavelengthColor: 'from-rose-500/20 to-stone-900/40',
    accentHex: '#F43F5E'
  },
  {
    id: 'membrane',
    code: 'BIO-LIPID // 05',
    title: 'Cellular Membrane Fluidity',
    subtitle: 'Omega-3 Index & Phospholipid Matrix',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    category: 'Structural Shield',
    summary: 'Every cellular thought and nutrient transfer passes through the lipid bilayer. We reconstruct cellular membranes using marine phospholipids, carotenoids, and cold-pressed polyphenols.',
    bioMarkers: ['Omega-3 Index: >9.5%', 'AA/EPA Ratio: <2.0', 'Lipid Peroxides: Low'],
    keyMolecules: ['Phospholipid DHA/EPA', 'Astaxanthin Carotenoid', 'Phosphatidylcholine', 'Oleic Acid (EVOO)'],
    cellularAction: 'Inserts high-fluidity polyunsaturated fatty acids into membrane lipid rafts for instantaneous receptor signaling.',
    clinicalImpact: 'Maximizes neurotransmitter receptor binding, joint cartilage glide, and endothelial micro-vascular flow.',
    wavelengthColor: 'from-cyan-500/20 to-blue-950/40',
    accentHex: '#06B6D4'
  },
  {
    id: 'autophagy',
    code: 'BIO-AUTOPH // 06',
    title: 'Autophagy & Senescence Clearance',
    subtitle: 'SIRT-1 Activation & Cellular Recycling',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
    category: 'Deep Longevity',
    summary: 'Activating the body’s innate cellular vacuum. Targeted fasting mimetics trigger autophagy, clearing dysfunctional senescent proteins and renewing deep tissues.',
    bioMarkers: ['mTOR/AMPK Ratio: Dynamic', 'Ferritin: Optimized', 'Cellular Clearance: Active'],
    keyMolecules: ['Spermidine Trihydrochloride', 'Fisetin Senolytic', 'EGCG Polyphenol', 'Resveratrol Trans-Isomer'],
    cellularAction: 'Inhibits mTOR complex 1 to induce lysosomal autophagosome formation and senescent protein digestion.',
    clinicalImpact: 'Promotes systemic tissue rejuvenation, protects biological telomeres, and accelerates metabolic reset.',
    wavelengthColor: 'from-purple-500/20 to-indigo-950/40',
    accentHex: '#8B5CF6'
  }
];

// Interactive Metabolic Fuel Synthesizer Protocols
interface PlateProtocol {
  id: string;
  name: string;
  tagline: string;
  heroImage: string;
  macroRatios: { protein: number; fat: number; carbs: number; fiber: number };
  micronutrientPillars: string[];
  clinicalRationale: string;
  keyFoods: { name: string; role: string; icon: string }[];
}

const PLATE_PROTOCOLS: PlateProtocol[] = [
  {
    id: 'longevity',
    name: 'The Mitochondrial Longevity Engine',
    tagline: 'High polyphenol density, clean ketone signaling, and mitochondrial biogenesis.',
    heroImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    macroRatios: { protein: 25, fat: 55, carbs: 20, fiber: 42 },
    micronutrientPillars: ['CoQ10 + PQQ', 'Sulforaphane', 'Polyphenol Bioflavonoids', 'Magnesium Malate'],
    clinicalRationale: 'By modulating glucose-to-ketone fuel flexibility, cellular mitochondria transition into low-reactive-oxygen-species energy output, safeguarding telomere integrity.',
    keyFoods: [
      { name: 'Sprouted Broccoli Brassica', role: 'High-concentration sulforaphane for Nrf2', icon: '🥦' },
      { name: 'Cold-Pressed Early Harvest EVOO', role: 'Oleocanthal anti-inflammatory polyphenols', icon: '🫒' },
      { name: 'Wild Alaskan Sockeye Salmon', role: 'Phospholipid EPA/DHA + Astaxanthin', icon: '🐟' },
      { name: 'Wild Andean Cacao Nibs', role: 'Epicatechins for nitric oxide & vasodilation', icon: '🍫' }
    ]
  },
  {
    id: 'microbiome-reset',
    name: 'The Gut Mucosal Regeneration Matrix',
    tagline: '30+ diverse functional botanicals per week feeding specialized keystone strains.',
    heroImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    macroRatios: { protein: 22, fat: 38, carbs: 40, fiber: 55 },
    micronutrientPillars: ['Prebiotic Inulin', 'Resistant Starch RS3', 'L-Glutamine Peptides', 'Zinc Carnosine'],
    clinicalRationale: 'Focuses on the production of Short-Chain Fatty Acids (SCFAs), especially butyrate, which serves as the primary fuel source for colonocytes and tight-junction integrity.',
    keyFoods: [
      { name: 'Traditional Kimchi & Kraut', role: 'Living lactic acid strains & bio-acids', icon: '🥬' },
      { name: 'Steamed & Chilled Sweet Potato', role: 'Type 3 resistant starch for butyrate', icon: '🍠' },
      { name: 'Tuscan Lacinato Kale & Dandelion', role: 'Bitter lactones for hepatic bile flush', icon: '🌱' },
      { name: 'Wild High-Altitude Pomegranate', role: 'Ellagitannins metabolized into Urolithin A', icon: '🫐' }
    ]
  },
  {
    id: 'endocrine-reset',
    name: 'Endocrine Harmony & Insulin Modulation',
    tagline: 'Precision carbohydrate pacing, hepatic phase II detox, and thyroid cofactor alignment.',
    heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    macroRatios: { protein: 32, fat: 40, carbs: 28, fiber: 38 },
    micronutrientPillars: ['Myo-Inositol', 'Selenium Methionine', 'Chromium Polynicotinate', 'Activated B-Complex'],
    clinicalRationale: 'Prevents the rapid postprandial glucose surges that destabilize cortisol rhythm and trigger androgenic conversion in hormone-sensitive receptors.',
    keyFoods: [
      { name: 'Pastured Organic Eggs (with yolk)', role: 'Choline for liver methylation & membranes', icon: '🍳' },
      { name: 'Avocado & Hemp Hearts', role: 'Lipid buffers slowing gastric emptying', icon: '🥑' },
      { name: 'Ceylon Cinnamon & Apple Cider Vinegar', role: 'Enhances peripheral GLUT4 sensitivity', icon: '🌿' },
      { name: 'Organic Brazil Nuts (1-2/day)', role: 'Bioavailable selenium for T4 to T3 conversion', icon: '🌰' }
    ]
  },
  {
    id: 'neuro-genesis',
    name: 'Neuro-Nutritive Brain Flow Protocol',
    tagline: 'Blood-brain barrier crossing nootropics, phospholipid substrates, and synaptic fluidity.',
    heroImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
    macroRatios: { protein: 28, fat: 50, carbs: 22, fiber: 35 },
    micronutrientPillars: ['Hericenones & Erinacines', 'Lutein + Zeaxanthin', 'Alpha-GPC', 'Curcumin Phytosome'],
    clinicalRationale: 'Nourishes the cerebral lipid architecture while down-regulating microglia-driven neuro-inflammation, elevating BDNF and sustained alpha-wave focus.',
    keyFoods: [
      { name: "Lion's Mane Mushroom Extracts", role: 'Stimulates Nerve Growth Factor (NGF)', icon: '🍄' },
      { name: 'Wild Arctic Blueberries', role: 'Crosses blood-brain barrier for memory recall', icon: '🫐' },
      { name: 'Ceremonial Japanese Uji Matcha', role: 'L-theanine + EGCG for serene focus', icon: '🍵' },
      { name: 'Activated Walnuts & Pumpkin Seeds', role: 'Zinc, plant polyphenols, and ALA lipids', icon: '🥜' }
    ]
  }
];

// Chrono-Nutrition Circadian Clock Hours
const CIRCADIAN_HOURS = [
  {
    time: '07:30 AM',
    phase: 'Dawn Cortisol Synchronization',
    focus: 'Amino Acid Priming & Hydration',
    description: 'Bile acid stimulation, sodium-potassium replenishment, and early leucine signaling to switch off nocturnal proteolysis without spiking insulin.',
    foodRecommendation: 'Filtered mineral water with Celtic salt, pasture-raised eggs or collagen with wild greens, Ceylon tea.',
    icon: '🌅'
  },
  {
    time: '01:00 PM',
    phase: 'Solar Zenith (Peak Insulin Sensitivity)',
    focus: 'Metabolic Fuel Partitioning',
    description: 'When pancreatic digestive enzymes, hydrochloric acid, and peripheral GLUT-4 transporters are at peak circadian potency.',
    foodRecommendation: 'Substantial multi-colored botanical bowl, wild fish or tempeh, olive oil, and diverse complex starches.',
    icon: '☀️'
  },
  {
    time: '06:30 PM',
    phase: 'Twilight Glycogen Replenishment',
    focus: 'Tryptophan & Serotonin Synthesis',
    description: 'Gentle complex carbohydrates to drive tryptophan across the blood-brain barrier in preparation for nocturnal melatonin synthesis.',
    foodRecommendation: 'Steamed root vegetables, slow-cooked grass-fed broth or lentils, calming magnesium-rich pumpkin seeds.',
    icon: '🌇'
  },
  {
    time: '10:00 PM',
    phase: 'Nocturnal Glymphatic Autophagy',
    focus: 'Cellular Cleanse & Fasting Rest',
    description: 'Metabolic digestive dormancy. The brain’s glymphatic system clears beta-amyloid debris while liver autophagy recycles misfolded proteins.',
    foodRecommendation: 'Chamomile, passionflower, or reishi botanical infusion. Strictly zero caloric intake.',
    icon: '🌙'
  }
];

export default function Nutrition() {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<BioPillar>(BIO_PILLARS[0]);
  const [activeProtocol, setActiveProtocol] = useState<PlateProtocol>(PLATE_PROTOCOLS[0]);
  const [selectedCircadianIdx, setSelectedCircadianIdx] = useState(1);
  const [imageZoomMode, setImageZoomMode] = useState<string | null>(null);

  return (
    <div className="nutrition-scope bg-[var(--bg)] text-[var(--ink)] min-h-screen selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
      {/* Dynamic Background Ambient Aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-amber-500/10 via-emerald-600/5 to-transparent blur-[130px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-lime-500/8 via-teal-900/10 to-transparent blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        
        {/* =========================================================================
            HERO SECTION: THE FUTURISTIC NUTRITION COMPASS
            ========================================================================= */}
        <div className="mb-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span>CLINICAL BIOCHEMISTRY // NUTRITIVE ALCHEMY</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[var(--muted)]">
              <span className="hidden sm:inline">SYSTEM_STATUS:</span>
              <span className="text-emerald-500 font-bold">OPTIMIZED</span>
              <span className="text-[var(--glass-line)]">|</span>
              <span>BIO-INDIVIDUAL MATRIX v4.2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left: Strategic Proposition */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[var(--serif)] font-light tracking-tight leading-[1.12] mb-6">
                Food as <em className="italic font-medium text-emerald-600 dark:text-emerald-400 not-italic">Biological Code</em>.
                <br />
                Metabolic Mastery from Within.
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-2xl">
                We move far beyond obsolete calorie arithmetic. Reshmi Verma reads nutritional biochemistry as chemical information—directing mitochondrial ATP generation, healing gut mucosal architecture, and reprogramming cellular gene expression through targeted phyto-pharmacology.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/booking')}
                  className="px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all flex items-center gap-3 cursor-pointer"
                >
                  <span>Book Clinical Assessment</span>
                  <ArrowRight size={15} />
                </button>
                <a
                  href="#bio-pillars"
                  className="px-7 py-4 rounded-full bg-[var(--glass)] hover:bg-[var(--glass-line)] border border-[var(--glass-line)] text-xs font-bold uppercase tracking-widest text-[var(--ink)] transition-all flex items-center gap-2"
                >
                  <span>Explore 6 Bio-Pillars</span>
                  <ChevronRight size={14} />
                </a>
              </div>

              {/* Fast Bio-Telemetry Bar */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-[var(--glass-line)]">
                <div>
                  <span className="block text-2xl font-[var(--serif)] font-bold text-emerald-600 dark:text-emerald-400">98.4%</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">Biomarker Modulation</span>
                </div>
                <div>
                  <span className="block text-2xl font-[var(--serif)] font-bold text-amber-500">100%</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">Bio-Individual Design</span>
                </div>
                <div>
                  <span className="block text-2xl font-[var(--serif)] font-bold text-teal-600 dark:text-teal-400">&lt; 0.5</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">Target hs-CRP (mg/L)</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Right: Holographic Spatial Visual Cluster */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-[32px] overflow-hidden p-3 bg-gradient-to-br from-emerald-500/30 via-[var(--glass-line)] to-amber-500/20 shadow-2xl border border-emerald-500/30">
                
                {/* Laser Scanning Animation */}
                <div className="scan-line" />

                <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-black/40">
                  <img 
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80" 
                    alt="Futuristic Cellular Botanical Nutrition"
                    className="w-full h-full object-cover filter contrast-105 brightness-95 hover:scale-105 transition-transform duration-1000"
                  />
                  
                  {/* Subtle Frosted Vignette & HUD Data Nodes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Micro Holographic Coordinates Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                    <span className="bio-hud-tag">
                      <Atom size={12} className="text-emerald-400" />
                      <span>BIO-SCAN // SPECTRUM 480nm</span>
                    </span>
                    <span className="text-[10px] font-mono text-white/70 bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                      ISO 9001 METABOLIC LAB
                    </span>
                  </div>

                  {/* Floating Bio-Marker Holographic Pills */}
                  <div className="absolute bottom-5 inset-x-5 z-10">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap size={14} />
                          Active Cellular Fuel
                        </span>
                        <span className="text-[10px] font-mono text-white/60">AUTOPHAGY FLUX: 96%</span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-light">
                        Real-time integration of mitochondrial polyphenols, short-chain fatty acids, and active mineral coenzymes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Interactive Mini Node */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 bg-[var(--bg)]/90 backdrop-blur-lg border-2 border-emerald-500/40 p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Dna size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">EPIGENETIC SIGNAL</span>
                    <span className="text-xs font-bold text-[var(--ink)] block">Nrf2 Gene Translocation</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: THE 6 CELLULAR BIO-PILLARS (SPATIAL BENTO MATRIX)
            ========================================================================= */}
        <div id="bio-pillars" className="mb-28 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
                // ARCHITECTURE OF CELLULAR HEALTH
              </span>
              <h2 className="text-3xl sm:text-4xl font-[var(--serif)] font-light">
                The Six Pillars of <em className="italic font-medium text-emerald-600 dark:text-emerald-400 not-italic">Nutritive Alchemy</em>.
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed">
              Hover or click any pillar to examine its biochemical pathways, key molecular agents, and clinical biomarker impact.
            </p>
          </div>

          {/* Spatial Bento Grid of Images & Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BIO_PILLARS.map((pillar) => {
              const isSelected = activePillar.id === pillar.id;
              return (
                <div
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar)}
                  className={`holo-card rounded-[28px] p-6 cursor-pointer group transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-emerald-500 shadow-2xl scale-[1.01]' : 'hover:border-emerald-500/50'
                  }`}
                >
                  {/* High-Resolution Spatial Visual Frame */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-5 bg-black/40">
                    <img 
                      src={pillar.image} 
                      alt={pillar.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${pillar.wavelengthColor} pointer-events-none opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/70 text-emerald-400 backdrop-blur-md border border-white/10">
                        {pillar.code}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                        {pillar.category}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <h3 className="text-xl font-[var(--serif)] font-medium text-white leading-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-[11px] text-white/80 font-mono mt-0.5">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Summary Description */}
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">
                    {pillar.summary}
                  </p>

                  {/* Molecular Compounds Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pillar.keyMolecules.slice(0, 2).map((mol, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-mono px-2 py-1 rounded-md bg-[var(--glass)] border border-[var(--glass-line)] text-[var(--ink)]"
                      >
                        {mol}
                      </span>
                    ))}
                    {pillar.keyMolecules.length > 2 && (
                      <span className="text-[10px] font-mono px-1.5 py-1 text-[var(--muted)]">
                        +{pillar.keyMolecules.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-3 border-t border-[var(--glass-line)] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Inspect Biochemical Pathway</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Pillar Expanded Molecular Inspector */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="mt-8 rounded-[32px] p-8 bg-[var(--glass)] border-2 border-emerald-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Visual Highlight */}
                <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-[var(--glass-line)]">
                  <img 
                    src={activePillar.image} 
                    alt={activePillar.title}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                      {activePillar.code} // PATHWAY ANALYSIS
                    </span>
                    <h4 className="text-xl font-[var(--serif)] font-medium leading-tight">
                      {activePillar.title}
                    </h4>
                  </div>
                </div>

                {/* Right Clinical Data Telemetry */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-[var(--serif)] font-medium text-[var(--ink)]">
                      {activePillar.subtitle}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase">
                      {activePillar.category}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {activePillar.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--glass-line)]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                        CELLULAR BIO-MECHANISM
                      </span>
                      <p className="text-xs text-[var(--ink)] leading-relaxed">
                        {activePillar.cellularAction}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--glass-line)]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold block mb-1">
                        CLINICAL OUTCOME MEASURE
                      </span>
                      <p className="text-xs text-[var(--ink)] leading-relaxed">
                        {activePillar.clinicalImpact}
                      </p>
                    </div>
                  </div>

                  {/* Targeted Active Biomolecules */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-2">
                      TARGETED BIOACTIVE AGENTS & SUBSTRATES:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activePillar.keyMolecules.map((molecule, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-[var(--ink)] flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {molecule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* =========================================================================
            SECTION 2: INTERACTIVE METABOLIC FUEL SYNTHESIZER (INTERACTIVE PLATE MATRIX)
            ========================================================================= */}
        <div className="mb-28 pt-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
              // INTERACTIVE FUEL MATRIX
            </span>
            <h2 className="text-3xl sm:text-4xl font-[var(--serif)] font-light mb-4">
              Metabolic <em className="italic font-medium text-emerald-600 dark:text-emerald-400 not-italic">Fuel Synthesizer</em>.
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Select a clinical objective below to observe how nutrient density, macronutrient partitioning, and targeted functional foods rearrange to trigger specific biochemical adaptions.
            </p>

            {/* Protocol Selector Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
              {PLATE_PROTOCOLS.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => setActiveProtocol(protocol)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeProtocol.id === protocol.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                      : 'bg-[var(--glass)] hover:bg-[var(--glass-line)] border border-[var(--glass-line)] text-[var(--ink)]'
                  }`}
                >
                  {protocol.name.split(' ')[1] || protocol.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Fuel Synthesizer Canvas Card */}
          <div className="rounded-[36px] bg-[var(--glass)] border-2 border-emerald-500/30 p-8 lg:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Interactive Visual Plate Representation */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-[28px] overflow-hidden aspect-[4/3] shadow-2xl border-2 border-emerald-500/30 group">
                  <img 
                    src={activeProtocol.heroImage} 
                    alt={activeProtocol.name} 
                    className="w-full h-full object-cover filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Reticle Hologram Graphic Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border border-dashed border-emerald-400/30 animate-[spin_25s_linear_infinite]" />
                    <div className="w-64 h-64 rounded-full border border-emerald-400/20" />
                  </div>

                  {/* Micro Title on Plate */}
                  <div className="absolute bottom-5 inset-x-5 text-white z-10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                      BIO-TARGET // PROTOCOL SPECIFICATION
                    </span>
                    <h3 className="text-2xl font-[var(--serif)] font-medium leading-snug">
                      {activeProtocol.name}
                    </h3>
                  </div>
                </div>

                {/* Macro Ratios Telemetry Progress Grid */}
                <div className="grid grid-cols-4 gap-2.5 mt-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--glass-line)] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">PROTEIN</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{activeProtocol.macroRatios.protein}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--glass-line)] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">LIPIDS</span>
                    <span className="text-base font-bold text-amber-500">{activeProtocol.macroRatios.fat}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--glass-line)] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">CARBS</span>
                    <span className="text-base font-bold text-teal-600 dark:text-teal-400">{activeProtocol.macroRatios.carbs}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--glass-line)] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">FIBER</span>
                    <span className="text-base font-bold text-lime-600 dark:text-lime-400">{activeProtocol.macroRatios.fiber}g</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Functional Foods & Clinical Rationale */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-[var(--serif)] font-light mb-2">
                    {activeProtocol.tagline}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    {activeProtocol.clinicalRationale}
                  </p>
                </div>

                {/* Key Functional Foods Showcase */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-3">
                    KEY BIOACTIVE FOOD SUBSTRATES:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeProtocol.keyFoods.map((food, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[var(--bg)]/90 border border-[var(--glass-line)] hover:border-emerald-500/40 transition-all flex items-start gap-3"
                      >
                        <span className="text-2xl mt-0.5">{food.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-[var(--ink)] block leading-snug">
                            {food.name}
                          </span>
                          <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                            {food.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micronutrient Pillars Tag Array */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-2">
                    REPRESENTATIVE MICRONUTRIENT COFACTORS:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeProtocol.micronutrientPillars.map((micro, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        ✓ {micro}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: CIRCADIAN CHRONO-NUTRITION CLOCK
            ========================================================================= */}
        <div className="mb-28 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
                // TEMPORAL NUTRIENT PARTITIONING
              </span>
              <h2 className="text-3xl sm:text-4xl font-[var(--serif)] font-light">
                Circadian <em className="italic font-medium text-emerald-600 dark:text-emerald-400 not-italic">Chrono-Nutrition</em> Clock.
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed">
              Nutrient assimilation changes dynamically across 24-hour cycles. We synchronize macro intake with clock gene expression (CLOCK, BMAL1).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CIRCADIAN_HOURS.map((circadian, idx) => {
              const isSelected = selectedCircadianIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCircadianIdx(idx)}
                  className={`p-6 rounded-[28px] bg-[var(--glass)] border-2 transition-all cursor-pointer backdrop-blur-md relative ${
                    isSelected 
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]' 
                      : 'border-[var(--glass-line)] hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{circadian.icon}</span>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {circadian.time}
                    </span>
                  </div>

                  <h3 className="text-lg font-[var(--serif)] font-medium text-[var(--ink)] mb-1">
                    {circadian.phase}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block mb-3">
                    {circadian.focus}
                  </span>

                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    {circadian.description}
                  </p>

                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--glass-line)]">
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                      OPTIMAL PROTOCOL:
                    </span>
                    <span className="text-[11px] text-[var(--ink)] leading-snug block">
                      {circadian.foodRecommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: CLINICAL BIOMARKER MATRIX
            ========================================================================= */}
        <div className="mb-24 pt-8 border-t border-[var(--glass-line)]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
              // OBJECTIVE LABORATORY RIGOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-[var(--serif)] font-light mb-4">
              Real Biomarker <em className="italic font-medium text-emerald-600 dark:text-emerald-400 not-italic">Quantification</em>.
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              We never guess. Every customized nutritional intervention is verified through rigorous before-and-after functional blood chemistry, organic acids, and stool microbiome sequencing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { marker: 'Fasting Insulin', baseline: '14.2 uIU/mL', target: '3.5 uIU/mL', shift: '-75%', status: 'Sensitized' },
              { marker: 'hs-CRP (Inflammation)', baseline: '3.8 mg/L', target: '0.4 mg/L', shift: '-89%', status: 'Quenched' },
              { marker: 'Omega-3 Index', baseline: '4.2%', target: '9.8%', shift: '+133%', status: 'Cardio-Shield' },
              { marker: 'HbA1c', baseline: '5.8%', target: '5.0%', shift: '-14%', status: 'Glucoregulated' },
              { marker: 'Zonulin (Gut Leaks)', baseline: '78 ng/mL', target: '22 ng/mL', shift: '-72%', status: 'Sealed Barrier' },
              { marker: 'Trig/HDL Ratio', baseline: '3.6', target: '1.1', shift: '-69%', status: 'Peak Lipid Flux' }
            ].map((bio, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[var(--glass)] border border-[var(--glass-line)] text-center hover:border-emerald-500/40 transition-all">
                <span className="text-xs font-bold text-[var(--ink)] block mb-2 leading-tight">
                  {bio.marker}
                </span>
                <span className="text-xl font-[var(--serif)] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  {bio.shift}
                </span>
                <div className="text-[10px] font-mono text-[var(--muted)] space-y-0.5">
                  <div>Prev: {bio.baseline}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">Goal: {bio.target}</div>
                </div>
                <span className="mt-2.5 inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {bio.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: STRATEGIC CALL TO ACTION / BOOKING
            ========================================================================= */}
        <div className="rounded-[36px] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-mono uppercase tracking-wider mb-6 border border-white/20">
              <Sparkles size={13} />
              <span>Personalized Clinical Intake Open</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-[var(--serif)] font-light leading-tight mb-6">
              Ready to Upgrade Your <em className="italic font-medium text-emerald-200 not-italic">Metabolic Operating System</em>?
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-2xl">
              Initiate your comprehensive diagnostic mapping with Reshmi Verma. We decode your unique blood chemistry, gut microbiome, and hormonal architecture to forge a sustainable, high-vitality clinical nutrition protocol.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/booking')}
                className="px-8 py-4 rounded-full bg-white hover:bg-white/95 text-emerald-900 text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer"
              >
                <span>Schedule Diagnostic Consultation</span>
                <ArrowRight size={15} />
              </button>
              <Link
                to="/breathe"
                className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-bold uppercase tracking-widest text-white transition-all"
                style={{ textDecoration: 'none' }}
              >
                <span>Explore Breathe with Reshmi</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
