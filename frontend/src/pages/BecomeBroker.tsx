import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const BecomeBroker: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    yearsOfExperience: '',
    specialization: 'Residential Properties',
    description: '',
    officeLocation: {
      address: '',
      city: '',
      state: '',
      pinCode: '',
    },
    servicePinCodes: [''], // Array of PIN codes
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('officeLocation.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        officeLocation: {
          ...prev.officeLocation,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePinCodeChange = (index: number, value: string) => {
    const newPinCodes = [...formData.servicePinCodes];
    newPinCodes[index] = value.replace(/\D/g, ''); // Only digits
    setFormData((prev) => ({
      ...prev,
      servicePinCodes: newPinCodes,
    }));
  };

  const addPinCode = () => {
    if (formData.servicePinCodes.length >= 10) {
      toast.error('Maximum 10 PIN codes allowed');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      servicePinCodes: [...prev.servicePinCodes, ''],
    }));
  };

  const removePinCode = (index: number) => {
    if (formData.servicePinCodes.length === 1) {
      toast.error('At least one PIN code is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      servicePinCodes: prev.servicePinCodes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate office PIN code
    if (!/^\d{6}$/.test(formData.officeLocation.pinCode)) {
      toast.error('Please enter a valid 6-digit office PIN code');
      return;
    }

    // Validate service PIN codes
    const validPinCodes = formData.servicePinCodes.filter((pin) => /^\d{6}$/.test(pin));
    if (validPinCodes.length === 0) {
      toast.error('Please add at least one valid 6-digit service PIN code');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Submitting broker application:', { ...formData, servicePinCodes: validPinCodes });

      const response = await API.post('/brokers/register', {
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: Number(formData.yearsOfExperience),
        specialization: formData.specialization,
        description: formData.description,
        officeLocation: formData.officeLocation,
        servicePinCodes: validPinCodes,
      });

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        toast.success('Broker application submitted! Wait for admin verification.');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error: any) {
      console.error('❌ Broker registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Become a Broker</h1>
            <p className="text-gray-600">
              Join our network of professional real estate brokers and earn commissions
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-3">Benefits:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Earn 45% commission on property sales</li>
              <li>✅ Get buyer leads in your PIN code areas</li>
              <li>✅ Build your professional network</li>
              <li>✅ Access to verified property listings</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number / RERA ID *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="MAHA/RERA/4859"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      required
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      placeholder="7"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      name="specialization"
                      required
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Residential Properties">Residential Properties</option>
                      <option value="Commercial Properties">Commercial Properties</option>
                      <option value="Luxury Properties">Luxury Properties</option>
                      <option value="Rental Properties">Rental Properties</option>
                      <option value="Industrial Properties">Industrial Properties</option>
                      <option value="Land/Plot">Land/Plot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    minLength={100}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="I am 7 year experienced real estate broker. My office is at Banar Jodhpur Rajasthan. I have sold more than 150 houses, plots..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 100 characters</p>
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Office Location</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office PIN Code * (6 digits)
                  </label>
                  <input
                    type="text"
                    name="officeLocation.pinCode"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={formData.officeLocation.pinCode}
                    onChange={handleInputChange}
                    placeholder="302020"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Address *
                  </label>
                  <input
                    type="text"
                    name="officeLocation.address"
                    required
                    value={formData.officeLocation.address}
                    onChange={handleInputChange}
                    placeholder="123 Business Complex, Main Road"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="officeLocation.city"
                      required
                      value={formData.officeLocation.city}
                      onChange={handleInputChange}
                      placeholder="Jodhpur"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="officeLocation.state"
                      required
                      value={formData.officeLocation.state}
                      onChange={handleInputChange}
                      placeholder="Rajasthan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service PIN Codes */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                📌 Service Areas (PIN Codes)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Add PIN codes where you want to receive buyer leads. You can add up to 10 PIN codes.
              </p>

              <div className="space-y-3">
                {formData.servicePinCodes.map((pinCode, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      value={pinCode}
                      onChange={(e) => handlePinCodeChange(index, e.target.value)}
                      placeholder={`PIN Code ${index + 1} (e.g., 302020)`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.servicePinCodes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePinCode(index)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {formData.servicePinCodes.length < 10 && (
                  <button
                    type="button"
                    onClick={addPinCode}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
                  >
                    + Add Another PIN Code
                  </button>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-3">By submitting this application, you agree to:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Provide accurate and truthful information</li>
                <li>• Follow GETROOF's broker code of conduct</li>
                <li>• Serve buyers in your listed PIN code areas</li>
                <li>• Split commission as per the 45-55 policy</li>
<li>• Wait for admin verification before accessing broker features</li>
</ul>
</div>
{/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
);
};
export default BecomeBroker;