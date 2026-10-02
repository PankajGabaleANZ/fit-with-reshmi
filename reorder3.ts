import * as fs from 'fs';

const content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const sAbout = content.indexOf('{/* Hero Section: About Reshmi Verma (Brand Precedence) */}');
const sHealth = content.indexOf('{/* Section: Defining Health is Freedom */}');
const sTurningPoint = content.indexOf('{/* Interactive Section 2: THE TURNING POINT - story of Reshmi */}');
const sMissingLink = content.indexOf('{/* Interactive Section 1: THE MISSING LINK - Biomarker Ranges */}');
const sTimeline = content.indexOf('{/* Interactive Section 3: CLINICAL EVOLUTION - TIMELINE */}');
const sSleepAudit = content.indexOf('{/* Interactive Section 5: CLINICAL SLEEP & BREATH QUALITY HUB - STOP BANG (New requested calculator) */}');
const sBioReels = content.indexOf('{/* Interactive Section 6: Instagram Reels Simulation */}');
const sCoaching = content.indexOf('{/* Interactive Section 7: Precision Coaching Categories */}');
const sAILab = content.indexOf('<AILab />');
const sCTA = content.indexOf('{/* Final Premium CTA Section */}');

if ([sAbout, sHealth, sTurningPoint, sMissingLink, sTimeline, sSleepAudit, sBioReels, sCoaching, sAILab, sCTA].includes(-1)) {
  console.error("Missing a section index!");
  process.exit(1);
}

// Slice out each block
const partPre = content.substring(0, sAbout);
const partAbout = content.substring(sAbout, sHealth);
const partHealth = content.substring(sHealth, sTurningPoint);
const partTurningPoint = content.substring(sTurningPoint, sMissingLink);
const partMissingLink = content.substring(sMissingLink, sTimeline);
const partTimeline = content.substring(sTimeline, sSleepAudit);
const partSleepAudit = content.substring(sSleepAudit, sBioReels);
const partBioReels = content.substring(sBioReels, sCoaching);
const partCoaching = content.substring(sCoaching, sAILab);

// Remove Final CTA entirely
const partEnd = content.substring(content.indexOf('    </div>', sCTA));

// Construct new state definitions in partPre
let newPre = partPre;
// Add modal states and imports for AILab and Sleep Audit
if (!newPre.includes('isAILabOpen')) {
  newPre = newPre.replace('const [rangeMode', 'const [isAILabOpen, setIsAILabOpen] = useState(false);\n  const [isSleepAuditOpen, setIsSleepAuditOpen] = useState(false);\n  const [rangeMode');
}

// Add the AILab Button into partAbout
let newAbout = partAbout;
newAbout = newAbout.replace(
  '<div className="pt-8 flex flex-col sm:flex-row gap-4 justify-start">',
  `<div className="pt-8 flex flex-col sm:flex-row gap-4 justify-start">
                  <button
                    onClick={() => setIsAILabOpen(true)}
                    className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-full text-mashiro bg-momo hover:scale-105 transition-all shadow-xl"
                  >
                    Enter Interactive AI Lab
                  </button>`
);

// Replace the full SleepAudit block with a Brief and a Modal wrapper
// The original partSleepAudit is HUGE. Let's make it brief!
const briefSleepAudit = `
      {/* Interactive Section 5: CLINICAL SLEEP & BREATH QUALITY BRIEF */}
      <section className="py-24 bg-mashiro border-t border-b border-sakura/30 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-momo mb-6 uppercase tracking-tight">Sleep & Breath Quality</h2>
          <p className="text-lg text-momo/80 font-light mb-8">
            Oxygen is the primary biological nutrient. Reduced airway resilience during sleep directly impacts metabolism, cortisol secretion, and systemic inflammation. Take our clinical STOP-BANG audit to understand your risk and learn how to secure healthy sleep freedom.
          </p>
          <button 
            onClick={() => setIsSleepAuditOpen(true)}
            className="inline-flex items-center justify-center px-8 py-4 bg-sakura text-momo border border-momo/20 text-sm font-bold uppercase tracking-widest rounded-full hover:bg-momo hover:text-mashiro transition-colors"
          >
            Launch Quality Audit
          </button>
        </div>
      </section>

      {/* SLEEP AUDIT MODAL */}
      <AnimatePresence>
        {isSleepAuditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-momo/90 backdrop-blur-md" onClick={() => setIsSleepAuditOpen(false)} />
            <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="relative bg-mashiro rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto w-full z-10 border border-sakura">
              <button onClick={() => setIsSleepAuditOpen(false)} className="absolute top-6 right-6 p-2 bg-sakura/50 rounded-full hover:bg-sakura text-momo transition-colors"><X size={20} /></button>
              <div className="p-2 sm:p-4">
                <div className="scale-90 sm:scale-100 origin-top transform-gpu">
                  \n` + partSleepAudit.replace('<section id="sleep-apnea-screening" className="py-24 bg-mashiro border-t border-b border-sakura/30 relative">', '<div className="pt-2 relative">').replace('</section>', '</div>') + `\n
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

// AI Lab Modal
const aiLabModal = `
      {/* AI LAB MODAL */}
      <AnimatePresence>
        {isAILabOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-momo/90 backdrop-blur-md" onClick={() => setIsAILabOpen(false)} />
            <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="relative bg-mashiro sm:rounded-[3rem] shadow-2xl w-full h-full sm:h-[90vh] overflow-hidden z-10 flex flex-col border border-sakura">
              <div className="flex items-center justify-between p-4 border-b border-sakura/40 bg-mashiro/80 backdrop-blur-sm z-20">
                <span className="font-serif font-bold text-momo tracking-widest uppercase">Interactive AI Lab</span>
                <button onClick={() => setIsAILabOpen(false)} className="p-2 bg-sakura/50 rounded-full hover:bg-sakura text-momo transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AILab />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;


// New Order:
// 1. About (Intro)
// 2. Bio Reels
// 3. Turning Point
// 4. Health
// 5. Missing Link
// 6. Timeline
// 7. Coaching
// 8. Sleep Audit Brief
// (AI Lab modal & Sleep Audit Modal in root)

// Wait, the user wants:
// 1. Into/About
// 2. Rashmi's bio reels
// 3. Turning point
// 4. Healthy sleep freedom (Health is Freedom section)
// 5. Missing link
// ...
let newBioReels = partBioReels.replace('py-24 bg-sakura/10 relative', 'py-24 bg-mashiro relative');
let newTurningPoint = partTurningPoint.replace('py-24 bg-mashiro relative', 'py-24 bg-sakura/10 relative');
let newHealth = partHealth.replace('py-24 bg-sakura/10 relative', 'py-24 bg-mashiro relative');
let newMissingLink = partMissingLink.replace('py-24 bg-sakura/10 border-t', 'py-24 bg-sakura/10 border-t'); // Keep
let newTimeline = partTimeline;
let newCoaching = partCoaching.replace('py-24 bg-mashiro relative', 'py-24 bg-sakura/10 relative');

const newContent = 
  newPre +
  newAbout +
  newBioReels +
  newTurningPoint +
  newHealth +
  newMissingLink +
  newTimeline +
  briefSleepAudit +
  newCoaching +
  aiLabModal +
  partEnd;

fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log("Successfully reordered pages and added modals");
