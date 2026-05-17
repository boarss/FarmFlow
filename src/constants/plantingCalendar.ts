export interface CropSchedule {
  id: string;
  name: string;
  icon: string;
  plantingMonths: number[]; // 1-12 where 1 = Jan
  harvestMonths: number[]; // 1-12
  notes: string;
}

export const PLANTING_CALENDAR: Record<string, CropSchedule[]> = {
  nigeria: [
    {
      id: 'maize',
      name: 'Maize',
      icon: '🌽',
      plantingMonths: [3, 4, 5, 8],
      harvestMonths: [6, 7, 8, 11, 12],
      notes: 'Plant early with first rains (March/April) or late season (August).'
    },
    {
      id: 'cassava',
      name: 'Cassava',
      icon: '🥔',
      plantingMonths: [4, 5, 6, 7, 8, 9, 10],
      harvestMonths: [1, 2, 3, 4, 11, 12],
      notes: 'Planted almost year-round depending on the region. Harvest 9-18 months after planting.'
    },
    {
      id: 'rice',
      name: 'Rice (Rainfed)',
      icon: '🌾',
      plantingMonths: [5, 6],
      harvestMonths: [9, 10, 11],
      notes: 'Upland and lowland rainfed rice generally planted when rains are established.'
    },
    {
      id: 'tomato',
      name: 'Tomato',
      icon: '🍅',
      plantingMonths: [8, 9, 10],
      harvestMonths: [11, 12, 1, 2],
      notes: 'Commonly planted towards the end of rains for dry season irrigation harvest.'
    }
  ],
  ghana: [
    {
      id: 'maize',
      name: 'Maize',
      icon: '🌽',
      plantingMonths: [3, 4, 8, 9],
      harvestMonths: [7, 8, 12, 1],
      notes: 'Major season in March/April, minor season in August/September.'
    },
    {
      id: 'cocoa',
      name: 'Cocoa (Seedlings)',
      icon: '🍫',
      plantingMonths: [5, 6, 7],
      harvestMonths: [10, 11, 12, 1], // Main crop
      notes: 'Transplanting best done early in the major rainy season. Main harvest Oct-Jan.'
    },
    {
      id: 'yam',
      name: 'Yam',
      icon: '🍠',
      plantingMonths: [2, 3, 4],
      harvestMonths: [8, 9, 10, 11],
      notes: 'Mound preparation in dry season, planting before heavy rains.'
    }
  ],
  kenya: [
    {
      id: 'maize',
      name: 'Maize',
      icon: '🌽',
      plantingMonths: [3, 4],      // Long rains
      harvestMonths: [7, 8, 9],
      notes: 'Usually planted at the onset of "long rains" in March-May.'
    },
    {
      id: 'beans',
      name: 'Common Beans',
      icon: '🫘',
      plantingMonths: [3, 4, 10, 11],
      harvestMonths: [6, 7, 1, 2],
      notes: 'Often intercropped. Two main seasons (long rains and short rains).'
    },
    {
      id: 'tea',
      name: 'Tea',
      icon: '🍃',
      plantingMonths: [4, 5, 10, 11],
      harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      notes: 'Harvested heavily year-round but peak flashes coincide with rains.'
    }
  ],
  mali: [
    {
      id: 'cotton',
      name: 'Cotton',
      icon: '🧵',
      plantingMonths: [6, 7],
      harvestMonths: [10, 11, 12],
      notes: 'Cash crop planted beginning of rainy season.'
    },
    {
      id: 'millet',
      name: 'Millet',
      icon: '🌾',
      plantingMonths: [6, 7],
      harvestMonths: [9, 10],
      notes: 'Drought resistant, essential staple for the Sahel.'
    },
    {
      id: 'sorghum',
      name: 'Sorghum',
      icon: '🎋',
      plantingMonths: [6, 7],
      harvestMonths: [10, 11],
      notes: 'Planted with the main rains.'
    }
  ]
};
