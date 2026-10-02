const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// In ffmpeg geq filter, time variable is 'T', not 't'.
// Even better and smoother: combining mandelbrot / testsrc / cellauto / color + curves / gradients / hues
// Let's create gorgeous, silky ambient loops using lavfi filters:

const videos = [
  {
    name: 'box-ambient.mp4',
    desc: 'Deep Forest Zen & Jade Canopy',
    duration: 16,
    cmd: `ffmpeg -y -f lavfi -i "color=c=#0f1f1a:s=720x720:r=25" -f lavfi -i "mandelbrot=s=720x720:rate=25:maxiter=120:start_scale=0.8:end_scale=1.4" -filter_complex "[1:v]format=gbrp,colorchannelmixer=rr=0.1:rg=0.45:rb=0.25:gr=0.2:gg=0.6:gb=0.3:br=0.1:bg=0.3:bb=0.2,boxblur=25:3[mb];[0:v][mb]blend=all_mode=screen:all_opacity=0.65,curves=vintage,hue=s=1.2:h=25" -t 16 -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart "${path.join(outDir, 'box-ambient.mp4')}"`
  },
  {
    name: 'vagal-ambient.mp4',
    desc: 'Twilight Indigo Ocean Waves & Moonlit Tides',
    duration: 19,
    cmd: `ffmpeg -y -f lavfi -i "color=c=#0c1124:s=720x720:r=25" -f lavfi -i "life=s=720x720:rate=25:rule=B3/S23:mold=10:grain=0.3" -filter_complex "[1:v]format=gbrp,colorchannelmixer=rr=0.15:rg=0.25:rb=0.7:gr=0.1:gg=0.3:gb=0.8:br=0.2:bg=0.4:bb=0.9,boxblur=30:3[waves];[0:v][waves]blend=all_mode=screen:all_opacity=0.75,hue=h=-35:s=1.4" -t 19 -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart "${path.join(outDir, 'vagal-ambient.mp4')}"`
  },
  {
    name: 'coherent-ambient.mp4',
    desc: 'Warm Golden Dawn & Harmonic Prana Rings',
    duration: 10,
    cmd: `ffmpeg -y -f lavfi -i "color=c=#241610:s=720x720:r=25" -f lavfi -i "cellauto=s=720x720:rate=25:rule=30:scroll=1" -filter_complex "[1:v]format=gbrp,colorchannelmixer=rr=0.8:rg=0.5:rb=0.2:gr=0.7:gg=0.4:gb=0.1:br=0.4:bg=0.2:bb=0.1,boxblur=28:3[gold];[0:v][gold]blend=all_mode=screen:all_opacity=0.7,curves=preset=lighter,hue=s=1.3:h=15" -t 10 -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart "${path.join(outDir, 'coherent-ambient.mp4')}"`
  },
  {
    name: 'energizer-ambient.mp4',
    desc: 'Radiant Solar Fire & Vital Morning Chi',
    duration: 6,
    cmd: `ffmpeg -y -f lavfi -i "color=c=#2d0f0c:s=720x720:r=25" -f lavfi -i "mandelbrot=s=720x720:rate=25:maxiter=140:start_scale=1.5:end_scale=2.2" -filter_complex "[1:v]format=gbrp,colorchannelmixer=rr=0.95:rg=0.3:rb=0.15:gr=0.8:gg=0.25:gb=0.1:br=0.5:bg=0.15:bb=0.1,boxblur=22:2[fire];[0:v][fire]blend=all_mode=screen:all_opacity=0.8,hue=h=-10:s=1.5" -t 6 -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart "${path.join(outDir, 'energizer-ambient.mp4')}"`
  }
];

for (const v of videos) {
  console.log(`Generating ${v.name} (${v.desc})...`);
  try {
    execSync(v.cmd, { stdio: 'inherit' });
    const stat = fs.statSync(path.join(outDir, v.name));
    console.log(`✓ Generated ${v.name}: ${stat.size} bytes`);
  } catch (err) {
    console.error(`Failed ${v.name}:`, err.message);
  }
}
