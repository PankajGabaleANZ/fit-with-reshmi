const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// We have 9 scenes now (0-8), the rail has been updated, but the sections are still 0-7.
// We need to shift everything from 1 to 7 -> 2 to 8.

// Process sections backwards to avoid collisions
for (let i = 7; i >= 1; i--) {
  let next = i + 1;
  content = content.replace(new RegExp(`activeScene === ${i}`, 'g'), `activeScene === ${next}`);
  content = content.replace(new RegExp(`data-scene="${i}"`, 'g'), `data-scene="${next}"`);
  content = content.replace(new RegExp(`<b>0${i}</b>`, 'g'), `<b>0${next}</b>`);
  content = content.replace(new RegExp(`SCENE ${i} ·`, 'g'), `SCENE ${next} ·`);
}

// Now we need to insert SCENE 1 before SCENE 2
const newScene1 = `
        {/* ===== SCENE 1 · BRANDS ===== */}
        <section
          className={\`scene \${activeScene === 1 ? "active" : ""}\`}
          data-scene="1"
        >
          <div className="scene-index">
            <b>01</b>
            <span className="ln"></span> Divisions
          </div>
          <div className="inner relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-[60vh]">
            <span className="eyebrow up" style={{ marginLeft: 'auto', marginRight: 'auto', display: 'flex', width: 'fit-content' }}>Frameworks</span>
            <h2 className="neo-title up d1 text-center" style={{ marginBottom: 40 }}>
              Specialised <em>Pathways</em>.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 up d2">
              <div className="bg-[var(--glass)] border border-[var(--glass-line)] p-10 rounded-[28px] hover:border-[var(--mint)] transition-colors group cursor-pointer backdrop-blur-md" onClick={() => goToScene(2)}>
                 <h3 className="text-3xl font-[var(--serif)] font-light text-[var(--mint)] mb-4 group-hover:scale-[1.02] transition-transform origin-left">Fit with Reshmi</h3>
                 <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                   Clinical nutrition and metabolic reset protocols. By reading the body as an interconnected system, we address the root cause of chronic inflammation, hormonal resistance, and metabolic stagnation.
                 </p>
                 <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink)] flex items-center gap-2 group-hover:text-[var(--mint)] transition-colors">
                    Explore Practice <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                 </div>
              </div>
              <div className="bg-[var(--glass)] border border-[var(--glass-line)] p-10 rounded-[28px] hover:border-[var(--mint)] transition-colors group cursor-pointer backdrop-blur-md" onClick={() => navigate('/breathe')}>
                 <h3 className="text-3xl font-[var(--serif)] font-light text-[var(--mint)] mb-4 group-hover:scale-[1.02] transition-transform origin-left">Breathe with Reshmi</h3>
                 <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                    Somatic regulation and parasympathetic recovery. Guided cadence breathwork sequences designed to lower active cortisol, boost Heart Rate Variability, and restore deep neurological calm.
                 </p>
                 <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink)] flex items-center gap-2 group-hover:text-[var(--mint)] transition-colors">
                    Start Breathing <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                 </div>
              </div>
            </div>
          </div>
        </section>
`;

content = content.replace('{/* ===== SCENE 2 · PRACTICE ===== */}', newScene1 + '\n        {/* ===== SCENE 2 · PRACTICE ===== */}');

// The goToScene calls within the content need updating if they jump to right scene.
// "Explore the AI Lab" was goToScene(5), now it's 6.
content = content.replace(/goToScene\(5\)/g, 'goToScene(6)');

fs.writeFileSync('src/pages/Home.tsx', content);
