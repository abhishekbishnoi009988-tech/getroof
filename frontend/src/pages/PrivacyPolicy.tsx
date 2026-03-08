import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: March 8, 2026</p>

          <div className="prose prose-blue max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                GETROOF ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform.
              </p>
              <p className="text-gray-700 mt-3">
                This policy complies with the Information Technology Act, 2000, IT Rules 2011, and the Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-3">When you register or use GETROOF, we collect:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, phone number</li>
                <li><strong>Authentication Data:</strong> Google account information (if using Google OAuth)</li>
                <li><strong>Profile Information:</strong> Profile picture (from Google or uploaded)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">2.2 Property Listing Information</h3>
              <p className="text-gray-700 mb-3">When you list a property:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Property details (title, description, price, type, bedrooms, bathrooms, area)</li>
                <li>Property address and location</li>
                <li>Property images (up to 5 photos) and video tour (optional)</li>
                <li>PIN code and locality information</li>
                <li>Owner mobile number (shared only with broker, never shown publicly)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">2.3 Broker Information</h3>
              <p className="text-gray-700 mb-3">For Broker registration:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>RERA license number</li>
                <li>Years of experience and specialization</li>
                <li>Office location and GPS coordinates</li>
                <li>Service radius (area coverage)</li>
                <li>Bank account details (for commission payments)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">2.4 Transaction Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Payment details (processed by Cashfree)</li>
                <li>Commission payment records (1.49% charged from seller only)</li>
                <li>Transaction history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">2.5 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Cookies and usage data</li>
                <li>Log files (page visits, time spent, clicks)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Provide Platform Services</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Create and manage your account</li>
                <li>Display property listings</li>
                <li>Connect buyers with brokers based on location</li>
                <li>Process commission payments (1.49% from seller only)</li>
                <li>Send notifications about buyer interests</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">3.2 Communication</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Send transactional emails (account verification, password reset)</li>
                <li>Notify brokers of buyer inquiries within their service area</li>
                <li>Send platform updates and important announcements</li>
                <li>Respond to support requests</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">3.3 Platform Improvement</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Analyze usage patterns and trends</li>
                <li>Improve user experience and features</li>
                <li>Debug technical issues</li>
                <li>Prevent fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Public Information</h3>
              <p className="text-gray-700">
                Property listings (title, description, price, photos, location) are publicly visible to all platform users. Owner mobile numbers are <strong>never shown publicly</strong>.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">4.2 With Brokers</h3>
              <p className="text-gray-700">
                When a buyer expresses interest in a property, we share the buyer's name and phone number with the selected broker. The seller's phone number is also shared with the broker (not with buyers) so the broker can facilitate the deal between both parties.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">4.3 Third-Party Services</h3>
              <p className="text-gray-700 mb-3">We share data with:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Cashfree:</strong> Payment processing (transaction details, bank information)</li>
                <li><strong>Google:</strong> OAuth authentication (email, name, profile picture)</li>
                <li><strong>MongoDB Atlas:</strong> Database hosting (encrypted data storage)</li>
                <li><strong>Netlify/Render:</strong> Platform hosting</li>
                <li><strong>Cloudinary:</strong> Property image and video storage</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">4.4 Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose your information if required by law, court order, or government authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Commission & Payment Privacy</h2>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-gray-700">
                  GETROOF charges a commission of <strong>1.49% of the sale price</strong> upon successful property sale.
                  This commission is charged <strong>from the seller only</strong>. Buyers are not charged any commission.
                  The commission is split as: <strong>70% to the Broker</strong> and <strong>30% to GETROOF</strong> as platform fee.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-3">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Encryption:</strong> HTTPS/SSL encryption for data transmission</li>
                <li><strong>Password Security:</strong> Bcrypt hashing for password storage</li>
                <li><strong>Access Control:</strong> Role-based access (User, Broker, Admin)</li>
                <li><strong>Authentication:</strong> JWT tokens for session management</li>
                <li><strong>Payment Security:</strong> PCI DSS compliant (via Cashfree)</li>
                <li><strong>Phone Privacy:</strong> Seller phone numbers are only shared with brokers, never shown publicly</li>
              </ul>
              <p className="text-gray-700 mt-3">
                However, no system is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Types of Cookies We Use</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Essential Cookies:</strong> Required for platform functionality (login, authentication)</li>
                <li><strong>Analytics Cookies:</strong> Track usage patterns and performance</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">7.2 Managing Cookies</h3>
              <p className="text-gray-700">
                You can disable cookies in your browser settings. However, some platform features may not work properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Data Rights (DPDP Act 2023)</h2>
              <p className="text-gray-700 mb-3">Under Indian law, you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Access:</strong> Request a copy of personal information we hold about you</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information through your account settings</li>
                <li><strong>Delete:</strong> Request deletion of your account and personal information</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
                <li><strong>Complain:</strong> File a complaint with the Data Protection Board of India</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-800">
                  To exercise these rights, contact us at <strong>privacy.getroof@gmail.com</strong>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
              <p className="text-gray-700 mb-3">We retain your data for:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Active accounts:</strong> As long as your account is active</li>
                <li><strong>Closed accounts:</strong> Up to 7 years (for legal/tax compliance)</li>
                <li><strong>Transaction records:</strong> 10 years (as per Indian tax laws)</li>
                <li><strong>Analytics data:</strong> Aggregated and anonymized indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700">
                GETROOF is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover that a minor has provided personal information, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-3">For privacy-related questions, concerns, or to exercise your data rights:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700">GETROOF</p>
                <p className="text-gray-700">Email: privacy.getroof@gmail.com</p>
                <p className="text-gray-700">Support: support.getroof@gmail.com</p>
                <p className="text-gray-700">Phone: +91-7297018503</p>
              </div>
            </section>

            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grievance Redressal (IT Act 2000)</h3>
              <p className="text-gray-700 mb-3">
                As per Rule 3(11) of the IT Rules 2011, if you have any grievances about data handling:
              </p>
              <div className="bg-white border border-gray-200 rounded p-4">
                <p className="text-gray-800"><strong>Grievance Officer</strong></p>
                <p className="text-gray-700">Name: Abhishek</p>
                <p className="text-gray-700">Email: grievance.getroof@gmail.com</p>
                <p className="text-gray-700">Response Time: Within 30 days</p>
              </div>
            </section>

            <section className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Consent</h3>
              <p className="text-gray-700">
                By using GETROOF, you consent to the collection, use, and sharing of your information as described in this Privacy Policy.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;