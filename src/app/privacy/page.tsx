"use client";

import React from 'react';
import { Shield, Eye, Lock, Users, Globe, AlertTriangle, Mail, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Privacy Policy</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-gray-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Last updated: August 1, 2025</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
            <p className="text-lg text-gray-600 mb-4">
              Newheras™ ("we," "our," or "us") is committed to protecting your privacy and ensuring the security
              of your personal information. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website or make a purchase from us.
            </p>
            <p className="text-lg text-gray-600">
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="w-8 h-8 text-green-600 mr-3" />
              Information We Collect
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                <p className="text-gray-600 mb-3">We may collect personally identifiable information that you voluntarily provide to us when you:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Create an account on our website</li>
                  <li>Make a purchase or place an order</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us for support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="text-gray-600 mt-3">This information may include:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Payment information (processed securely by third parties)</li>
                  <li>Order history and preferences</li>
                  <li>Communication history with our support team</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatically Collected Information</h3>
                <p className="text-gray-600 mb-3">When you visit our website, we may automatically collect certain information, including:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>IP address and location information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referral sources</li>
                  <li>Device information and screen resolution</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookies and Tracking Technologies</h3>
                <p className="text-gray-600">
                  We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience,
                  analyze site traffic, and understand where our visitors are coming from. You can control cookies
                  through your browser settings.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              How We Use Your Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Order Processing</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Process and fulfill your orders</li>
                  <li>• Send order confirmations and updates</li>
                  <li>• Handle payments and billing</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Communication</h3>
                <ul className="text-purple-800 space-y-1">
                  <li>• Send promotional emails (with consent)</li>
                  <li>• Respond to your inquiries</li>
                  <li>• Send important account notifications</li>
                  <li>• Conduct surveys and gather feedback</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Website Improvement</h3>
                <ul className="text-green-800 space-y-1">
                  <li>• Analyze website usage and performance</li>
                  <li>• Improve user experience</li>
                  <li>• Develop new features and services</li>
                  <li>• Prevent fraud and ensure security</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Legal Compliance</h3>
                <ul className="text-orange-800 space-y-1">
                  <li>• Comply with legal obligations</li>
                  <li>• Protect our rights and property</li>
                  <li>• Ensure platform security</li>
                  <li>• Investigate violations of our terms</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="w-8 h-8 text-green-600 mr-3" />
              Information Sharing and Disclosure
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">We DO NOT sell your personal information</h3>
              <p className="text-yellow-700">
                We respect your privacy and will never sell, rent, or lease your personal information to third parties for marketing purposes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Providers</h3>
                <p className="text-gray-600 mb-3">We may share your information with trusted third-party service providers who assist us in:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Payment processing (Stripe, PayPal, etc.)</li>
                  <li>Shipping and delivery services</li>
                  <li>Email marketing platforms</li>
                  <li>Website analytics and hosting</li>
                  <li>Customer support systems</li>
                </ul>
                <p className="text-gray-600 mt-3">These providers are contractually obligated to keep your information secure and confidential.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Requirements</h3>
                <p className="text-gray-600">
                  We may disclose your information if required to do so by law or if we believe in good faith that
                  such action is necessary to comply with legal obligations, protect our rights, investigate fraud,
                  or ensure the safety of our users.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-8 h-8 text-green-600 mr-3" />
              Data Security
            </h2>

            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-lg text-green-800 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-green-900 mb-3">Technical Measures</h3>
                  <ul className="text-green-800 space-y-1">
                    <li>• SSL encryption for data transmission</li>
                    <li>• Secure servers and databases</li>
                    <li>• Regular security audits</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-3">Organizational Measures</h3>
                  <ul className="text-green-800 space-y-1">
                    <li>• Employee training on data protection</li>
                    <li>• Limited access to personal data</li>
                    <li>• Regular policy reviews and updates</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              Your Rights Under GDPR
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Access and Portability</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Right to access your personal data</li>
                  <li>• Right to receive data in portable format</li>
                  <li>• Right to know how data is processed</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Control and Correction</h3>
                <ul className="text-purple-800 space-y-1">
                  <li>• Right to correct inaccurate data</li>
                  <li>• Right to update your information</li>
                  <li>• Right to restrict processing</li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Deletion and Objection</h3>
                <ul className="text-red-800 space-y-1">
                  <li>• Right to erasure ("right to be forgotten")</li>
                  <li>• Right to object to processing</li>
                  <li>• Right to withdraw consent</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Legal Remedies</h3>
                <ul className="text-orange-800 space-y-1">
                  <li>• Right to file complaints with authorities</li>
                  <li>• Right to judicial remedies</li>
                  <li>• Right to compensation for damages</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Retention</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Account Data</h3>
                  <p className="text-gray-600">Retained while your account is active, plus 3 years after closure</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <p className="text-gray-600">Retained for 7 years for tax and legal compliance purposes</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Marketing Data</h3>
                  <p className="text-gray-600">Retained until you unsubscribe or withdraw consent</p>
                </div>
              </div>
            </div>
          </div>

          {/* International Transfers */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">International Data Transfers</h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-blue-800 mb-4">
                Your information may be transferred to and processed in countries other than your own. When we transfer personal data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place.
              </p>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Adequacy Decisions</h4>
                    <p className="text-blue-800">We transfer data to countries with EU adequacy decisions when possible</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Standard Contractual Clauses</h4>
                    <p className="text-blue-800">We use EU-approved Standard Contractual Clauses for other transfers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Children's Privacy</h2>

            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <p className="text-lg text-red-800 mb-4">
                Our services are not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
              <p className="text-red-700">
                If we discover that a child under 16 has provided us with personal information, we will delete such information from our files promptly.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600 mb-6">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Data Protection Officer</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>privacy@newheras.com</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Via Roma 123, 20121 Milano, Italy</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Response Time</h3>
                  <p className="text-gray-600">
                    We will respond to your privacy-related requests within 30 days as required by GDPR.
                    For urgent matters, please mark your email as "URGENT - Privacy Request."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes to Policy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <p className="text-lg text-yellow-800 mb-4">
                We may update our Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
              </p>
              <p className="text-yellow-700">
                We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our Data Protection Officer is here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@newheras.com"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Email Privacy Team
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}