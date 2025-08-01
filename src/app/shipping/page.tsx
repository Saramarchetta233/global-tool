"use client";

import React from 'react';
import { Truck, Clock, MapPin, Package, CreditCard, Shield } from 'lucide-react';

export default function ShippingInfo() {
  const countries = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
    "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania",
    "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden"
  ];

  const shippingTimes = [
    { region: "Italy", time: "1-2 business days", cost: "Free" },
    { region: "Western Europe", time: "2-4 business days", cost: "Free" },
    { region: "Central Europe", time: "3-5 business days", cost: "Free" },
    { region: "Northern Europe", time: "4-6 business days", cost: "Free" },
    { region: "Eastern Europe", time: "5-7 business days", cost: "Free" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Shipping Information</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Fast, reliable, and free delivery across Europe
          </p>
        </div>
      </div>

      {/* Quick Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">On all orders across Europe</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">1-7 business days depending on location</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Packaging</h3>
              <p className="text-gray-600">Your items arrive safely protected</p>
            </div>
          </div>

          {/* Delivery Times */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Delivery Times by Region</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Region</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Delivery Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shippingTimes.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.region}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.time}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{item.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Countries We Ship To */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Countries We Ship To</h2>
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {countries.map((country, index) => (
                  <div key={index} className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-700">{country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Shipping Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Placed</h3>
              <p className="text-gray-600">You place your order online and receive confirmation</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing</h3>
              <p className="text-gray-600">We prepare and package your items within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipped</h3>
              <p className="text-gray-600">Your package is shipped with tracking information</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivered</h3>
              <p className="text-gray-600">Your order arrives at your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Policies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Shipping Policies</h2>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-2" />
                Packaging & Handling
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>• All items are carefully packaged with protective materials</li>
                <li>• Fragile items receive extra padding and "Fragile" labels</li>
                <li>• Orders are processed Monday through Friday</li>
                <li>• Same-day shipping for orders placed before 2 PM CET</li>
                <li>• All packages include tracking information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                Payment & Delivery
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Cash on Delivery (COD) available in all countries</li>
                <li>• No additional fees for COD service</li>
                <li>• Adult signature required for delivery</li>
                <li>• Redelivery attempts if you're not home</li>
                <li>• Safe location delivery options available</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="space-y-2 text-yellow-700">
              <li>• Delivery times may be extended during holidays and peak seasons</li>
              <li>• Remote or rural areas may require additional 1-2 business days</li>
              <li>• Weather conditions may occasionally affect delivery schedules</li>
              <li>• You'll receive tracking information via email once your order ships</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Shipping?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our customer service team is here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:info@newheras.com"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}