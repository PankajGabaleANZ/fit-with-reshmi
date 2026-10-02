export const BIOMARKERS = [
  {
    id: 'insulin',
    name: 'Fasting Insulin',
    unit: 'µIU/mL',
    conventionalMin: 2,
    conventionalMax: 25,
    functionalMin: 2,
    functionalMax: 5,
    sliderMin: 0,
    sliderMax: 30,
    sliderStep: 0.5,
    subtitle: 'Direct driver of metabolic health, silent cellular inflammation, sleep quality, and sugar crashes.',
    conventionalText: 'Conventional pathology allows levels up to 25 µIU/mL before flagging disease, leaving insulin-resistant blockages untreated for years.',
    functionalText: 'We target < 5 µIU/mL to prevent subclinical fat storage, preserve pancreatic cell longevity, and sustain reliable fat-burning speed.'
  },
  {
    id: 'tsh',
    name: 'Thyroid Stimulating Hormone (TSH)',
    unit: 'µIU/mL',
    conventionalMin: 0.45,
    conventionalMax: 4.5,
    functionalMin: 1.0,
    functionalMax: 2.0,
    sliderMin: 0.1,
    sliderMax: 10.0,
    sliderStep: 0.1,
    subtitle: 'The master regulator of baseline metabolic output, cognitive energy, and hormone feedback loops.',
    conventionalText: 'A massive conventional window of 0.45 - 4.5 µIU/mL keeps millions suffering from unexplained fatigue and cold hands marked as "normal."',
    functionalText: 'Clinically targeting a narrow 1.0 - 2.0 µIU/mL secures maximum baseline oxygen delivery and constant daily biological recovery.'
  },
  {
    id: 'ferritin',
    name: 'Ferritin (Iron Reserve)',
    unit: 'ng/mL',
    conventionalMin: 15,
    conventionalMax: 150,
    sliderMin: 5,
    sliderMax: 250,
    sliderStep: 1,
    subtitle: 'The cellular iron battery that direct-fuels oxygen transport and mitochondrial energy (ATP) generation.',
    conventionalText: 'A conventional threshold as low as 15 ng/mL permits intense physical fatigue before classical pathology diagnoses clinical anemia.',
    functionalMin: 50,
    functionalMax: 100,
    functionalText: 'Optimising to 50 - 100 ng/mL provides structural raw material for thyroid enzymatic conversion and deep cellular endurance.'
  },
  {
    id: 'vitD',
    name: 'Active Vitamin D3',
    unit: 'ng/mL',
    conventionalMin: 20,
    conventionalMax: 100,
    sliderMin: 10,
    sliderMax: 150,
    sliderStep: 1,
    subtitle: 'A structural secosteroid hormone that governs cellular genetic transcription and multi-organ immune response.',
    conventionalText: '20 ng/mL seeks purely to prevent basic bone softening, completely ignoring active modern immunity and endocrine balance.',
    functionalMin: 60,
    functionalMax: 90,
    functionalText: 'Maintaining a 60 - 90 ng/mL zone serves to unlock deep gene transcription, guard mucosal surfaces, and support hormonal pathways.'
  }
];

// Reels shown on the home page. Paste a reel link (tracking parameters are ignored); newest first.
export const INSTAGRAM_REEL_URLS: string[] = [
  'https://www.instagram.com/reel/Dd4Vo8Fz8ka/',
];

// Legacy placeholder data (no longer used by the home page).
export const INSTAGRAM_REELS = [
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
];