import fs from 'fs';

const content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const sHero = content.indexOf('      {/* Hero Section - Futuristic & Minimalist / Health Is Freedom Concept */}');
const sMissingLink = content.indexOf('      {/* Interactive Section 1: THE MISSING LINK - Biomarker Ranges */}');
const sTurningPoint = content.indexOf('      {/* Interactive Section 2: THE TURNING POINT - story of Reshmi */}');
const sTimeline = content.indexOf('      {/* Interactive Section 3: CLINICAL EVOLUTION - TIMELINE */}');
const sAbout = content.indexOf('      {/* Interactive Section 4: ABOUT MY WORK - Credentials */}');
const sSleep = content.indexOf('      {/* Interactive Section 5: CLINICAL SLEEP & BREATH QUALITY HUB - STOP BANG (New requested calculator) */}');

if (sHero === -1 || sMissingLink === -1 || sTurningPoint === -1 || sTimeline === -1 || sAbout === -1 || sSleep === -1) {
  console.error("Could not find all sections!");
  console.log({sHero, sMissingLink, sTurningPoint, sTimeline, sAbout, sSleep});
  process.exit(1);
}

const partPreHero = content.substring(0, sHero);
let partHero = content.substring(sHero, sMissingLink);
const partMissingLink = content.substring(sMissingLink, sTurningPoint);
const partTurningPoint = content.substring(sTurningPoint, sTimeline);
const partTimeline = content.substring(sTimeline, sAbout);
let partAbout = content.substring(sAbout, sSleep);
const partRest = content.substring(sSleep);

// Modify About to be the Hero
partAbout = partAbout.replace('class="py-24 bg-mashiro relative"', 'className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16"');
partAbout = partAbout.replace('<section className="py-24 bg-mashiro relative">', '<section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16">');
partAbout = partAbout.replace('{/* Interactive Section 4: ABOUT MY WORK - Credentials */}', '{/* Hero Section: About Reshmi Verma (Brand Precedence) */}');
partAbout = partAbout.replace('className="bg-sakura/30 rounded-[3.5rem] p-8 sm:p-16 border border-sakura shadow-xl relative overflow-hidden"', 'className="w-full relative"');
partAbout = partAbout.replace('col-span-1 lg:col-span-12 xl:col-span-5', 'col-span-1 lg:col-span-12 xl:col-span-5'); // Or keep same, maybe just remove bg
partAbout = partAbout.replace('text-3xl sm:text-5xl font-serif', 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-extrabold tracking-tight');

// Modify Hero to be a standard section
partHero = partHero.replace('<section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16">', '<section className="py-24 bg-mashiro relative">');
partHero = partHero.replace('{/* Hero Section - Futuristic & Minimalist / Health Is Freedom Concept */}', '{/* Section: Defining Health is Freedom */}');
partHero = partHero.replace('text-4xl sm:text-6xl md:text-7xl lg:text-8xl', 'text-3xl sm:text-5xl md:text-6xl');

const newContent = partPreHero + 
                   partAbout + 
                   partTurningPoint + 
                   partHero + 
                   partMissingLink + 
                   partTimeline + 
                   partRest;

fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log("Reordered successfully!");
