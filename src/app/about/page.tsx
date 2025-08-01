"use client";

import React from 'react';
import { Shield, Truck, Award, Users, Globe, Heart } from 'lucide-react';

export default function AboutUs() {
  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Quality First",
      description: "Every product is carefully selected and tested to meet our high standards of excellence."
    },
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "Fast Delivery",
      description: "Reliable shipping across Europe with tracking and secure packaging."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Customer Satisfaction",
      description: "Our customers' happiness is our top priority, with 30-day satisfaction guarantee."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Expert Team",
      description: "Our dedicated team brings years of experience in product curation and customer service."
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: "European Reach",
      description: "Serving customers across all European countries with localized support."
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: "Passion Driven",
      description: "We're passionate about bringing innovative tools that enhance everyday life."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">About Newheras™</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Discover the story behind our mission to bring creative tools for your everyday life
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 2020, Newheras™ began with a simple vision: to make high-quality,
                innovative tools accessible to everyone across Europe. What started as a small
                passion project has grown into a trusted brand serving thousands of customers.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We believe that the right tools can transform ordinary moments into extraordinary
                experiences. Whether it's a professional stapler that makes office work more
                efficient, a smartwatch that keeps you connected, or garden equipment that helps
                you create beautiful outdoor spaces.
              </p>
              <p className="text-lg text-gray-600">
                Our team carefully curates each product, ensuring it meets our strict standards
                for quality, functionality, and design. We're not just selling products – we're
                providing solutions that enhance your daily life.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-lg text-blue-700 mb-4">Happy Customers</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">27</div>
              <div className="text-lg text-blue-700 mb-4">European Countries</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-lg text-blue-700">Products Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              To democratize access to high-quality tools and gadgets across Europe, making
              innovation affordable and accessible to everyone. We strive to enhance daily
              life through carefully curated products that combine functionality, design,
              and value.
            </p>
            <div className="bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">Why Choose Newheras™?</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">✓ Rigorous Quality Control</h4>
                  <p className="text-blue-700">Every product undergoes thorough testing before reaching our customers.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">✓ European-wide Service</h4>
                  <p className="text-blue-700">Comprehensive coverage across all 27 European Union countries.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">✓ Secure Payment Options</h4>
                  <p className="text-blue-700">Pay on delivery option for complete peace of mind.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">✓ Customer-first Approach</h4>
                  <p className="text-blue-700">30-day return policy and dedicated customer support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Newheras™ Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers across Europe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}