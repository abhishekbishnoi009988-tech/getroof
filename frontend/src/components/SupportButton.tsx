import React, { useState } from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const SupportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCallbackRequest = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setSubmitting(true);
    try {
      const response = await API.post('/support/callback', { phone, name, message });
      if (response.data.success) {
        toast.success('Callback requested! Our team will call you within 24 hours.');
        setPhone(''); setName(''); setMessage('');
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button — above bottom nav */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Customer Support">
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Support modal */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Customer Support</h3>
                <p className="text-sm text-gray-400">We'll call you back within 24 hours</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name (Optional)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-base font-semibold" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message (Optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm resize-none" />
              </div>
            </div>

            <button onClick={handleCallbackRequest} disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 mb-3">
              {submitting ? '⏳ Submitting...' : '📞 Request Callback'}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Phone className="w-4 h-4" />
              <span>Or call directly:</span>
              <a href="tel:+917297018503" className="text-blue-600 font-semibold">+91-7297018503</a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SupportButton;