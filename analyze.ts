import * as fs from 'fs';

const content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Array to store indices of sections
const markers = [
  '{/* Hero Section: About Reshmi Verma (Brand Precedence) */}',
  '{/* Section: Defining Health is Freedom */}',
  '{/* Interactive Section 2: THE TURNING POINT - story of Reshmi */}',
  '{/* Interactive Section 1: THE MISSING LINK - Biomarker Ranges */}',
  '{/* Interactive Section 3: CLINICAL EVOLUTION - TIMELINE */}',
  '{/* Interactive Section 5: CLINICAL SLEEP & BREATH QUALITY HUB - STOP BANG (New requested calculator) */}',
  '{/* Interactive Section 6: Instagram Reels Simulation */}',
  '{/* Interactive Section 7: Precision Coaching Categories */}',
  '{/* Core Value / Philosophy separator */}',
  '<AILab />',
  '{/* Final Premium CTA Section */}',
  '      <Footer />' // to know where it ends
];

const indices = markers.map(m => {
  const i = content.indexOf(m);
  return { marker: m, index: i };
});

indices.sort((a, b) => a.index - b.index);

indices.forEach(idx => console.log(idx.index + " : " + idx.marker));
