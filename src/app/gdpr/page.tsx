"use client";

import React, { useState } from 'react';
import { Shield, Eye, Lock, Download, Trash2, Edit, AlertCircle, CheckCircle, Mail, Phone } from 'lucide-react';

export default function GDPRCompliance() {
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestDetails: '',
    identityProof: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('GDPR Request submitted:', { requestType, ...formData });
    alert('Your GDPR request has been submitted. We will respond within 30 days.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const gdprRights = [
    {
      icon: <Eye className="w-8 h-8 text-blue-600" />,
      title: "Right of Access",
      description: "Request a copy of all personal data we hold about you",
      action: "Request My Data",
      timeframe: "Within 30 days"
    },
    {
      icon: <Edit className="w-8 h-8 text-green-600" />,
      title: "Right to Rectification",
      description: "Correct any inaccurate or incomplete personal data",
      action: "Update My Information",
      timeframe: "Within 30 days"
    },
    {
      icon: <Trash2 className="w-8 h-8 text-red-600" />,
      title: "Right to Erasure",
      description: "Request deletion of your personal data ('Right to be Forgotten')",
      action: "Delete My Data",
      timeframe: "Within 30 days"
    },
    {
      icon: <Lock className="w-8 h-8 text-purple-600" />,
      title: "Right to Restrict Processing",
      description: "Limit how we process your personal data",
      action: "Restrict Processing",
      timeframe: "Within 30 days"
    },
    {
      icon: <Download className="w-8 h-8 text-orange-600" />,
      title: "Right to Data Portability",
      description: "Receive your data in a structured, machine-readable format",
      action: "Export My Data",
      timeframe: "Within 30 days"
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-yellow-600" />,
      title: "Right to Object",
      description: "Object to processing of your personal data for specific purposes",
      action: "Object to Processing",
      timeframe: "Immediately"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">GDPR Compliance</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Your data protection rights under the General Data Protection Regulation
          </p>
        </div>
      </div>

      {/* GDPR Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your GDPR Rights</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Under the General Data Protection Regulation (GDPR), you have specific rights regarding your personal data.
              We are committed to respecting these rights and making them easily accessible to you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gdprRights.map((right, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {right.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{right.title}</h3>
                <p className="text-gray-600 mb-4 text-center">{right.description}</p>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-3">{right.timeframe}</div>
                  <button
                    onClick={() => setRequestType(right.title)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {right.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GDPR Request Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit a GDPR Request</h2>
            <p className="text-xl text-gray-600">
              Use this form to exercise your data protection rights
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Request *
                </label>
                <select
                  id="requestType"
                  name="requestType"
                  required
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a request type</option>
                  <option value="Right of Access">Right of Access - Request my data</option>
                  <option value="Right to Rectification">Right to Rectification - Correct my data</option>
                  <option value="Right to Erasure">Right to Erasure - Delete my data</option>
                  <option value="Right to Restrict Processing">Right to Restrict Processing</option>
                  <option value="Right to Data Portability">Right to Data Portability - Export my data</option>
                  <option value="Right to Object">Right to Object to processing</option>
                  <option value="Withdraw Consent">Withdraw Consent</option>
                  <option value="Other">Other GDPR-related request</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your full legal name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Email associated with your account"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="identityProof" className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Verification
                </label>
                <input
                  type="text"
                  id="identityProof"
                  name="identityProof"
                  value={formData.identityProof}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Last 4 digits of phone number or order number for verification"
                />
                <p className="text-sm text-gray-500 mt-1">
                  To protect your privacy, we may require additional verification for certain requests
                </p>
              </div>

              <div>
                <label htmlFor="requestDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Request Details *
                </label>
                <textarea
                  id="requestDetails"
                  name="requestDetails"
                  required
                  rows={4}
                  value={formData.requestDetails}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Please provide specific details about your request..."
                ></textarea>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800">
                    <p className="font-medium mb-1">Important Notice:</p>
                    <p className="text-sm">
                      We will respond to your request within 30 days as required by GDPR.
                      For identity verification, we may contact you using the information provided.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Submit GDPR Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Data Processing Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How We Process Your Data</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Legal Basis for Processing
              </h3>
              <div className="space-y-3 text-blue-800">
                <div>
                  <h4 className="font-semibold">Contract Performance</h4>
                  <p className="text-sm">Processing necessary to fulfill your orders and provide services</p>
                </div>
                <div>
                  <h4 className="font-semibold">Legitimate Interest</h4>
                  <p className="text-sm">Improving our services, fraud prevention, and business operations</p>
                </div>
                <div>
                  <h4 className="font-semibold">Consent</h4>
                  <p className="text-sm">Marketing communications and optional features (with your permission)</p>
                </div>
                <div>
                  <h4 className="font-semibold">Legal Obligation</h4>
                  <p className="text-sm">Compliance with tax, accounting, and other legal requirements</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2" />
                Data Protection Measures
              </h3>
              <div className="space-y-3 text-green-800">
                <div>
                  <h4 className="font-semibold">Technical Safeguards</h4>
                  <p className="text-sm">SSL encryption, secure servers, access controls, regular security audits</p>
                </div>
                <div>
                  <h4 className="font-semibold">Organizational Measures</h4>
                  <p className="text-sm">Staff training, data minimization, privacy by design principles</p>
                </div>
                <div>
                  <h4 className="font-semibold">Third-Party Agreements</h4>
                  <p className="text-sm">Data processing agreements with all service providers</p>
                </div>
                <div>
                  <h4 className="font-semibold">Regular Reviews</h4>
                  <p className="text-sm">Ongoing assessment of data protection practices and policies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Transfers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">International Data Transfers</h2>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Transfer Safeguards</h3>
                <p className="text-gray-600 mb-4">
                  When we transfer personal data outside the European Economic Area (EEA),
                  we ensure appropriate safeguards are in place to protect your data.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    EU Adequacy Decisions for approved countries
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Standard Contractual Clauses (SCCs) with service providers
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Binding Corporate Rules for multinational companies
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Providers</h3>
                <p className="text-gray-600 mb-4">
                  We work with trusted service providers who are contractually bound to protect your data:
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-900">Payment Processing</h4>
                    <p className="text-sm text-gray-600">Stripe (Ireland), PayPal (Luxembourg) - EU-based processing</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-900">Email Services</h4>
                    <p className="text-sm text-gray-600">EU-based email providers with GDPR compliance</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-900">Analytics</h4>
                    <p className="text-sm text-gray-600">Google Analytics with IP anonymization and data retention limits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Retention */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Data Retention Periods</h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-900">Data Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-900">Retention Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-900">Legal Basis</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-900">Deletion Process</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Account Information</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Active account + 3 years after closure</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Contract performance</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Automatic deletion</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Order History</td>
                  <td className="px-6 py-4 text-sm text-gray-600">7 years from purchase date</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Legal obligation (tax law)</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Automatic deletion</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Marketing Data</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Until consent withdrawal</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Consent</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Immediate upon request</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Website Analytics</td>
                  <td className="px-6 py-4 text-sm text-gray-600">26 months (Google Analytics)</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Legitimate interest</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Automatic deletion</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Support Communications</td>
                  <td className="px-6 py-4 text-sm text-gray-600">3 years from last contact</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Legitimate interest</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Manual review and deletion</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Breach Notification */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Data Breach Procedures</h2>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  Our Commitment
                </h3>
                <p className="text-red-800 mb-4">
                  In the unlikely event of a data breach that poses a risk to your rights and freedoms,
                  we are committed to:
                </p>
                <ul className="space-y-2 text-red-800">
                  <li>• Notify supervisory authorities within 72 hours</li>
                  <li>• Inform affected individuals without undue delay</li>
                  <li>• Provide clear information about the breach</li>
                  <li>• Take immediate steps to contain and remedy the breach</li>
                  <li>• Implement additional safeguards to prevent future incidents</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What We'll Tell You</h3>
                <p className="text-gray-600 mb-4">
                  If we need to notify you about a data breach, our communication will include:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Nature of the breach and data involved</li>
                  <li>• Likely consequences of the breach</li>
                  <li>• Measures taken to address the breach</li>
                  <li>• Steps you can take to protect yourself</li>
                  <li>• Contact information for further questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supervisory Authority */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Your Right to Lodge a Complaint</h2>

          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">Supervisory Authority</h3>
            <p className="text-lg text-blue-800 mb-6">
              If you believe we have not handled your personal data properly, you have the right to lodge
              a complaint with your local data protection authority.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold text-blue-900 mb-2">Italian Data Protection Authority</h4>
                <p className="text-blue-800 text-sm mb-2">Garante per la protezione dei dati personali</p>
                <p className="text-blue-700 text-sm">
                  Website: www.gpdp.it<br />
                  Email: garante@gpdp.it<br />
                  Phone: +39 06 69677 1
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-blue-900 mb-2">European Data Protection Board</h4>
                <p className="text-blue-800 text-sm mb-2">For EU-wide coordination</p>
                <p className="text-blue-700 text-sm">
                  Website: edpb.europa.eu<br />
                  Find your local authority on their website
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">GDPR Questions or Concerns?</h2>
            <p className="text-xl opacity-90">
              Our Data Protection Officer is here to help
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="opacity-90 mb-4">Direct line to our Data Protection Officer</p>
              <a
                href="mailto:dpo@newheras.com"
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
              >
                dpo@newheras.com
              </a>
            </div>

            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="opacity-90 mb-4">Speak directly with our privacy team</p>
              <a
                href="tel:+390212345678"
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
              >
                +39 02 1234 5678
              </a>
            </div>

            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Postal Address</h3>
              <p className="opacity-90 mb-4">For formal written requests</p>
              <div className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium">
                <div className="text-sm">
                  Data Protection Officer<br />
                  Newheras™ S.r.l.<br />
                  Via Roma 123<br />
                  20121 Milano, Italy
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Response Guarantee</h3>
              <p className="opacity-90">
                We guarantee to respond to all GDPR requests within 30 days as required by law.
                For complex requests, we may extend this period by an additional 60 days with proper notification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}