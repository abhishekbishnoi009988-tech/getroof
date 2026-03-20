import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Maximize2, BedDouble } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import API from '../services/api';
import toast from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchWishlist();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) setUser(response.data.data);
    } catch (_) {}
  };

  const fetchWishlist = async () => {
    try {
      const response = await API.get('/wishlist');
      setProperties(response.data.data || []);
    } catch (_) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId: string) => {
    try {
      await API.post(`/wishlist/toggle/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      toast.success('Removed from wishlist');
    } catch (_) {
      toast.error('Failed to remove');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
            <p className="text-sm text-gray-400">{properties.length} saved</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No saved properties</h3>
            <p className="text-gray-400 text-sm mb-6">Tap the heart icon on any property to save it here</p>
            <button onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex">
                  {/* Image */}
                  <div className="w-28 h-28 flex-shrink-0 bg-gray-100 cursor-pointer" onClick={() => navigate(`/property/${property._id}`)}>
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🏠</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 min-w-0 cursor-pointer" onClick={() => navigate(`/property/${property._id}`)}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 flex-1 pr-2">{property.title}</h3>
                      <button onClick={(e) => { e.stopPropagation(); handleRemove(property._id); }}
                        className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-100">
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <p className="text-blue-600 font-bold text-base mt-0.5">
                      {formatPrice(property.price)}
                      {property.listingType === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
                    </p>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{property.address.city}, {property.address.state}</span>
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      {property.area > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <Maximize2 className="w-3 h-3" />{property.area} sq ft
                        </span>
                      )}
                      {property.bedrooms > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <BedDouble className="w-3 h-3" />{property.bedrooms} BHK
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                        property.listingType === 'sale' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
};

export default WishlistPage;