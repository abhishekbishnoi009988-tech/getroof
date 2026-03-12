import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Layout/Footer';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  images: string[];
  propertyType: string;
  listingType: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  // Hostel/PG fields
  hostelName?: string;
  gender?: string;
  hostelAmenities?: string[];
  timings?: string;
}

const rentCategories = [
  { key: 'all', label: 'All', emoji: '🏘️' },
  { key: 'house', label: 'Houses', emoji: '🏠' },
  { key: 'hostel', label: 'Hostels', emoji: '🏨' },
  { key: 'pg', label: 'PG', emoji: '🛏️' },
];

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'buy';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [pinCodeSearch, setPinCodeSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [rentCategory, setRentCategory] = useState<'all' | 'house' | 'hostel' | 'pg'>('all');

  useEffect(() => {
    fetchAllProperties();
  }, [type]);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (type === 'buy') params.listingType = 'sale';
      else if (type === 'rent') params.listingType = 'rent';
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const response = await API.get('/properties', { params });
      setProperties(response.data.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePinCodeSearch = async () => {
    if (!/^\d{6}$/.test(pinCodeSearch)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    setLoading(true);
    try {
      const params: any = { pinCode: pinCodeSearch };
      if (type === 'buy') params.listingType = 'sale';
      else if (type === 'rent') params.listingType = 'rent';
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const response = await API.get('/properties', { params });
      setProperties(response.data.data || []);
      if (response.data.count === 0) {
        toast.error(`No properties found in PIN code ${pinCodeSearch}`);
      } else {
        toast.success(`Found ${response.data.count} properties in PIN code ${pinCodeSearch}`);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setPinCodeSearch('');
    fetchAllProperties();
  };

  // Filter properties by rent category
  const filteredProperties = type === 'rent' && rentCategory !== 'all'
    ? properties.filter((p) => {
        if (rentCategory === 'house') return p.propertyType !== 'hostel' && p.propertyType !== 'pg';
        return p.propertyType === rentCategory;
      })
    : properties;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const genderLabel = (g?: string) => {
    if (!g) return '';
    if (g === 'boys') return '👦 Boys Only';
    if (g === 'girls') return '👧 Girls Only';
    if (g === 'coed') return '👫 Co-ed';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {type === 'buy' ? '🏠 Properties for Sale' : '🏘️ Properties for Rent'}
          </h1>
          <p className="text-gray-500 text-sm mb-4">Find your perfect property by PIN code</p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              maxLength={6}
              pattern="\d{6}"
              value={pinCodeSearch}
              onChange={(e) => setPinCodeSearch(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit PIN code (e.g., 302020)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handlePinCodeSearch()}
            />
            <div className="flex gap-2">
              <button onClick={handlePinCodeSearch} disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2 text-base">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
              {pinCodeSearch && (
                <button onClick={handleClearSearch}
                  className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 border border-gray-200">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-medium text-sm ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}>
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-semibold mb-3 text-gray-800">💰 Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="₹0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                  <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="₹10Cr"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => { if (pinCodeSearch) handlePinCodeSearch(); else fetchAllProperties(); }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">Apply Filters</button>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setShowFilters(false); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm">Clear</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Rent Category Icon Row ── */}
        {type === 'rent' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex justify-center gap-4 sm:gap-8">
              {rentCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setRentCategory(cat.key as any)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all ${
                    rentCategory === cat.key
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 px-1">
          <p className="text-gray-500 text-sm">
            {loading ? '🔍 Searching...' : `✅ ${filteredProperties.length} properties found`}
            {pinCodeSearch && ` in PIN code ${pinCodeSearch}`}
            {type === 'rent' && rentCategory !== 'all' && ` · ${rentCategories.find(c => c.key === rentCategory)?.label}`}
          </p>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">
              {rentCategory === 'hostel' ? '🏨' : rentCategory === 'pg' ? '🛏️' : '🏠'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">
              {pinCodeSearch
                ? `No properties available in PIN code ${pinCodeSearch}`
                : rentCategory !== 'all'
                ? `No ${rentCategories.find(c => c.key === rentCategory)?.label} available yet`
                : 'Try adjusting your filters or search by PIN code'}
            </p>
            {(pinCodeSearch || rentCategory !== 'all') && (
              <button onClick={() => { handleClearSearch(); setRentCategory('all'); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium">
                View All Properties
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map((property) => {
              const isHostelOrPG = property.propertyType === 'hostel' || property.propertyType === 'pg';
              return (
                <div key={property._id} onClick={() => navigate(`/property/${property._id}`)}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100">

                  {/* Property Image */}
                  <div className="relative h-52 bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        {property.propertyType === 'hostel' ? '🏨' : property.propertyType === 'pg' ? '🛏️' : '🏠'}
                      </div>
                    )}
                    {/* PIN Code Badge */}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      📍 {property.address.pinCode}
                    </div>
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 bg-white text-xs font-bold shadow-md px-2 py-1 rounded-full">
                      {property.propertyType === 'hostel' ? '🏨 Hostel'
                        : property.propertyType === 'pg' ? '🛏️ PG'
                        : property.listingType === 'sale' ? '🏷️ For Sale' : '🔑 For Rent'}
                    </div>
                    {/* Gender badge for hostel/pg */}
                    {isHostelOrPG && property.gender && property.gender !== 'any' && (
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        {genderLabel(property.gender)}
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    {/* Hostel Name */}
                    {isHostelOrPG && property.hostelName && (
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{property.hostelName}</p>
                    )}

                    <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{property.title}</h3>

                    <p className="text-xl font-bold text-blue-600 mb-3">
                      {formatPrice(property.price)}
                      {property.listingType === 'rent' && (
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-lg border border-gray-100">
                        📍 {property.address.city}, {property.address.state}
                      </span>
                      {!isHostelOrPG && (
                        <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-lg border border-gray-100">
                          📏 {property.area} sq ft
                        </span>
                      )}
                      {!isHostelOrPG && property.bedrooms && property.bedrooms > 0 && (
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg border border-blue-100 font-medium">
                          🛏️ {property.bedrooms} BHK
                        </span>
                      )}
                      {/* Hostel amenity pills — show first 2 */}
                      {isHostelOrPG && property.hostelAmenities && property.hostelAmenities.slice(0, 2).map((a) => (
                        <span key={a} className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-lg border border-orange-100 font-medium">
                          ✓ {a}
                        </span>
                      ))}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}`); }}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PropertyList;