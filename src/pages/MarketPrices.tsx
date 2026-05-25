import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Filter,
  RefreshCw
} from 'lucide-react';
import { db } from '../lib/supabase';
import { MarketPrice } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRIES } from '../constants/regions';

export function MarketPrices() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string | null>(null);

  const countryId = farmer?.country || 'nigeria';
  const country = COUNTRIES.find(c => c.id === countryId);
  const currencySymbol = country?.symbol || '₦';

  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.getMarketPrices(undefined, countryId);
      if (result.success) {
        const mappedPrices = (result.data || []).map((p: any) => ({
          id: p.id,
          crop: p.crop,
          country: p.country,
          state: p.state,
          pricePerKg: p.price_per_kg,
          currency: p.currency,
          source: p.source,
          trend: p.trend,
          changePercent: p.change_percent,
          recordedAt: p.recorded_at
        }));
        setPrices(mappedPrices);
      }
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (price.state && price.state.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = !filterState || price.state === filterState;
    return matchesSearch && matchesFilter;
  });

  // Only show regions that actually have data in our prices list
  const activeRegions = Array.from(new Set(prices.map(p => p.state).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-xl font-bold text-gray-900">💰 Market Prices</h1>
            <button 
              onClick={loadPrices}
              className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search crops or ${countryId === 'kenya' ? 'counties' : 'regions'}...`}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-gray-200 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-6 h-6" />
          </button>
        </div>

        {/* Region Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
          <button 
            onClick={() => setFilterState(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${!filterState ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            All {country?.name || 'Country'}
          </button>
          {activeRegions.map(region => (
            <button 
              key={region}
              onClick={() => setFilterState(region)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filterState === region ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Price List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-500">Checking latest prices...</p>
          </div>
        ) : filteredPrices.length > 0 ? (
          <div className="space-y-4">
            {filteredPrices.map((price) => (
              <div key={price.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
                    {price.crop.toLowerCase().includes('maize') ? '🌽' : 
                     price.crop.toLowerCase().includes('rice') ? '🌾' : 
                     price.crop.toLowerCase().includes('tomato') ? '🍅' : 
                     price.crop.toLowerCase().includes('cassava') ? '🥔' : '🌱'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize text-lg leading-tight">{price.crop}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">{price.state || 'National'}</span>
                      <span className="text-[10px] text-gray-400">Source: {price.source}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-xl">{currencySymbol}{price.pricePerKg}/kg</p>
                  <div className={`flex items-center justify-end gap-1 text-sm mt-1 font-semibold ${price.trend === 'up' ? 'text-green-500' : price.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                    {price.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : price.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    <span>{price.changePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-100 rounded-[2rem] border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No prices found for your search in {country?.name}.</p>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">💡 Market Pro-Tip</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Prices are usually highest early in the morning. Check back daily to catch the best trends for your harvest!
          </p>
        </div>
      </main>
    </div>
  );
}
