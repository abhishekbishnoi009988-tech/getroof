import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Camera, Video } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const UploadHouse: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [formType, setFormType] = useState<'choose' | 'sell' | 'rent'>('choose');
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0,
    address: { street: '', city: '', state: '', pinCode: '' },
    propertyType: 'house', listingType: 'sale',
    area: 0, bedrooms: 0, bathrooms: 0, amenities: [], images: [], ownerPhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({ ...prev, [parent]: { ...(prev as any)[parent], [child]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) { toast.error('Max 5 images'); return; }
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); return false; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large (max 5MB)`); return false; }
      return true;
    });
    if (!validFiles.length) return;
    setImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a valid video file'); return; }
    if (file.size > 150 * 1024 * 1024) { toast.error('Video too large (max 150MB)'); return; }
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > 240) { toast.error('Video must be 4 minutes or less'); return; }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success('Video selected!');
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => { setVideoFile(null); setVideoPreview(''); toast.success('Video removed'); };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(formData.address.pinCode)) { toast.error('Please enter a valid 6-digit PIN code'); return; }

    // Phone is mandatory for BOTH sell and rent
    if (!formData.ownerPhone || !/^[6-9]\d{9}$/.test(formData.ownerPhone)) {
      toast.error('Please enter a valid 10-digit mobile number'); return;
    }

    setLoading(true);
    try {
      let imageBase64: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        toast.loading('Uploading images...');
        imageBase64 = await Promise.all(imageFiles.map(convertToBase64));
        toast.dismiss();
      }
      let videoBase64: string | undefined;
      if (videoFile) {
        toast.loading('Uploading video... this may take a minute');
        videoBase64 = await convertToBase64(videoFile);
        toast.dismiss();
      }
      toast.loading('Saving property...');
      const response = await API.post('/properties/upload-house', {
        title: formData.title, description: formData.description, price: Number(formData.price),
        address: formData.address, propertyType: formData.propertyType,
        listingType: formType === 'rent' ? 'rent' : 'sale',
        area: Number(formData.area), bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0, amenities: formData.amenities,
        images: imageBase64, video: videoBase64,
        ownerPhone: formData.ownerPhone, // always send phone
      });
      toast.dismiss();
      if (response.data.success) { toast.success('Property uploaded successfully!'); navigate('/my-properties'); }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to upload property');
    } finally { setLoading(false); setUploadingImages(false); }
  };

  if (formType === 'choose') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Property</h1>
            <p className="text-gray-500 mb-10">What would you like to do with your property?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button onClick={() => { setFormType('sell'); setFormData((p) => ({ ...p, listingType: 'sale' })); }}
                className="border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-8 text-left transition-all hover:shadow-lg bg-blue-50 hover:bg-blue-100">
                <div className="text-5xl mb-4">🏷️</div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">Sell</h2>
                <p className="text-gray-600 text-sm">List your property for sale. Our brokers will connect you with serious buyers.</p>
                <div className="mt-4 bg-blue-600 text-white rounded-xl py-2 px-4 text-sm font-semibold">List for Sale →</div>
              </button>
              <button onClick={() => { setFormType('rent'); setFormData((p) => ({ ...p, listingType: 'rent' })); }}
                className="border-2 border-green-200 hover:border-green-500 rounded-2xl p-8 text-left transition-all hover:shadow-lg bg-green-50 hover:bg-green-100">
                <div className="text-5xl mb-4">🔑</div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Rent</h2>
                <p className="text-gray-600 text-sm">List your property for rent. Tenants will contact you directly.</p>
                <div className="mt-4 bg-green-600 text-white rounded-xl py-2 px-4 text-sm font-semibold">List for Rent →</div>
              </button>
            </div>
            <button onClick={() => navigate(-1)} className="mt-8 text-gray-500 hover:text-gray-700 text-sm underline">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const isRent = formType === 'rent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <button onClick={() => setFormType('choose')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">← Back</button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{isRent ? '🔑' : '🏷️'}</span>
              <h1 className="text-3xl font-bold text-gray-900">{isRent ? 'List Property for Rent' : 'List Property for Sale'}</h1>
            </div>
            {isRent ? (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800"><strong>🔑 Rent Listing:</strong> Your number is only shared with brokers, not public.</p>
              </div>
            ) : (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800"><strong>Free Listing!</strong> Your number is only shared with brokers when a buyer shows interest — never shown publicly.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📸 Property Photos (Up to 5)</h2>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <Camera className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-semibold">Click to upload photos</p>
                <p className="text-xs text-gray-400">PNG, JPG (Max 5MB each) · {imageFiles.length}/5</p>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelect} disabled={imageFiles.length >= 5} />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{index === 0 ? 'Cover' : `Photo ${index + 1}`}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">🎬 Property Video <span className="text-gray-400 text-base font-normal">(Optional)</span></h2>
              <p className="text-sm text-gray-500 mb-4">Upload a video tour — max 4 minutes, max 150MB</p>
              {!videoFile ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                  <Video className="w-10 h-10 text-purple-400 mb-2" />
                  <p className="text-sm text-purple-600 font-semibold">Click to upload video</p>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV (Max 4 min · 150MB)</p>
                  <input type="file" className="hidden" accept="video/*" onChange={handleVideoSelect} />
                </label>
              ) : (
                <div className="relative">
                  <video src={videoPreview} controls className="w-full rounded-lg max-h-64 bg-black" />
                  <button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"><X className="w-4 h-4" /></button>
                  <p className="text-xs text-purple-700 font-medium mt-2 bg-purple-50 border border-purple-200 rounded px-3 py-2">✅ {videoFile.name}</p>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g., Beautiful 3BHK Villa in Green Park" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe your property..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                  <select name="propertyType" required value={formData.propertyType} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                    <option value="house">House</option><option value="apartment">Apartment</option>
                    <option value="villa">Villa</option><option value="plot">Plot</option><option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{isRent ? 'Rent per Month (₹) *' : 'Price (₹) *'}</label>
                  <input type="number" name="price" required value={formData.price} onChange={handleInputChange} placeholder={isRent ? '8000' : '5000000'} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area (sq ft) *</label>
                  <input type="number" name="area" required value={formData.area} onChange={handleInputChange} placeholder="1200" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} placeholder="3" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} placeholder="2" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>

                {/* Phone - mandatory for BOTH sell and rent */}
                <div className="sm:col-span-2">
                  <div className={`border-2 rounded-lg p-4 ${isRent ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
                    <label className={`block text-sm font-bold mb-2 ${isRent ? 'text-green-800' : 'text-blue-800'}`}>
                      📞 Your Mobile Number * <span className="font-normal">(Only visible to broker — never shown to buyers/tenants publicly)</span>
                    </label>
                    <input
                      type="tel" name="ownerPhone" required
                      value={formData.ownerPhone} onChange={handleInputChange}
                      placeholder="9876543210" pattern="[6-9][0-9]{9}" maxLength={10}
                      className={`block w-full rounded-md border-2 px-3 py-2 text-lg font-semibold focus:outline-none ${isRent ? 'border-green-400 focus:border-green-600' : 'border-blue-400 focus:border-blue-600'}`}
                    />
                    <p className={`text-xs mt-2 ${isRent ? 'text-green-700' : 'text-blue-700'}`}>
                      🔒 Your number is shared with the broker only when a buyer shows interest — so broker can contact both you and the buyer to close the deal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Property Address</h2>
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">📌 PIN Code * (6 digits)</label>
                <input type="text" name="address.pinCode" required maxLength={6} pattern="\d{6}" value={formData.address.pinCode} onChange={handleInputChange} placeholder="e.g., 302020" className="block w-full rounded-lg border-2 border-yellow-500 px-6 py-4 text-2xl font-bold text-center focus:border-blue-500 focus:outline-none" />
                <p className="text-sm text-gray-700 mt-3 font-semibold">⚠️ Buyers/Tenants search by PIN code!</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input type="text" name="address.street" required value={formData.address.street} onChange={handleInputChange} placeholder="123 Main Street" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input type="text" name="address.city" required value={formData.address.city} onChange={handleInputChange} placeholder="Jaipur" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State *</label>
                  <input type="text" name="address.state" required value={formData.address.state} onChange={handleInputChange} placeholder="Rajasthan" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setFormType('choose')} className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading || uploadingImages}
                className={`px-8 py-3 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg flex items-center space-x-2 ${isRent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Uploading...</span></>
                ) : (
                  <><Upload className="w-5 h-5" /><span>{isRent ? 'List for Rent (Free)' : 'Upload Property (Free)'}</span></>
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