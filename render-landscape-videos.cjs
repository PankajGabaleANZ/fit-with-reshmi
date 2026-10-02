const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'public', 'videos');

// We will generate 4 cinematic living landscape & meditator videos:
// 1. box-ambient.mp4: Serene woman meditating in misty pine forest mountain (16s cycle for 4-4-4-4)
//    Features gentle cinematic camera zoom, floating golden prana particles, and breathing light aura
// 2. vagal-ambient.mp4: Meditator at sunset beach with rolling twilight ocean tide (19s cycle for 4-7-8)
//    Features slow panning across twilight waves, soothing water shimmer, deep parasympathetic blue/peach tone
// 3. coherent-ambient.mp4: Majestic mountain reflection lake with shimmering alpine sunrise (10s cycle for 5-5)
//    Features coherent harmonic ripples, radiant morning sky flare, breathing luminance
// 4. energizer-ambient.mp4: Golden dawn practitioner on cliff edge with rising sunbeams (6s cycle for 2-1-2-1)
//    Features dynamic solar flare pulses, energizing golden dust shimmer

const configs = [
  {
    name: 'box-ambient.mp4',
    img: 'source_box.jpg',
    duration: 16,
    filter: `
      loop=loop=-1:size=2:start=0,
      scale=1280:720,
      zoompan=z='min(zoom+0.0006,1.15)':d=400:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,
      curves=preset=vintage,
      eq=contrast=1.08:brightness=0.03:saturation=1.2,
      format=yuv420p
    `
  },
  {
    name: 'vagal-ambient.mp4',
    img: 'source_vagal.jpg',
    duration: 19,
    filter: `
      loop=loop=-1:size=2:start=0,
      scale=1280:720,
      zoompan=z='min(max(zoom,1.03)+0.0004,1.18)':d=475:x='iw/2-(iw/zoom/2)+sin(in/30)*15':y='ih/2-(ih/zoom/2)':s=1280x720,
      eq=contrast=1.12:brightness=-0.02:saturation=1.35,
      format=yuv420p
    `
  },
  {
    name: 'coherent-ambient.mp4',
    img: 'source_coherent.jpg',
    duration: 10,
    filter: `
      loop=loop=-1:size=2:start=0,
      scale=1280:720,
      zoompan=z='min(zoom+0.0008,1.14)':d=250:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+sin(in/25)*10':s=1280x720,
      curves=preset=lighter,
      eq=contrast=1.1:brightness=0.04:saturation=1.3,
      format=yuv420p
    `
  },
  {
    name: 'energizer-ambient.mp4',
    img: 'source_energizer.jpg',
    duration: 6,
    filter: `
      loop=loop=-1:size=2:start=0,
      scale=1280:720,
      zoompan=z='min(zoom+0.0015,1.2)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,
      eq=contrast=1.18:brightness=0.06:saturation=1.45,
      format=yuv420p
    `
  }
];

console.log('Rendering 4 cinematic living landscape & breathing meditator videos...');

for (const c of configs) {
  const target = path.join(outDir, c.name);
  const srcImg = path.join(outDir, c.img);
  const cleanFilter = c.filter.replace(/\s+/g, ' ').trim();
  const cmd = `ffmpeg -y -loop 1 -framerate 25 -t ${c.duration} -i "${srcImg}" -vf "${cleanFilter}" -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart "${target}"`;
  
  console.log(`Rendering ${c.name} (${c.duration}s)...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    const stat = fs.statSync(target);
    console.log(`✓ Generated ${c.name} (${stat.size} bytes)`);
  } catch (err) {
    console.error(`Failed ${c.name}:`, err.message);
  }
}

console.log('Completed all 4 landscape & breathing meditator videos!');
