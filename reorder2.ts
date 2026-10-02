import fs from 'fs';

const content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const sAbout = content.indexOf('      {/* Hero Section: About Reshmi Verma (Brand Precedence) */}');
const sTurningPoint = content.indexOf('      {/* Interactive Section 2: THE TURNING POINT - story of Reshmi */}');
const sHealthIsFreedom = content.indexOf('      {/* Section: Defining Health is Freedom */}');
const sMissingLink = content.indexOf('      {/* Interactive Section 1: THE MISSING LINK - Biomarker Ranges */}');

if (sAbout === -1 || sTurningPoint === -1 || sHealthIsFreedom === -1 || sMissingLink === -1) {
  console.error("Tags not found");
  process.exit(1);
}

const partPre = content.substring(0, sAbout);
const partAbout = content.substring(sAbout, sTurningPoint);
const partTurningPoint = content.substring(sTurningPoint, sHealthIsFreedom);
const partHealthIsFreedom = content.substring(sHealthIsFreedom, sMissingLink);
const partRest = content.substring(sMissingLink);

// Reorder:
// 1. About
// 2. Health Is Freedom
// 3. Turning Point

// Let's modify the background colors to maintain visual separation
let modHealthIsFreedom = partHealthIsFreedom.replace('py-24 bg-mashiro relative', 'py-24 bg-sakura/10 relative');
let modTurningPoint = partTurningPoint.replace('py-24 bg-sakura/10 relative', 'py-24 bg-mashiro relative');

const newContent = partPre + partAbout + modHealthIsFreedom + modTurningPoint + partRest;

fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log("Reordered.");
