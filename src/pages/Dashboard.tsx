import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  Scan, 
  PlusCircle, 
  Calendar, 
  BookOpen,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { Crop, MarketPrice, WeatherData } from '../types';
import { getCurrencySymbol, COUNTRIES } from '../constants/regions';
import { dataService } from '../services/dataService';

export function Dashboard() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const countryId = farmer?.country || 'nigeria';
  const currencySymbol = getCurrencySymbol(countryId);
  const country = COUNTRIES.find(c => c.id === countryId);

  useEffect(() => {
    async function loadDashboardData() {
      if (!farmer) return;

      try {
        setLoading(true);
        
        // Load crops
        const cropsResult = await db.getCrops(farmer.id);
        if (cropsResult.success && cropsResult.data) {
          setCrops(cropsResult.data.map(c => ({
            id: c.id,
            farmerId: c.farmer_id,
            cropName: c.cropName,
            variety: c.variety,
            status: c.status as 'active' | 'harvested' | 'failed',
            plantedDate: c.created_at,
            createdAt: c.created_at
          })));
        }

        // Load market prices for the farmer's country
        const pricesResult = await db.getMarketPrices(undefined, countryId);
        if (pricesResult.success && pricesResult.data) {
          setMarketPrices(pricesResult.data.map((p: any) => ({
            id: p.id,
            crop: p.crop,
            country: p.country,
            state: p.state,
            pricePerKg: p.price_per_kg,
            currency: p.currency,
            source: p.source,
            trend: p.trend as 'up' | 'down' | 'stable',
            changePercent: p.change_percent,
            recordedAt: p.recorded_at
          })));
        }

        // Fetch real weather using dataService
        const lat = farmer.location?.lat || 9.0820; // Default to Nigeria center if no location
        const lng = farmer.location?.lng || 8.6753;
        
        const liveWeather = await dataService.getCurrentWeather(
          lat, 
          lng, 
          farmer.state || country?.name || 'Local Region'
        );
        
        if (liveWeather) {
          setWeather(liveWeather);
        } else {
          // Fallback to mock if API fails
          setWeather({
            location: { lat, lng, name: farmer.state || 'Unknown' },
            current: {
              temperature: 30,
              condition: 'Sunny',
              humidity: 60,
              windSpeed: 10
            },
            forecast: [],
            alerts: []
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [farmer, countryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-600 text-white pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Hello, {farmer?.name || 'Farmer'}!</h1>
              <p className="text-green-100 italic">"Good luck with your harvest in {farmer?.state || country?.name} today"</p>
            </div>
            <div className="bg-green-500/30 p-2 rounded-full backdrop-blur-sm">
              <Cloud className="w-8 h-8" />
            </div>
          </div>

          {/* Weather Widget Mini */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Thermometer className="w-5 h-5 text-orange-300" />
              <div>
                <p className="text-sm text-green-100">Temp</p>
                <p className="font-bold text-lg">{weather?.current?.temperature}°C</p>
              </div>
            </div>
            <div className="h-8 w-px bg-green-400/30"></div>
            <div className="flex items-center gap-4">
              <Droplets className="w-5 h-5 text-blue-300" />
              <div>
                <p className="text-sm text-green-100">Humidity</p>
                <p className="font-bold text-lg">{weather?.current?.humidity}%</p>
              </div>
            </div>
            <div className="h-8 w-px bg-green-400/30"></div>
            <div className="flex items-center gap-4">
              <Cloud className="w-5 h-5 text-white" />
              <div>
                <p className="text-sm text-green-100">Sky</p>
                <p className="font-bold text-lg">{weather?.current?.condition}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 -mt-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => navigate('/disease-detection')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 transition-transform active:scale-95 hover:shadow-md"
          >
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Scan className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">Scan Crop</span>
          </button>
          <button 
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 transition-transform active:scale-95 hover:shadow-md"
          >
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">Add Crop</span>
          </button>
        </div>

        {/* Market Price Alerts */}
        <div 
          onClick={() => navigate('/market-prices')}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-8 flex items-start gap-4 cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="bg-orange-200 p-2 rounded-lg text-orange-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900">Market Price Alert</h3>
            <p className="text-sm text-orange-800">
              {marketPrices.length > 0 
                ? `${marketPrices[0].crop} prices in ${marketPrices[0].state || country?.name} are up. Consider selling soon!`
                : `Check the latest crop prices in ${country?.name}.`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-400 self-center" />
        </div>

        {/* My Crops Summary */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Crops</h2>
            <button className="text-green-600 font-semibold text-sm">View All</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {crops.length > 0 ? (
              crops.map((crop) => (
                <div key={crop.id} className="min-w-[160px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl mb-3">
                    {crop.cropName.toLowerCase().includes('maize') ? '🌽' : 
                     crop.cropName.toLowerCase().includes('rice') ? '🌾' : 
                     crop.cropName.toLowerCase().includes('tomato') ? '🍅' : '🌱'}
                  </div>
                  <h3 className="font-bold text-gray-900 capitalize">{crop.cropName}</h3>
                  <p className="text-xs text-gray-500 mb-2">{crop.status}</p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-2/3"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">Planted {new Date(crop.plantedDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No crops added yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Market Trends */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Market Trends</h2>
            <button 
              onClick={() => navigate('/market-prices')}
              className="text-green-600 font-semibold text-sm"
            >
              Analyze
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {marketPrices.length > 0 ? marketPrices.slice(0, 3).map((price) => (
              <div key={price.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 capitalize">{price.crop}</h4>
                    <p className="text-xs text-gray-500">{price.state || country?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{currencySymbol}{price.pricePerKg}/kg</p>
                  <p className={`text-xs ${price.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {price.trend === 'up' ? '↑' : '↓'} {price.changePercent}%
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                Check market prices for {country?.name}
              </div>
            )}
          </div>
        </section>

        {/* Additional Features */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/planting-calendar')}
            className="bg-emerald-50 p-4 rounded-2xl flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-shadow active:scale-95"
          >
            <Calendar className="w-8 h-8 text-emerald-600 mb-2" />
            <div>
              <h3 className="font-bold text-emerald-900 leading-tight">Planting Calendar</h3>
              <p className="text-xs text-emerald-700 mt-1">Best time for planting</p>
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl flex flex-col justify-between aspect-square">
            <BookOpen className="w-8 h-8 text-indigo-600 mb-2" />
            <div>
              <h3 className="font-bold text-indigo-900 leading-tight">Farm Advisor</h3>
              <p className="text-xs text-indigo-700 mt-1">Chat with AI Expert</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-20">
        <button className="flex flex-col items-center gap-1 text-green-600" onClick={() => navigate('/dashboard')}>
          <ChevronRight className="-rotate-90 w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Scan className="w-6 h-6" />
          <span className="text-[10px]">Scans</span>
        </button>
        <button 
          onClick={() => navigate('/planting-calendar')}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px]">Planner</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px]">Advice</span>
        </button>
      </nav>
    </div>
  );
}
