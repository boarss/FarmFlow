

export const COUNTRIES = [
  { id: 'nigeria', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { id: 'ghana', name: 'Ghana', currency: 'GHS', symbol: '₵' },
  { id: 'kenya', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { id: 'mali', name: 'Mali', currency: 'XOF', symbol: 'CFA' },
] as const;

export const REGIONS: Record<string, string[]> = {
  nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ],
  ghana: [
    'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Northern', 
    'Upper East', 'Upper West', 'Volta', 'Bono', 'Bono East', 'Ahafo', 
    'Savannah', 'North East', 'Oti', 'Western North'
  ],
  kenya: [
    'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Uasin Gishu', 'Kisumu', 
    'Machakos', 'Kajiado', 'Kilifi', 'Kakamega', 'Meru', 'Nyeri', 'Kericho'
  ],
  mali: [
    'Kayes', 'Koulikoro', 'Sikasso', 'Ségou', 'Mopti', 'Tombouctou', 
    'Gao', 'Kidal', 'Taoudénit', 'Ménaka', 'Bamako'
  ]
};

export const getCurrencySymbol = (countryId: string) => {
  return COUNTRIES.find(c => c.id === countryId)?.symbol || '₦';
};
