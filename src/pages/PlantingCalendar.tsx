import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar as CalendarIcon, Info, Droplets, TrendingUp } from 'lucide-react';
import { COUNTRIES } from '../constants/regions';
import { PLANTING_CALENDAR, CropSchedule } from '../constants/plantingCalendar';
import { dataService } from '../services/dataService';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PlantingCalendar() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  
  // Default to farmer's country
  const countryId = farmer?.country || 'nigeria';
  const country = COUNTRIES.find(c => c.id === countryId);
  const cropsData: CropSchedule[] = PLANTING_CALENDAR[countryId as keyof typeof PLANTING_CALENDAR] || [];

  const currentMonthIndex = new Date().getMonth(); // 0-based
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);

  // Helper to determine if crop is to be planted or harvested in this month (1-based index)
  const isActionMonth = (crop: CropSchedule, action: 'plant' | 'harvest', monthIndex: number) => {
    const monthNum = monthIndex + 1;
    return action === 'plant' 
      ? crop.plantingMonths.includes(monthNum)
      : crop.harvestMonths.includes(monthNum);
  };

  const toPlant = cropsData.filter(crop => isActionMonth(crop, 'plant', selectedMonth));
  const toHarvest = cropsData.filter(crop => isActionMonth(crop, 'harvest', selectedMonth));

  const [monthlyRainfall, setMonthlyRainfall] = useState<number | null>(null);
  const [loadingClimate, setLoadingClimate] = useState(false);

  useEffect(() => {
    async function fetchClimateInfo() {
      if (!farmer?.location) return;
      
      setLoadingClimate(true);
      try {
        const nasaData = await dataService.getAgroclimatology(
          farmer.location.lat, 
          farmer.location.lng
        );
        
        if (nasaData && nasaData.PRECTOTCORR) {
          // NASA returns an object with dates as keys. We'll average it for the month or just show the daily average if 30 days
          const values = Object.values(nasaData.PRECTOTCORR) as number[];
          const avgRainfall = values.reduce((a, b) => a + b, 0) / values.length;
          setMonthlyRainfall(avgRainfall);
        }
      } catch (e) {
        console.error("Climate fetch failed", e);
      } finally {
        setLoadingClimate(false);
      }
    }
    
    fetchClimateInfo();
  }, [farmer?.location]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">📅 Planting Planner</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {country?.name} Crop Calendar
          </h2>
          <p className="text-gray-500 text-sm">
            Discover optimal times for planting and harvesting.
          </p>
        </div>

        {/* Climate Insights */}
        <div className="bg-blue-600 rounded-[2rem] p-6 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-blue-100 font-semibold mb-2">Regional Climate (Past 30 Days)</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                {loadingClimate ? '...' : (monthlyRainfall?.toFixed(1) || '0.0')}
              </span>
              <span className="text-blue-200 mb-1">mm daily avg rainfall</span>
            </div>
            <p className="text-xs text-blue-200 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Source: NASA POWER Point Data
            </p>
          </div>
          <Droplets className="absolute right-[-10%] bottom-[-10%] w-32 h-32 text-blue-500/30 -rotate-12" />
        </div>

        {/* Month Selector */}
        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar mb-6 snap-x">
          {MONTHS.map((month, index) => {
            const isSelected = selectedMonth === index;
            const isCurrent = currentMonthIndex === index;
            
            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(index)}
                className={`snap-center shrink-0 px-6 py-3 rounded-2xl font-semibold transition-all ${
                  isSelected 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm">{month.slice(0, 3)}</div>
                {isCurrent && (
                  <div className={`text-[10px] uppercase mt-1 ${isSelected ? 'text-green-200' : 'text-green-600'}`}>
                    Current
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Sections */}
        <div className="space-y-6">
          {/* Planting Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Ideal for Planting</h3>
            </div>
            
            {toPlant.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {toPlant.map(crop => (
                  <div key={crop.id} className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">
                          {crop.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{crop.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-semibold">Planting</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 leading-snug">{crop.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No major crops recommended for planting in {MONTHS[selectedMonth]}.</p>
              </div>
            )}
          </section>

          {/* Harvesting Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Ready for Harvest</h3>
            </div>
            
            {toHarvest.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {toHarvest.map(crop => (
                  <div key={crop.id} className="bg-white p-5 rounded-3xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">
                          {crop.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{crop.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md font-semibold">Harvest</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No major crops ready for harvest in {MONTHS[selectedMonth]}.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
