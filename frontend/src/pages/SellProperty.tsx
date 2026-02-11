import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import { initiatePayment } from '../services/razorpay';
import toast from 'react-hot-toast';

const SellProperty: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    type: 'buy',
    lat: '',
    lng: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [createdPropertyId, setCreatedPropertyId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      toast.error('Please enter valid coordinates');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('address', formData.address);
      data.append('type', formData.type);
      data.append('coordinates', JSON.stringify({
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      }));

      photos.forEach(photo => {
        data.append('photos', photo);
      });

      const response = await API.post('/properties',data);
      setCreatedPropertyId(response.data.data._id);
      setStep(2);
      toast.success('Property details saved!');
    } catch (error) {
      toast.error('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handlePayListingFee = () => {
    const price = parseFloat(formData.price);
    
    initiatePayment(
      createdPropertyId,
      'listing',
      () => {
        toast.success('Property listed successfully!');
        navigate('/my-properties');
      },
      (error) => {
        toast.error('Payment failed');
        console.error(error);
      }
    );
  };

  const listingFee = formData.price ? parseFloat(formData.price) * 0.01 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            List Your Property
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details to list your property for {formData.type === 'buy' ? 'sale' : 'rent'}
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Property Details</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2
              font-medium">Payment</span>
</div>
</div>
{step === 1 ? (
        <form onSubmit={handleSubmitProperty} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="3 BHK Apartment in Downtown"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your property..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="5000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {formData.price && (
              <p className="text-sm text-gray-600 mt-2">
                Listing Fee (1%): ₹{listingFee.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main Street, City, State"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                step="any"
                placeholder="28.6139"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="lng"
                value={formData.lng}
                onChange={handleInputChange}
                step="any"
                placeholder="77.2090"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {previewUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue to Payment'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pay Listing Fee
            </h3>
            <p className="text-gray-600 mb-6">
              Pay a refundable listing fee of 1% to activate your property listing
            </p>
            <div className="bg-white rounded-lg p-6 inline-block">
              <p className="text-sm text-gray-600 mb-2">Listing Fee (1% - Refundable)</p>
              <p className="text-4xl font-bold text-blue-600">
                ₹{listingFee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={handlePayListingFee}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Pay Listing Fee
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Your property will be visible on the map after payment confirmation
          </p>
        </div>
      )}
    </div>
  </div>
</div>
);
};
export default SellProperty;
