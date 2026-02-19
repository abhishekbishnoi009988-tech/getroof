import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Camera } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

interface HouseFormData {
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  propertyType: string;
  listingType: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  ownerPhone?: string;
}

const UploadHouse: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Step 1: Choose sell or rent
  const [formType, setFormType] = useState<'choose' | 'sell' | 'rent'>('choose');

  const [formData, setFormData] = useState<HouseFormData>({
    title: '',
    description: '',
    price: 0,
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
    },
    propertyType: 'house',
    listingType: 'sale',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    images: [],
    ownerPhone: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (imageFiles.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(promises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(formData.address.pinCode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    if (formType === 'rent') {
      if (!formData.ownerPhone || !/^[6-9]\d{9}$/.test(formData.ownerPhone)) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
    }

    setLoading(true);

    try {
      let imageBase64: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        toast.loading('Uploading images...');
        imageBase64 = await convertImagesToBase64(imageFiles);
        toast.dismiss();
      }

      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          pinCode: formData.address.pinCode,
        },
        propertyType: formData.propertyType,
        listingType: formType === 'rent' ? 'rent' : 'sale',
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        amenities: formData.amenities,
        images: imageBase64,
        ...(formType === 'rent' && { ownerPhone: formData.ownerPhone }),
      };

      const response = await API.post('/properties/upload-house', propertyData);

      if (response.data.success) {
        toast.success('Property uploaded successfully!');
        navigate('/my-properties');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload property');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // ─── STEP 1: Choose Sell or Rent ───────────────────────────────────────────
  if (formType === 'choose') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Property</h1>
            <p className="text-gray-500 mb-10">What would you like to do with your property?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sell Option */}
              <button
                onClick={() => {
                  setFormType('sell');
                  setFormData((prev) => ({ ...prev, listingType: 'sale' }));
                }}
                className="group border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-8 text-left transition-all hover:shadow-lg bg-blue-50 hover:bg-blue-100"
              >
                <div className="text-5xl mb-4">🏷️</div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">Sell</h2>
                <p className="text-gray-600 text-sm">
                  List your property for sale. Our brokers will connect you with serious buyers.
                </p>
                <div className="mt-4 bg-blue-600 text-white rounded-xl py-2 px-4 text-sm font-semibold group-hover:bg-blue-700 transition-colors">
                  List for Sale →
                </div>
              </button>

              {/* Rent Option */}
              <button
                onClick={() => {
                  setFormType('rent');
                  setFormData((prev) => ({ ...prev, listingType: 'rent' }));
                }}
                className="group border-2 border-green-200 hover:border-green-500 rounded-2xl p-8 text-left transition-all hover:shadow-lg bg-green-50 hover:bg-green-100"
              >
                <div className="text-5xl mb-4">🔑</div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Rent</h2>
                <p className="text-gray-600 text-sm">
                  List your property for rent. Tenants will contact you directly on your mobile number.
                </p>
                <div className="mt-4 bg-green-600 text-white rounded-xl py-2 px-4 text-sm font-semibold group-hover:bg-green-700 transition-colors">
                  List for Rent →
                </div>
              </button>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-8 text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: The Form (Sell or Rent) ──────────────────────────────────────
  const isRent = formType === 'rent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            {/* Back to choose */}
            <button
              onClick={() => setFormType('choose')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{isRent ? '🔑' : '🏷️'}</span>
              <h1 className="text-3xl font-bold text-gray-900">
                {isRent ? 'List Property for Rent' : 'List Property for Sale'}
              </h1>
            </div>
            <p className="text-gray-600">
              {isRent
                ? 'Tenants will contact you directly on your mobile number'
                : 'List your property and reach thousands of potential buyers'}
            </p>

            {isRent ? (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>🔑 Rent Listing:</strong> No broker involved. Tenants will call you directly!
                </p>
              </div>
            ) : (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Free Listing!</strong> Your property will be live immediately.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Photos */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Photos (Up to 5)</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (Max 5MB per image)</p>
                      <p className="text-xs text-blue-600 font-semibold mt-2">
                        {imageFiles.length}/5 images uploaded
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      disabled={imageFiles.length >= 5}
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? 'Cover' : `Photo ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful 3BHK Villa in Green Park"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your property in detail..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                  <select
                    name="propertyType"
                    required
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                {/* Price - different label for rent vs sell */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {isRent ? 'Rent Price per Month (₹) *' : 'Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder={isRent ? 'e.g., 8000' : 'e.g., 5000000'}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  {isRent && (
                    <p className="text-xs text-gray-500 mt-1">Enter monthly rent amount in ₹</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Area (sq ft) *</label>
                  <input
                    type="number"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="1200"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="2"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                {/* Owner Phone - only for rent */}
                {isRent && (
                  <div className="sm:col-span-2">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <label className="block text-sm font-bold text-green-800 mb-2">
                        📞 Your Mobile Number * (Tenants will contact you directly)
                      </label>
                      <input
                        type="tel"
                        name="ownerPhone"
                        required
                        value={formData.ownerPhone}
                        onChange={handleInputChange}
                        placeholder="e.g., 9876543210"
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        className="block w-full rounded-md border-2 border-green-400 px-3 py-2 focus:border-green-600 focus:outline-none text-lg font-semibold"
                      />
                      <p className="text-xs text-green-700 mt-2">
                        ✅ Enter 10-digit mobile number. Tenants will call you directly — no broker involved.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Address */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Property Address</h2>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  📌 PIN Code * (6 digits) - REQUIRED
                </label>
                <input
                  type="text"
                  name="address.pinCode"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={formData.address.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit PIN code (e.g., 302020)"
                  className="block w-full rounded-lg border-2 border-yellow-500 px-6 py-4 text-2xl font-bold text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-700 mt-3 font-semibold">
                  ⚠️ Tenants/Buyers will search properties by PIN code. Make sure it's correct!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input
                    type="text"
                    name="address.street"
                    required
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Sector 5"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    name="address.city"
                    required
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="Jaipur"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    name="address.state"
                    required
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="Rajasthan"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormType('choose')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className={`px-8 py-3 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg flex items-center space-x-2 ${
                  isRent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>{isRent ? 'List for Rent (Free)' : 'Upload Property (Free)'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadHouse;