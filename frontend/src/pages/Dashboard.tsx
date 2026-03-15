import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, MapPin, Maximize2, BedDouble } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import SupportButton from '../components/SupportButton';
import API from '../services/api';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  title: string;
  price: number;
  address: { street: string; city: string; state: string; pinCode: string };
  images: string[];
  propertyType: string;
  listingType: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'sale' | 'rent'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchUser();
    fetchProperties('', 'all');
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProperties(searchText, activeType), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchText, activeType]);

  const fetchUser = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) setUser(response.data.data);
    } catch (_) {}
  };

  const fetchProperties = async (search: string, type: string) => {
    setLoading(true);
    try {
      const params: any = { status: 'active' };
      if (type === 'sale') params.listingType = 'sale';
      else if (type === 'rent') params.listingType = 'rent';
      if (search.trim()) params.search = search.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const response = await API.get('/properties', { params });
      setProperties(response.data.data || []);
    } catch (_) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchProperties(searchText, activeType);
    setShowFilters(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar user={user} />

      {/* Hero Search */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by area, city or PIN code..."
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              {searchText && (
                <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Properties' },
              { key: 'sale', label: 'For Sale' },
              { key: 'rent', label: 'For Rent' },
            ].map((tab) => (
              <button key={tab.key}
                onClick={() => setActiveType(tab.key as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeType === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Price filter panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">PRICE RANGE</p>
              <div className="flex gap-2 mb-2">
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min ₹" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max ₹" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={applyFilters} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold">Apply</button>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setShowFilters(false); fetchProperties(searchText, activeType); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold">Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
        <p className="text-xs text-gray-400 font-medium">
          {loading ? 'Loading...' : `${properties.length} properties found${searchText ? ` for "${searchText}"` : ''}`}
        </p>
      </div>

      {/* Property Feed */}
      <div className="max-w-3xl mx-auto px-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center mt-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No properties found</h3>
            <p className="text-gray-400 text-sm">
              {searchText ? `No results for "${searchText}"` : 'No properties listed yet'}
            </p>
            {searchText && (
              <button onClick={() => setSearchText('')} className="mt-4 text-blue-600 text-sm font-semibold">Clear search</button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {properties.map((property) => (
              <div key={property._id} onClick={() => navigate(`/property/${property._id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 active:scale-[0.99]">

                {/* Large image */}
                <div className="relative h-56 bg-gray-100">
                  {property.images?.length > 0 ? (
                    <img src={property.images[0]} alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin className="w-12 h-12" />
                    </div>
                  )}
                  {/* Listing type badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                    property.listingType === 'sale' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </div>
                  {/* PIN badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                    <MapPin className="w-3 h-3 inline mr-1" />{property.address.pinCode}
                  </div>
                  {/* Multiple images indicator */}
                  {property.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                      +{property.images.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Property info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 pr-2 line-clamp-1">
                      {property.title}
                    </h3>
                  </div>

                  <p className="text-blue-600 font-bold text-xl mb-2">
                    {formatPrice(property.price)}
                    {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-400">/mo</span>}
                  </p>

                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{property.address.street}, {property.address.city}, {property.address.state}</span>
                  </div>

                  {/* Property stats */}
                  <div className="flex gap-3 pt-3 border-t border-gray-50">
                    {property.area > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{property.area} sq ft</span>
                      </div>
                    )}
                    {property.bedrooms && property.bedrooms > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BedDouble className="w-3.5 h-3.5" />
                        <span>{property.bedrooms} BHK</span>
                      </div>
                    )}
                    <div className="ml-auto">
                      <span className="text-xs text-gray-400 capitalize">{property.propertyType}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SupportButton />
      <BottomNav user={user} />
    </div>
  );
};

export default Dashboard;