"use client";

import React, { useState } from 'react';
import { Cookie, Settings, Eye, BarChart, Target, Shield, AlertTriangle } from 'lucide-react';

export default function CookiePolicy() {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true,
    analytics: true,
    marketing: true,
    preferences: true
  });

  const handleCookieToggle = (type: keyof typeof cookieSettings) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled

    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      type: "essential",
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Essential Cookies",
      description: "Required for basic website functionality, security, and your shopping cart. Cannot be disabled.",
      examples: ["Session management", "Security tokens", "Shopping cart contents", "Language preferences"],
      required: true
    },
    {
      type: "analytics",
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website to improve user experience.",
      examples: ["Google Analytics", "Page views", "User behavior", "Performance metrics"],
      required: false
    },
    {
      type: "marketing",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Marketing Cookies",
      description: "Used to deliver personalized advertisements and measure advertising effectiveness.",
      examples: ["Facebook Pixel", "Google Ads", "Retargeting", "Conversion tracking"],
      required: false
    },
    {
      type: "preferences",
      icon: <Settings className="w-6 h-6 text-orange-600" />,
      title: "Preference Cookies",
      description: "Remember your choices and settings to provide a personalized experience.",
      examples: ["Theme preferences", "Currency selection", "Previous searches", "Wishlist items"],
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Cookie Policy</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Learn about how we use cookies to enhance your browsing experience
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

      {/* What Are Cookies */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Cookie className="w-8 h-8 text-orange-600 mr-3" />
              What Are Cookies?
            </h2>

            <div className="bg-orange-50 p-6 rounded-lg">
              <p className="text-lg text-orange-800 mb-4">
                Cookies are small text files that are stored on your device when you visit a website.
                They help websites remember information about your visit, making your next visit easier and more useful.
              </p>
              <p className="text-orange-700">
                Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies"
                (remain on your device for a set period or until manually deleted).
              </p>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="w-8 h-8 text-orange-600 mr-3" />
              How We Use Cookies
            </h2>

            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {cookie.icon}
                      <h3 className="text-xl font-semibold text-gray-900 ml-3">{cookie.title}</h3>
                    </div>
                    <div className="flex items-center">
                      {cookie.required ? (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                          Required
                        </span>
                      ) : (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookieSettings[cookie.type as keyof typeof cookieSettings]}
                            onChange={() => handleCookieToggle(cookie.type as keyof typeof cookieSettings)}
                            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Enable</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{cookie.description}</p>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                    <div className="flex flex-wrap gap-2">
                      {cookie.examples.map((example, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cookie Management */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Browser Settings</h3>
                <p className="text-blue-800 mb-4">
                  You can control and manage cookies through your web browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete cookies individually or all at once</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block all cookies (may affect website functionality)</li>
                  <li>Set cookies to be automatically deleted when you close your browser</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Third-Party Opt-Outs</h3>
                <p className="text-purple-800 mb-4">
                  For third-party cookies used for advertising and analytics, you can opt out directly:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Google Analytics</h4>
                    <p className="text-purple-800 text-sm">Use Google's opt-out browser add-on</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Facebook Pixel</h4>
                    <p className="text-purple-800 text-sm">Manage ad preferences in your Facebook account</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Our Cookie Settings</h3>
                <p className="text-green-800 mb-4">
                  Use the toggles above to customize your cookie preferences on our website.
                  Your choices will be remembered for future visits.
                </p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Save Cookie Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Cookie List */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Cookie List</h2>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purpose</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">_session</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Maintains user session and shopping cart</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Session</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">Essential</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">_ga</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Google Analytics tracking</td>
                    <td className="px-6 py-4 text-sm text-gray-600">2 years</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">Analytics</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">_fbp</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Facebook Pixel tracking</td>
                    <td className="px-6 py-4 text-sm text-gray-600">3 months</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-medium">Marketing</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">preferences</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Stores user preferences and settings</td>
                    <td className="px-6 py-4 text-sm text-gray-600">1 year</td>
                    <td className="px-6 py-4 text-sm text-orange-600 font-medium">Preferences</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions About Cookies?</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600 mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Privacy Team</h3>
                  <p className="text-gray-600">Email: privacy@newheras.com</p>
                  <p className="text-gray-600">Phone: +39 02 1234 5678</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Response Time</h3>
                  <p className="text-gray-600">
                    We typically respond to cookie-related inquiries within 48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Manage Your Cookie Preferences</h2>
          <p className="text-xl mb-8 opacity-90">
            Take control of your privacy settings
          </p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Open Cookie Settings
          </button>
        </div>
      </section>
    </div>
  );
}