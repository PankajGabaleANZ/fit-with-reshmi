import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const sIdx = content.indexOf('const INSTAGRAM_REELS = [');
const eIdx = content.indexOf('];\n\nexport default function Home() {');

if (sIdx !== -1 && eIdx !== -1) {
    const newArray = `const INSTAGRAM_REELS = [
  {
    id: 'insulin-resistance',
    title: 'The Fasting Insulin Scandal',
    views: '84.2K',
    likes: '4.8K',
    comments: 324,
    thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351166?q=80&w=600',
    duration: '0:58',
    instagramUrl: 'https://www.instagram.com/p/DZGUyzSz9E2/'
  },
  {
    id: 'ectopic-fat',
    title: 'The Truth About Ectopic Fat',
    views: '112.5K',
    likes: '8.1K',
    comments: 512,
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    duration: '0:45',
    instagramUrl: 'https://www.instagram.com/p/DYrEcHmz0ig/'
  },
  {
    id: 'thyroid-conversion',
    title: 'Thyroid T4 to Active T3 Conversion',
    views: '65.1K',
    likes: '3.2K',
    comments: 198,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    duration: '0:51',
    instagramUrl: 'https://www.instagram.com/p/DYSXZ7CTo-i/'
  },
  {
    id: 'sleep-metabolism',
    title: 'Sleep Airway Resilience & Fat Loss',
    views: '93.7K',
    likes: '5.4K',
    comments: 410,
    thumbnail: 'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?q=80&w=600',
    duration: '0:55',
    instagramUrl: 'https://www.instagram.com/p/DX2WzLVTIXO/'
  },
  {
    id: 'gut-brain',
    title: 'Gut-Brain Axis Optimization',
    views: '142.1K',
    likes: '6.2K',
    comments: 512,
    thumbnail: 'https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=600',
    duration: '1:12',
    instagramUrl: 'https://www.instagram.com/p/DXjwniiE2so/'
  }
`;
    content = content.substring(0, sIdx) + newArray + content.substring(eIdx);
    fs.writeFileSync('src/pages/Home.tsx', content);
    console.log("Replaced INSTAGRAM_REELS");
} else {
    console.log("Could not find bounds");
}
