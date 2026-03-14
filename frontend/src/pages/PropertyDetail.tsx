import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Maximize, Bed, Bath, Phone, ChevronRight } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Layout/Footer';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Modal steps: null | 'broker-list' | 'contact-form'
  const [modalStep, setModalStep] = useState<null | 'broker-list' | 'contact-form'>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);

  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Whether this property was uploaded by a broker (skip broker selection)
  const [uploadedByBroker, setUploadedByBroker] = useState(false);

  useEffect(() => { fetchProperty(); }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await API.get(`/properties/${id}`);
      const prop = response.data.data;
      setProperty(prop);

      // Check if property has an associated broker (uploaded by broker)
      if (prop.broker) {
        setUploadedByBroker(true);
        setSelectedBroker(prop.broker);
      }
    } catch (error) {
      toast.error('Property not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleContactBrokerClick = async () => {
    // If property was uploaded by a broker — skip broker list, go straight to contact form
    if (uploadedByBroker && selectedBroker) {
      setModalStep('contact-form');
      return;
    }

    // Otherwise show broker list as normal
    setBrokersLoading(true);
    setModalStep('broker-list');
    try {
      const pinCode = property?.address?.pinCode;
      const response = await API.get(`/buyer-interests/brokers-by-pincode/${pinCode}`);
      setBrokers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load brokers');
      setBrokers([]);
    } finally {
      setBrokersLoading(false);
    }
  };

  const handleSelectBroker = (broker: any) => {
    setSelectedBroker(broker);
    setModalStep('contact-form');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(buyerPhone)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }
    setSubmitting(true);
    try {
      const response = await API.post('/buyer-interests', {
        propertyId: id,
        phone: buyerPhone,
        buyerName: buyerName || 'Anonymous Buyer',
        message: buyerMessage || 'I am interested in this property',
        brokerId: selectedBroker?._id,
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Your details have been sent to the broker!');
        setBuyerPhone(''); setBuyerName(''); setBuyerMessage('');
        setModalStep(null);
        if (!uploadedByBroker) setSelectedBroker(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send your details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalStep(null);
    if (!uploadedByBroker) setSelectedBroker(null);
    setBuyerPhone('');
    setBuyerName('');
    setBuyerMessage('');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!property) return null;

  const isRent = property.listingType === 'rent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 ? (
          <div className="mb-8">
            <div className="mb-4 rounded-lg overflow-hidden">
              <img src={property.images[selectedImage]} alt={property.title} className="w-full h-96 object-cover" />
            </div>
            {property.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {property.images.map((image: string, index: number) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden ${selectedImage === index ? 'ring-4 ring-blue-500' : 'ring-2 ring-gray-200'}`}>
                    <img src={image} alt={`${property.title} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}

        {/* Video Section */}
        {property.video && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🎬 Property Video Tour</h3>
            <video src={property.video} controls className="w-full rounded-lg max-h-96 bg-black" poster={property.images?.[0]}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{property.address.street}, {property.address.city}, {property.address.state} - {property.address.pinCode}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl text-blue-600 font-bold">{formatPrice(property.price)}</p>
              {isRent && <p className="text-sm text-gray-500 mt-1">per month</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b">
            <div className="flex items-center space-x-3">
              <Maximize className="w-6 h-6 text-gray-600" />
              <div><p className="text-gray-600 text-sm">Area</p><p className="font-semibold text-lg">{property.area} sq ft</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <Bed className="w-6 h-6 text-gray-600" />
              <div><p className="text-gray-600 text-sm">Bedrooms</p><p className="font-semibold text-lg">{property.bedrooms || 'N/A'}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <Bath className="w-6 h-6 text-gray-600" />
              <div><p className="text-gray-600 text-sm">Bathrooms</p><p className="font-semibold text-lg">{property.bathrooms || 'N/A'}</p></div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Badges */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Property Type: </span>
              <span className="font-semibold text-blue-600">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Listing Type: </span>
              <span className="font-semibold text-green-600">For {isRent ? 'Rent' : 'Sale'}</span>
            </div>
            {uploadedByBroker && (
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Listed by: </span>
                <span className="font-semibold text-purple-600">✓ Verified Broker</span>
              </div>
            )}
          </div>

          {/* Contact Section */}
          {isRent ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-2">📞 Contact Owner Directly</h3>
              <p className="text-green-700 text-sm mb-4">This is a direct rental listing. Call the owner to schedule a visit.</p>
              {property.ownerPhone ? (
                <a href={`tel:${property.ownerPhone}`}
                  className="inline-flex items-center space-x-3 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 text-lg font-semibold transition-colors">
                  <Phone className="w-6 h-6" />
                  <span>Call Owner: {property.ownerPhone}</span>
                </a>
              ) : (
                <p className="text-gray-500 italic">Owner phone not available</p>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Buyers are not charged anything.</strong> Only the seller pays a <strong>1.49% commission</strong> upon successful sale of the property.
                </p>
              </div>
              <button onClick={handleContactBrokerClick}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-semibold w-full sm:w-auto flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Broker</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1 - Broker List Modal (only shown when NOT uploaded by broker) */}
      {modalStep === 'broker-list' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Select a Broker</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Choose a verified broker in <span className="font-semibold text-blue-600">{property?.address?.pinCode}</span> to contact you.
            </p>

            {brokersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : brokers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No brokers found in this area.</p>
                <button onClick={() => handleSelectBroker(null)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  Continue Anyway
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {brokers.map((broker: any) => (
                  <button key={broker._id} onClick={() => handleSelectBroker(broker)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {broker.user?.profilePicture ? (
                          <img src={broker.user.profilePicture} alt={broker.user.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {broker.user?.name?.charAt(0)?.toUpperCase() || 'B'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{broker.user?.name || 'Broker'}</p>
                        <p className="text-sm text-blue-600">{broker.specialization}</p>
                        <p className="text-xs text-gray-500">{broker.yearsOfExperience} years experience • {broker.officeLocation?.city}</p>
                        <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 - Contact Form Modal */}
      {modalStep === 'contact-form' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            {/* Show broker info — no "Change" button if uploaded by broker */}
            {selectedBroker && (
              <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {selectedBroker.user?.profilePicture ? (
                    <img src={selectedBroker.user.profilePicture} alt={selectedBroker.user?.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">
                      {selectedBroker.user?.name?.charAt(0)?.toUpperCase() || 'B'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedBroker.user?.name || 'Broker'}</p>
                  <p className="text-xs text-blue-600">{selectedBroker.specialization}</p>
                  {uploadedByBroker && (
                    <span className="text-xs text-purple-600 font-medium">Listed by this broker</span>
                  )}
                </div>
                {/* Only show "Change" if NOT uploaded by broker */}
                {!uploadedByBroker && (
                  <button onClick={() => setModalStep('broker-list')} className="ml-auto text-xs text-blue-600 underline">Change</button>
                )}
              </div>
            )}

            <p className="text-gray-500 text-sm mb-4">Enter your details and the broker will contact you shortly.</p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Mobile Number *</label>
                <input type="tel" required value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="9876543210" pattern="[6-9][0-9]{9}" maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea value={buyerMessage} onChange={(e) => setBuyerMessage(e.target.value)}
                  placeholder="I am interested in this property..." rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex space-x-3 pt-2">
                {!uploadedByBroker && (
                  <button type="button" onClick={() => setModalStep('broker-list')} disabled={submitting}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                    Back
                  </button>
                )}
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : 'Send to Broker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetail;