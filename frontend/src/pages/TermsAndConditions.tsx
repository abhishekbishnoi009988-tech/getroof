import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last Updated: March 8, 2026</p>

          <div className="prose prose-blue max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to GETROOF ("Platform," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of the GETROOF platform, including our website and mobile applications. By accessing or using GETROOF, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 mt-3">
                GETROOF is a real estate marketplace platform that connects property owners, buyers, and registered brokers for property transactions within India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>"User"</strong> means any person accessing or using the Platform</li>
                <li><strong>"Seller"</strong> means a User who lists a property for sale or rent</li>
                <li><strong>"Buyer"</strong> means a User interested in purchasing or renting a property</li>
                <li><strong>"Broker"</strong> means a verified User registered to facilitate property transactions</li>
                <li><strong>"Property Listing"</strong> means information about a property posted on the Platform</li>
                <li><strong>"Commission"</strong> means the fee charged from the Seller upon successful property sale, used to pay Brokers and the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-3">To use certain features of GETROOF, you must create an account. You can register using:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">
                <li>Email and password</li>
                <li>Google OAuth authentication</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Account Responsibilities</h3>
              <p className="text-gray-700">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
                <li>Not share your account with others</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">3.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, illegal, or harmful activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Property Listings</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Listing Creation</h3>
              <p className="text-gray-700 mb-3">Sellers can list properties for FREE on GETROOF. When creating a listing, you must:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Provide accurate property information</li>
                <li>Upload genuine property photos (maximum 5 images)</li>
                <li>Specify correct location, price, and property details</li>
                <li>Have legal rights to sell or rent the property</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">4.2 Prohibited Listings</h3>
              <p className="text-gray-700 mb-2">You may NOT list:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Illegal or disputed properties</li>
                <li>Properties you do not own or have authorization to sell</li>
                <li>False, misleading, or fraudulent information</li>
                <li>Properties involved in legal disputes</li>
                <li>Adult content or inappropriate images</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">4.3 Listing Removal</h3>
              <p className="text-gray-700">
                GETROOF reserves the right to remove any listing that violates these Terms without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Broker Program</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1 Broker Registration</h3>
              <p className="text-gray-700 mb-3">Users can apply to become Brokers by providing:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Real estate license number (RERA registration)</li>
                <li>Years of experience in real estate</li>
                <li>Area of specialization</li>
                <li>Office location with GPS coordinates</li>
                <li>Service radius (1-50 km)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">5.2 Broker Verification</h3>
              <p className="text-gray-700">
                All Broker applications are subject to admin verification. GETROOF reserves the right to approve or reject any Broker application at its sole discretion.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">5.3 Commission Structure</h3>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-3">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ Important: Commission is charged from Seller only</p>
                <p className="text-gray-700 text-sm">Buyers are NOT charged any commission. The 1.49% commission is collected solely from the seller upon successful property sale.</p>
              </div>
              <p className="text-gray-700 mb-3">For successful property transactions facilitated by Brokers:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Total commission: 1.49%</strong> of the final sale price (charged from seller only)</li>
                <li><strong>Broker receives: 70%</strong> of the total commission</li>
                <li><strong>GETROOF receives: 30%</strong> as platform fee</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Commission is charged from the seller only — buyers are not charged any commission. Payments are processed within 2-3 business days after payment verification.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">5.4 Broker Responsibilities</h3>
              <p className="text-gray-700">Brokers must:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Maintain valid RERA registration</li>
                <li>Respond to buyer notifications within their service area</li>
                <li>Act professionally and ethically</li>
                <li>Comply with all real estate laws and regulations</li>
                <li>Provide accurate commission payment information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments and Transactions</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1 Payment Processing</h3>
              <p className="text-gray-700">
                All payments are processed through Cashfree, our third-party payment gateway. By making payments, you agree to Cashfree's terms and conditions.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">6.2 Payment Methods</h3>
              <p className="text-gray-700 mb-2">Accepted payment methods include:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Credit/Debit Cards</li>
                <li>Net Banking</li>
                <li>Wallet</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">6.3 Commission Payment Flow</h3>
              <p className="text-gray-700 mb-3">For property sales:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Broker marks property as sold and enters the sale price</li>
                <li>System calculates 1.49% commission on the sale price</li>
                <li>A QR code is generated for the seller to pay the commission</li>
                <li>Commission split is calculated (70% Broker, 30% Platform)</li>
                <li>Broker's share is credited within 2-3 business days</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">6.4 Refunds</h3>
              <p className="text-gray-700">
                Refunds are processed on a case-by-case basis. Please refer to our Refund Policy for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-700 mb-3">Users must NOT:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Post false, fraudulent, or misleading property listings</li>
                <li>Harass, abuse, or threaten other Users</li>
                <li>Attempt to bypass commission payments</li>
                <li>Use the Platform for illegal activities</li>
                <li>Scrape, copy, or reproduce Platform content without permission</li>
                <li>Interfere with Platform operations or security</li>
                <li>Create multiple accounts to manipulate the system</li>
                <li>Share login credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on GETROOF, including logos, designs, text, graphics, and software, is owned by GETROOF or its licensors and protected by Indian copyright and trademark laws.
              </p>
              <p className="text-gray-700 mt-3">
                Users retain ownership of their property listings and uploaded content but grant GETROOF a non-exclusive, worldwide license to use, display, and distribute such content on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.1 Platform Disclaimer</h3>
              <p className="text-gray-700">GETROOF is a marketplace platform only. We do NOT:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Own, sell, or rent properties listed on the Platform</li>
                <li>Guarantee the accuracy of property listings</li>
                <li>Verify property ownership or legal documentation</li>
                <li>Act as a real estate agent or broker</li>
                <li>Guarantee successful property transactions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">9.2 User Responsibility</h3>
              <p className="text-gray-700">
                Users are solely responsible for verifying property details, conducting due diligence, and complying with all legal requirements before entering into any transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700">To the maximum extent permitted by Indian law, GETROOF shall NOT be liable for:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Property disputes between Users</li>
                <li>Fraudulent listings or transactions</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Issues arising from third-party services (Cashfree, Google)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Our total liability for any claim shall not exceed the amount of commission fees paid by you in the 6 months prior to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">You agree to indemnify and hold GETROOF harmless from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Your violation of these Terms</li>
                <li>Your property listings or transactions</li>
                <li>Your violation of any law or third-party rights</li>
                <li>Your use of the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">12.1 Governing Law</h3>
              <p className="text-gray-700">
                These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan, India.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-3">12.2 Arbitration</h3>
              <p className="text-gray-700">
                Any dispute arising from these Terms shall first be attempted to be resolved through good-faith negotiations. If unresolved, disputes may be submitted to arbitration under the Indian Arbitration and Conciliation Act, 1996.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700">
                GETROOF reserves the right to modify these Terms at any time. We will notify Users of material changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700">For questions about these Terms, please contact us at:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                <p className="text-gray-800"><strong>GETROOF</strong></p>
                <p className="text-gray-700">Email: legal.getroof@gmail.com</p>
                <p className="text-gray-700">Support: support.getroof@gmail.com</p>
                <p className="text-gray-700">Phone: +91-7297018503</p>
              </div>
            </section>

            <section className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acknowledgment</h3>
              <p className="text-gray-700">
                By using GETROOF, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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

export default TermsAndConditions;