import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, Eye, MapPin, Home } from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  propertyType: string;
  listingType: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  createdAt: string;
}

const MyProperties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await API.get('/properties/my-properties');
      
      console.log('My properties:', response.data);
      
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load properties:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view your properties');
        navigate('/login');
      } else {
        toast.error('Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string, propertyTitle: string) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(propertyId);
      console.log('Deleting property:', propertyId);

      const response = await API.delete(`/properties/${propertyId}`);

      if (response.data.success) {
        toast.success('Property deleted successfully!');
        
        // Remove the deleted property from the state
        setProperties(properties.filter(p => p._id !== propertyId));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">
            Manage your property listings
          </p>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/upload-house')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Upload New Property</span>
          </button>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any properties. Start by uploading your first property!
            </p>
            <button
              onClick={() => navigate('/upload-house')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Upload Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'available'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>

                  {/* Listing Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {property.title}
                  </h3>

                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {formatPrice(property.price)}
                  </p>

                  <div className="flex items-start text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {property.address.city}, {property.address.state}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm mb-4 space-x-4">
                    <span>{property.area} sq ft</span>
                    {property.bedrooms && (
                      <>
                        <span>•</span>
                        <span>{property.bedrooms} BHK</span>
                      </>
                    )}
                    {property.bathrooms && (
                      <>
                        <span>•</span>
                        <span>{property.bathrooms} Bath</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Listed on {formatDate(property.createdAt)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/property/${property._id}`)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleDelete(property._id, property.title)}
                      disabled={deletingId === property._id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      {deletingId === property._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;