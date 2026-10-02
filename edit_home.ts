import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove state
content = content.replace(
  /  const \[selectedReel.*useState.*null\);\n  const \[isMuted.*useState.*true\);\n  const \[hasLiked.*useState.*\{\}\);\n\n  const toggleLikeReel[\s\S]*?false;\n/,
  ''
);

// 2. Add Booking Button in Hero
content = content.replace(
  '<div className="pt-6">',
  '<div className="pt-6 flex flex-wrap gap-4">'
);
content = content.replace(
  '<button\n                    onClick={() => setIsAILabOpen(true)}\n                    className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-full text-mashiro bg-momo hover:scale-105 transition-all shadow-xl"\n                  >\n                    Enter Interactive AI Lab\n                  </button>',
  `<button
                    onClick={() => setIsAILabOpen(true)}
                    className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-full text-mashiro bg-momo hover:scale-105 transition-all shadow-xl"
                  >
                    Enter Interactive AI Lab
                  </button>
                  <Link
                    to="/booking"
                    className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-full text-momo bg-sakura hover:scale-105 transition-all shadow-xl border border-momo/20"
                  >
                    Book A Consultation
                  </Link>`
);

// 3. Reels Section update
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">'
);

content = content.replace(
  /const liked = hasLiked\[reel\.id\] \?\? false;/,
  ''
);

// We need to change <motion.div... onClick={() => setSelectedReel(reel)}> to <a href={reel.instagramUrl} target="_blank"> wrapper around motion.div 
// Actually, better to change the motion.div to motion.a
content = content.replace(
  /className="group relative aspect-\[9\/16\] rounded-\[2\.5rem\] overflow-hidden shadow-xl border border-sakura bg-mashiro flex flex-col justify-end cursor-pointer"\n                  onClick=\{.*setSelectedReel.*\}/,
  `className="group relative aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-xl border border-sakura bg-mashiro flex flex-col justify-end cursor-pointer"
                  href={reel.instagramUrl}
                  target="_blank"
                  rel="noreferrer"`
);
content = content.replace(
  /onClick=\{.*setSelectedReel.*\}/,
  `` // just in case
)

// Wait, the tag is currently <motion.div, we should change it to <motion.a
content = content.replace(
  '<motion.div\n                  key={reel.id}\n                  whileHover={{ y: -6, scale: 1.02 }}\n                  transition={{ duration: 0.3 }}',
  '<motion.a\n                  key={reel.id}\n                  whileHover={{ y: -6, scale: 1.02 }}\n                  transition={{ duration: 0.3 }}'
);
content = content.replace(
  /<\/div>\n\n                <\/motion\.div>/g,
  `<\/div>\n\n                <\/motion.a>`
);

// 4. Remove Modal
const sIdx = content.indexOf('{/* Dynamic Interactive Video Player Lightbox Modal */}');
const eIdx = content.indexOf('</section>', Math.max(0, sIdx));
if (sIdx !== -1 && eIdx !== -1) {
    content = content.substring(0, sIdx) + content.substring(eIdx);
}

// Write back
fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Done");
