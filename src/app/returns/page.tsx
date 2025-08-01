"use client";

import React from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, Truck, CreditCard } from 'lucide-react';

export default function Returns() {
  const returnSteps = [
    {
      step: 1,
      title: "Contact Us",
      description: "Email us at returns@newheras.com or use our contact form",
      timeframe: "Within 30 days"
    },
    {
      step: 2,
      title: "Get Authorization",
      description: "Receive your Return Authorization (RA) number",
      timeframe: "Within 24 hours"
    },
    {
      step: 3,
      title: "Package Items",
      description: "Pack items in original packaging with RA number",
      timeframe: "Same day"
    },
    {
      step: 4,
      title: "Ship Back",
      description: "Use provided prepaid shipping label",
      timeframe: "Within 7 days"
    },
    {
      step: 5,
      title: "Processing",
      description: "We inspect and process your return",
      timeframe: "3-5 business days"
    },
    {
      step: 6,
      title: "Refund",
      description: "Refund issued to original payment method",
      timeframe: "5-10 business days"
    }
  ];

  const eligibleItems = [
    "Unused items in original packaging",
    "Items with all original accessories",
    "Products within 30-day return window",
    "Items in resaleable condition",
    "Products with original receipt/order confirmation"
  ];

  const nonEligibleItems = [
    "Used or damaged items",
    "Items without original packaging",
    "Products returned after 30 days",
    "Personalized or customized items",
    "Items damaged by misuse"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Returns & Refunds</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Easy 30-day returns with free return shipping across Europe
          </p>
        </div>
      </div>

      {/* Quick Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">30-Day Window</h3>
              <p className="text-gray-600">Return items within 30 days of delivery</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Return Shipping</h3>
              <p className="text-gray-600">We provide prepaid return labels</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Refund</h3>
              <p className="text-gray-600">100% refund for eligible returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Return an Item</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 mb-3">{step.description}</p>
                <div className="text-sm text-orange-600 font-medium">{step.timeframe}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Return Eligibility</h2>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-green-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Eligible for Return
              </h3>
              <ul className="space-y-3">
                {eligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start text-green-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-red-800 mb-6 flex items-center">
                <XCircle className="w-6 h-6 mr-2" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-3">
                {nonEligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start text-red-700">
                    <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Refund Information</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Refund Methods</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Original Payment Method</h4>
                  <p className="text-gray-600">Refunds are processed to your original payment method (bank transfer, credit card, etc.)</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Cash on Delivery Orders</h4>
                  <p className="text-gray-600">For COD orders, refunds are issued via bank transfer to your provided account</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Refund Timeline</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Time</h4>
                  <p className="text-gray-600">3-5 business days after we receive your returned item</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Bank Transfer</h4>
                  <p className="text-gray-600">5-10 business days depending on your bank</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Credit Card</h4>
                  <p className="text-gray-600">3-5 business days to appear on your statement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchanges */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Exchanges</h2>

          <div className="bg-blue-50 rounded-lg p-8 text-center max-w-4xl mx-auto">
            <RotateCcw className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">Want to Exchange an Item?</h3>
            <p className="text-lg text-blue-700 mb-6">
              We don't offer direct exchanges, but our return and reorder process is quick and easy!
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Step 1: Return</h4>
                <p className="text-blue-700">Return your original item following our return process</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Step 2: Reorder</h4>
                <p className="text-blue-700">Place a new order for the item you want instead</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What if my item arrived damaged?</h3>
              <p className="text-gray-600">Contact us immediately with photos of the damage. We'll arrange a free return and replacement or full refund.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I return items bought with Cash on Delivery?</h3>
              <p className="text-gray-600">Yes! COD orders follow the same return policy. Refunds are issued via bank transfer.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What if I'm past the 30-day window?</h3>
              <p className="text-gray-600">Contact our customer service team. While our standard policy is 30 days, we may make exceptions for special circumstances.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do I need to pay for return shipping?</h3>
              <p className="text-gray-600">No! We provide free prepaid return labels for all eligible returns within Europe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Returns */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with a Return?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our customer service team is ready to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:returns@newheras.com"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Email Returns Team
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}