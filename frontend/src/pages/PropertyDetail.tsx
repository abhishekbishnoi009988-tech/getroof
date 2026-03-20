import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Maximize, Bed, Bath, Phone, ChevronRight,
  Heart, Share2, X, Copy, Check, Users, Clock, ShieldCheck, Home
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import API from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Layout/Footer';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [modalStep, setModalStep] = useState<null | 'broker-list' | 'contact-form'>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadedByBroker, setUploadedByBroker] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Share
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const propertyUrl = `https://getroof.in/property/${id}`;

  useEffect(() => { fetchProperty(); fetchUser(); checkWishlist(); }, [id]);

  const fetchUser = async () => {
    const cached = localStorage.getItem('getroof_user');
    if (cached) setUser(JSON.parse(cached));
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('getroof_user', JSON.stringify(response.data.data));
      }
    } catch (_) {}
  };

  const fetchProperty = async () => {
    try {
      const response = await API.get(`/properties/${id}`);
      const prop = response.data.data;
      setProperty(prop);
      if (prop.broker) { setUploadedByBroker(true); setSelectedBroker(prop.broker); }
    } catch (error) {
      toast.error('Property not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await API.get(`/wishlist/check/${id}`);
      setIsWishlisted(response.data.saved);
    } catch (_) {}
  };

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login to save properties'); navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      const response = await API.post(`/wishlist/toggle/${id}`);
      setIsWishlisted(response.data.saved);
      toast.success(response.data.saved ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch (_) {
      toast.error('Failed to update wishlist');
    } finally { setWishlistLoading(false); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { toast.error('Failed to copy link'); }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title, text: `Check out this property on GETROOF: ${property?.title}`, url: propertyUrl });
      } catch (_) {}
    } else { handleCopyLink(); }
  };

  const shareOptions = [
    {
      label: 'WhatsApp', color: 'bg-green-500',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.057 23.944l6.204-1.628A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.578-.49-5.073-1.343l-.363-.215-3.759.986.997-3.648-.236-.374A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this property on GETROOF: ${property?.title}\n${propertyUrl}`)}`, '_blank'),
    },
    {
      label: 'Facebook', color: 'bg-blue-600',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank'),
    },
    {
      label: 'Instagram', color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
      onClick: () => { handleCopyLink(); toast.success('Link copied — paste it in your Instagram story!'); },
    },
    {
      label: 'Copy Link', color: 'bg-gray-700',
      icon: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
      onClick: handleCopyLink,
    },
    {
      label: 'More', color: 'bg-gray-500',
      icon: <Share2 className="w-5 h-5" />,
      onClick: handleNativeShare,
    },
  ];

  const handleContactBrokerClick = async () => {
    if (uploadedByBroker && selectedBroker) { setModalStep('contact-form'); return; }
    setBrokersLoading(true);
    setModalStep('broker-list');
    try {
      const pinCode = property?.address?.pinCode;
      const response = await API.get(`/buyer-interests/brokers-by-pincode/${pinCode}`);
      setBrokers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load brokers');
      setBrokers([]);
    } finally { setBrokersLoading(false); }
  };

  const handleSelectBroker = (broker: any) => { setSelectedBroker(broker); setModalStep('contact-form'); };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(buyerPhone)) { toast.error('Please enter a valid 10-digit mobile number starting with 6-9'); return; }
    setSubmitting(true);
    try {
      const response = await API.post('/buyer-interests', {
        propertyId: id, phone: buyerPhone,
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
    } finally { setSubmitting(false); }
  };

  const handleCloseModal = () => {
    setModalStep(null);
    if (!uploadedByBroker) setSelectedBroker(null);
    setBuyerPhone(''); setBuyerName(''); setBuyerMessage('');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const genderLabel = (g?: string) => {
    if (g === 'boys') return '👦 Boys Only';
    if (g === 'girls') return '👧 Girls Only';
    if (g === 'coed') return '👫 Co-ed (Boys & Girls)';
    if (g === 'any') return '✅ All Genders';
    return '';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!property) return null;

  const isRent = property.listingType === 'rent';
  const isHostel = property.propertyType === 'hostel';
  const isPG = property.propertyType === 'pg';
  const isHostelOrPG = isHostel || isPG;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleWishlist} disabled={wishlistLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                isWishlisted ? 'bg-red-50 border-red-400 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}>
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button onClick={() => setShowShareSheet(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 ? (
          <div className="mb-6">
            <div className="mb-3 rounded-2xl overflow-hidden">
              <img src={property.images[selectedImage]} alt={property.title} className="w-full h-80 object-cover" />
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
          <div className="mb-6 bg-gray-200 rounded-2xl h-80 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}

        {/* Video */}
        {property.video && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎬 Property Video Tour</h3>
            <video src={property.video} controls className="w-full rounded-xl max-h-80 bg-black" poster={property.images?.[0]}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Main details card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">

          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              {isHostelOrPG && property.hostelName && (
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{property.hostelName}</p>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-start gap-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{property.address.street}, {property.address.city}, {property.address.state} — {property.address.pinCode}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl text-blue-600 font-bold">{formatPrice(property.price)}</p>
              {isRent && <p className="text-xs text-gray-400 mt-1">per month</p>}
            </div>
          </div>

          {/* Type badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isHostel ? 'bg-orange-100 text-orange-700'
              : isPG ? 'bg-purple-100 text-purple-700'
              : isRent ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
            }`}>
              {isHostel ? '🏨 Hostel' : isPG ? '🛏️ PG' : isRent ? '🔑 For Rent' : '🏷️ For Sale'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 capitalize">
              {property.propertyType}
            </span>
            {uploadedByBroker && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                ✓ Verified Broker Listing
              </span>
            )}
            {isHostelOrPG && property.gender && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {genderLabel(property.gender)}
              </span>
            )}
          </div>

          {/* ── HOSTEL / PG specific stats ── */}
          {isHostelOrPG ? (
            <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm text-gray-900">{isHostel ? 'Hostel' : 'PG Accommodation'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Occupancy</p>
                  <p className="font-semibold text-sm text-gray-900">{genderLabel(property.gender) || 'All Genders'}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── HOUSE / FLAT / APARTMENT stats ── */
            <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Maximize className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="font-semibold text-sm">{property.area > 1 ? `${property.area} sq ft` : 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Bed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Bedrooms</p>
                  <p className="font-semibold text-sm">{property.bedrooms || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Bath className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Bathrooms</p>
                  <p className="font-semibold text-sm">{property.bathrooms || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
          </div>

          {/* ── HOSTEL/PG Amenities ── */}
          {isHostelOrPG && property.hostelAmenities && property.hostelAmenities.length > 0 && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">🏠 Facilities & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.hostelAmenities.map((amenity: string) => (
                  <span key={amenity} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── HOSTEL/PG Rules ── */}
          {isHostelOrPG && property.rules && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> Rules & Regulations
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{property.rules}</p>
              </div>
            </div>
          )}

          {/* ── HOSTEL/PG Entry/Exit Timings ── */}
          {isHostelOrPG && property.timings && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Entry/Exit Timings
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-gray-700 text-sm font-medium">{property.timings}</p>
              </div>
            </div>
          )}

          {/* ── HOUSE amenities (if filled) ── */}
          {!isHostelOrPG && property.amenities && property.amenities.length > 0 && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">✨ Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: string) => (
                  <span key={amenity} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          {isRent ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
              <h3 className="text-base font-bold text-green-800 mb-1">📞 Contact Owner Directly</h3>
              <p className="text-green-700 text-xs mb-4">
                {isHostelOrPG
                  ? 'Call the owner to check availability and schedule a visit.'
                  : 'This is a direct rental listing. Call the owner to schedule a visit.'}
              </p>
              {property.ownerPhone ? (
                <a href={`tel:${property.ownerPhone}`}
                  className="inline-flex items-center space-x-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold transition-colors w-full justify-center">
                  <Phone className="w-5 h-5" />
                  <span>Call Owner: {property.ownerPhone}</span>
                </a>
              ) : (
                <p className="text-gray-500 italic text-sm">Owner phone not available</p>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Buyers are not charged anything.</strong> Only the seller pays a <strong>1.49% commission</strong> upon successful sale.
                </p>
              </div>
              <button onClick={handleContactBrokerClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold w-full flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Broker</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Sheet */}
      {showShareSheet && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowShareSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Property</h3>
              <button onClick={() => setShowShareSheet(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {property.images?.[0] && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-6">
                <img src={property.images[0]} alt={property.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{property.title}</p>
                  <p className="text-blue-600 font-bold text-sm">{formatPrice(property.price)}</p>
                  <p className="text-gray-400 text-xs">{property.address.city}, {property.address.state}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button key={option.label} onClick={option.onClick} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 ${option.color} text-white rounded-2xl flex items-center justify-center shadow-sm`}>
                    {option.icon}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-xs text-gray-500 flex-1 truncate">{propertyUrl}</span>
              <button onClick={handleCopyLink} className="text-blue-600 text-xs font-bold flex-shrink-0">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Broker List Modal */}
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
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : brokers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No brokers found in this area.</p>
                <button onClick={() => handleSelectBroker(null)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Continue Anyway</button>
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
                          <span className="text-white font-bold text-lg">{broker.user?.name?.charAt(0)?.toUpperCase() || 'B'}</span>
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

      {/* Contact Form Modal */}
      {modalStep === 'contact-form' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            {selectedBroker && (
              <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {selectedBroker.user?.profilePicture ? (
                    <img src={selectedBroker.user.profilePicture} alt={selectedBroker.user?.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{selectedBroker.user?.name?.charAt(0)?.toUpperCase() || 'B'}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedBroker.user?.name || 'Broker'}</p>
                  <p className="text-xs text-blue-600">{selectedBroker.specialization}</p>
                  {uploadedByBroker && <span className="text-xs text-purple-600 font-medium">Listed by this broker</span>}
                </div>
                {!uploadedByBroker && (
                  <button onClick={() => setModalStep('broker-list')} className="ml-auto text-xs text-blue-600 underline">Change</button>
                )}
              </div>
            )}
            <p className="text-gray-500 text-sm mb-4">Enter your details and the broker will contact you shortly.</p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="John Doe"
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
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50">Back</button>
                )}
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Sending...
                    </div>
                  ) : 'Send to Broker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav user={user} />
      <Footer />
    </div>
  );
};

export default PropertyDetail;