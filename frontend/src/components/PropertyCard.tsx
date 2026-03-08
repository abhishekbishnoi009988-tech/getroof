import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerInterestModal from './BuyerInterestModal';

interface PropertyCardProps {
  property: {
    _id: string;
    title: string;
    description: string;
    price: number;
    address: {
      street: string;
      city: string;
      state: string;
    };
    propertyType: string;
    listingType: string;
    listedBy: string;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    images: string[];
    status: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [showInterestModal, setShowInterestModal] = useState(false);
  const isRented = property.status === 'rented';

  return (
    <>
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${isRented ? 'opacity-80' : ''}`}>
        {/* Property Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0] || 'https://via.placeholder.com/400x300'}
            alt={property.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${!isRented ? 'hover:scale-110' : ''}`}
          />

          {/* Rented overlay */}
          {isRented && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-full rotate-[-15deg] shadow-lg">
                🏷️ RENTED
              </span>
            </div>
          )}

          {/* Listing type badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
              isRented ? 'bg-red-600' : 'bg-blue-600'
            }`}>
              {isRented ? '🏷️ Rented' : property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Owner badge */}
          {property.listedBy === 'owner' && (
            <div className="absolute top-2 right-2">
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Owner</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{property.title}</h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>

          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{property.address.city}, {property.address.state}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{property.area} sq ft</span>
            </div>
            {property.bedrooms && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span>{property.bathrooms} Bath</span>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className={`text-2xl font-bold ${isRented ? 'text-gray-400' : 'text-blue-600'}`}>
                ₹{property.price.toLocaleString()}
              </p>
              {property.listingType === 'rent' && (
                <p className="text-xs text-gray-500">per month</p>
              )}
            </div>

            <div className="flex space-x-2">
              <button onClick={() => navigate(`/property/${property._id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm">
                View Details
              </button>

              {!isRented && (
                <button onClick={() => setShowInterestModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
                  I'm Interested
                </button>
              )}

              {isRented && (
                <span className="px-4 py-2 bg-red-100 text-red-600 rounded-md font-medium text-sm">
                  Not Available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <BuyerInterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        propertyId={property._id}
        propertyTitle={property.title}
      />
    </>
  );
};

export default PropertyCard;