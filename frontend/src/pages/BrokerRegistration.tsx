import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const BrokerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    officeLocation: '',
    reraId: '',
    lat: '',
    lng: '',
  });

  const [documents, setDocuments] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      toast.error('Please enter valid office coordinates');
      return;
    }

    if (documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('officeLocation', formData.officeLocation);
      data.append('reraId', formData.reraId);
      data.append('officeCoordinates', JSON.stringify({
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      }));

      documents.forEach(doc => {
        data.append('documents', doc);
      });

      await API.post('/broker/register',data);
      
      toast.success('Broker registration submitted! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
            Register as a Broker
          </h1>
          <p className="text-gray-600 mb-8">
            Complete your broker profile to start receiving property visit requests
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RERA ID
              </label>
              <input
                type="text"
                name="reraId"
                value={formData.reraId}
                onChange={handleInputChange}
                placeholder="Enter your RERA registration ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Location
              </label>
              <input
                type="text"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Latitude
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
                  Office Longitude
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
                Upload Documents (RERA Certificate, ID Proof)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleDocumentChange}
                  className="hidden"
                  id="document-upload"
                  required
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Click to upload documents
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, PDF up to 5MB each
                  </p>
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected files:
                  </p>
                  <ul className="space-y-1">
                    {documents.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {doc.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed by our admin team</li>
                <li>• We'll verify your RERA ID and documents</li>
                <li>• You'll be notified once approved (usually within 24-48 hours)</li>
                <li>• After approval, you can start accepting property visit requests</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrokerRegistration;