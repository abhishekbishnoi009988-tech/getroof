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
}

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

  useEffect(() => {
    fetchAllProperties();
  }, [type]);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (type === 'buy') {
        params.listingType = 'sale';
      } else if (type === 'rent') {
        params.listingType = 'rent';
      }

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
      const params: any = {
        pinCode: pinCodeSearch,
      };

      if (type === 'buy') {
        params.listingType = 'sale';
      } else if (type === 'rent') {
        params.listingType = 'rent';
      }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {type === 'buy' ? 'Properties for Sale' : 'Properties for Rent'}
          </h1>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by PIN Code (6 digits)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  pattern="\d{6}"
                  value={pinCodeSearch}
                  onChange={(e) => setPinCodeSearch(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter PIN code (e.g., 302020)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handlePinCodeSearch()}
                />
                {pinCodeSearch && (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handlePinCodeSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="₹0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="₹10,00,00,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => {
                    if (pinCodeSearch) {
                      handlePinCodeSearch();
                    } else {
                      fetchAllProperties();
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setShowFilters(false);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${properties.length} properties found`}
            {pinCodeSearch && ` in PIN code ${pinCodeSearch}`}
          </p>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">
              {pinCodeSearch
                ? `No properties available in PIN code ${pinCodeSearch}`
                : 'Try adjusting your filters or search by PIN code'}
            </p>
            {pinCodeSearch && (
              <button
                onClick={handleClearSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                View All Properties
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                onClick={() => navigate(`/property/${property._id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {/* PIN Code Badge */}
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    📍 {property.address.pinCode}
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.title}</h3>

                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {formatPrice(property.price)}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <p className="flex items-center">
                      <span className="font-semibold mr-2">📍</span>
                      {property.address.city}, {property.address.state}
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold mr-2">📏</span>
                      {property.area} sq ft
                      {property.bedrooms && property.bedrooms > 0 && (
                        <span className="ml-2">• {property.bedrooms} BHK</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/property/${property._id}`);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PropertyList;