"use client";

import React from 'react';
import { FileText, Scale, AlertTriangle, Shield, CreditCard, Truck } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Terms of Service</h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Please read these terms carefully before using our services
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Agreement to Terms</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-blue-800 mb-4">
                These Terms of Service ("Terms") govern your use of the Newheras™ website and services.
                By accessing or using our website, you agree to be bound by these Terms.
              </p>
              <p className="text-blue-700">
                If you disagree with any part of these terms, then you may not access our service.
              </p>
            </div>
          </div>

          {/* Company Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              Company Information
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Legal Entity</h3>
                  <p className="text-gray-600">Newheras™ S.r.l.</p>
                  <p className="text-gray-600">VAT ID: IT12345678901</p>
                  <p className="text-gray-600">Commercial Registry: Milan Court</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Registered Address</h3>
                  <p className="text-gray-600">Via Roma 123</p>
                  <p className="text-gray-600">20121 Milano, Italy</p>
                  <p className="text-gray-600">Email: legal@newheras.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use of Website */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Use of Our Website</h2>

            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Permitted Uses</h3>
                <ul className="list-disc list-inside text-green-800 space-y-2">
                  <li>Browse and purchase products for personal or business use</li>
                  <li>Create an account to track orders and preferences</li>
                  <li>Contact customer service for support</li>
                  <li>Share product links and recommendations</li>
                  <li>Leave reviews and feedback on purchased products</li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Prohibited Uses</h3>
                <ul className="list-disc list-inside text-red-800 space-y-2">
                  <li>Use the website for any unlawful purpose or activity</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the website's functionality</li>
                  <li>Use automated tools to scrape or download content</li>
                  <li>Impersonate other users or provide false information</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Products and Orders */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
              Products and Orders
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h3>
                <p className="text-gray-600 mb-3">
                  We strive to display accurate product information, including descriptions, prices, and images.
                  However, we do not warrant that product descriptions or other content is error-free, complete, or current.
                </p>
                <p className="text-gray-600">
                  All prices are displayed in Euros (€) and include applicable taxes where required by law.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Acceptance</h3>
                <p className="text-gray-600 mb-3">
                  Your order constitutes an offer to purchase products. All orders are subject to acceptance by us.
                  We reserve the right to refuse or cancel any order for any reason, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Product unavailability</li>
                  <li>Pricing errors</li>
                  <li>Suspected fraudulent activity</li>
                  <li>Inability to authorize payment</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h3>
                <p className="text-gray-600 mb-3">
                  We accept various payment methods including credit cards, bank transfers, and cash on delivery.
                  Payment is due upon order completion unless otherwise specified.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Online Payments</h4>
                    <p className="text-gray-600">Processed immediately upon order confirmation</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cash on Delivery</h4>
                    <p className="text-gray-600">Payment due upon receipt of goods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping and Delivery */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="w-8 h-8 text-blue-600 mr-3" />
              Shipping and Delivery
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">
                We provide shipping services across Europe. Delivery times and costs are specified during checkout
                and may vary based on your location and the products ordered.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Responsibility</h3>
                  <p className="text-gray-600">
                    Risk of loss and title to products pass to you upon delivery to the carrier.
                    We are not responsible for delays caused by shipping carriers or customs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Attempts</h3>
                  <p className="text-gray-600">
                    If delivery cannot be completed, the carrier will attempt redelivery or hold the package
                    for pickup as per their standard procedures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Returns and Refunds */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Returns and Refunds</h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-blue-800 mb-4">
                You have the right to return products within 30 days of delivery for a full refund,
                subject to our return policy conditions.
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-blue-900">Return Conditions</h4>
                  <p className="text-blue-800">Products must be unused, in original packaging, and in resaleable condition</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Refund Processing</h4>
                  <p className="text-blue-800">Refunds are processed within 5-10 business days after we receive the returned item</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liability and Warranties */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-8 h-8 text-blue-600 mr-3" />
              Liability and Warranties
            </h2>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-900 mb-4">Limitation of Liability</h3>
                <p className="text-yellow-800 mb-3">
                  To the maximum extent permitted by law, Newheras™ shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages, including but not limited to loss of profits,
                  data, or goodwill.
                </p>
                <p className="text-yellow-800">
                  Our total liability to you for all claims arising from or related to our services shall not exceed
                  the amount you paid for the specific product or service in question.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Product Warranties</h3>
                <p className="text-green-800 mb-3">
                  Products come with manufacturer warranties where applicable. We provide a 30-day satisfaction guarantee
                  in addition to any manufacturer warranties.
                </p>
                <p className="text-green-800">
                  For defective products, we will repair, replace, or refund at our discretion within the warranty period.
                </p>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">
                The website and its original content, features, and functionality are and will remain the exclusive
                property of Newheras™ and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Our Rights</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Website design and content</li>
                    <li>• Newheras™ trademark and logo</li>
                    <li>• Product descriptions and images</li>
                    <li>• Software and functionality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Your Rights</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Limited license to use our website</li>
                    <li>• Right to share product links</li>
                    <li>• Personal use of purchased products</li>
                    <li>• Leave reviews and feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Governing Law */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Governing Law and Jurisdiction</h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-blue-800 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Italy,
                without regard to its conflict of law principles.
              </p>
              <p className="text-blue-700">
                Any disputes arising from these Terms or your use of our services shall be subject to the
                exclusive jurisdiction of the courts of Milan, Italy.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">User Accounts</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Creation</h3>
                <p className="text-gray-600 mb-3">
                  You may create an account to access certain features of our service. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Providing accurate and complete information</li>
                  <li>Maintaining the security of your account credentials</li>
                  <li>Notifying us of any unauthorized use of your account</li>
                  <li>Keeping your account information up to date</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Termination</h3>
                <p className="text-gray-600 mb-3">
                  We reserve the right to terminate or suspend your account at our sole discretion, without notice,
                  for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p className="text-gray-600">
                  You may also terminate your account at any time by contacting our customer service team.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy and Data Protection */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              Privacy and Data Protection
            </h2>

            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-lg text-purple-800 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy,
                which is incorporated into these Terms by reference.
              </p>
              <p className="text-purple-700">
                By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              <div className="mt-4">
                <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold underline">
                  Read our full Privacy Policy →
                </a>
              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dispute Resolution</h2>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Customer Service First</h3>
              <p className="text-green-800 mb-4">
                We encourage you to contact our customer service team first to resolve any issues.
                Most disputes can be resolved quickly and amicably through direct communication.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">EU Consumer Rights</h4>
                  <p className="text-green-800">
                    EU consumers have access to the European Commission's Online Dispute Resolution platform
                    for online purchases.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Mediation</h4>
                  <p className="text-green-800">
                    Before pursuing legal action, we encourage mediation through recognized
                    consumer mediation services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Force Majeure */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Force Majeure</h2>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <p className="text-lg text-yellow-800 mb-4">
                We shall not be liable for any failure or delay in performance under these Terms due to circumstances
                beyond our reasonable control, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>Natural disasters, epidemics, or pandemics</li>
                <li>Government actions or regulations</li>
                <li>Labor strikes or transportation disruptions</li>
                <li>Technical failures or cyber attacks</li>
                <li>Supply chain disruptions</li>
              </ul>
            </div>
          </div>

          {/* Modifications */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Modifications to Terms</h2>

            <div className="bg-orange-50 p-6 rounded-lg">
              <p className="text-lg text-orange-800 mb-4">
                We reserve the right to modify or replace these Terms at any time at our sole discretion.
                If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-orange-700">
                Your continued use of our service after any such changes constitutes acceptance of the new Terms.
                If you do not agree to the new Terms, please stop using our service.
              </p>
            </div>
          </div>

          {/* Severability */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Severability</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-600">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed
                and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law,
                and the remaining provisions will continue in full force and effect.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-blue-800 mb-6">
                If you have any questions about these Terms of Service, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Legal Department</h3>
                  <div className="space-y-2 text-blue-800">
                    <p>Email: legal@newheras.com</p>
                    <p>Phone: +39 02 1234 5678</p>
                    <p>Address: Via Roma 123, 20121 Milano, Italy</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Response Time</h3>
                  <p className="text-blue-800">
                    We will respond to legal inquiries within 5 business days.
                    For urgent legal matters, please call our legal hotline.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our legal team is available to clarify any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@newheras.com"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Email Legal Team
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}