"use client";

import React, { useState } from 'react';
import { Star, Shield, Truck, CreditCard, ChevronRight, Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Zap, Globe, Award } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const featuredProducts = [
    {
      name: "TechFlow Smart Hub",
      price: "€189.99",
      image: "/api/placeholder/300/300",
      rating: 4.9,
      reviews: 1247,
      category: "Smart Technology"
    },
    {
      name: "ProForce Toolkit",
      price: "€124.99",
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviews: 892,
      category: "Professional Tools"
    },
    {
      name: "EcoFlow Energy Station",
      price: "€299.99",
      image: "/api/placeholder/300/300",
      rating: 4.7,
      reviews: 563,
      category: "Energy Solutions"
    }
  ];

  const coreFeatures = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "Global Express Delivery",
      description: "Swift international shipping with real-time tracking across 25+ countries"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      title: "Flexible Payment Options",
      description: "Multiple secure payment methods including installment plans"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Premium Warranty",
      description: "Extended 36-month warranty coverage on all technology products"
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Innovation First",
      description: "Cutting-edge technology solutions tested by industry experts"
    }
  ];

  const testimonials = [
    {
      name: "Alexandra Chen",
      role: "Technology Director",
      content: "iNordexa's solutions have transformed our workflow efficiency. Outstanding quality and support.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Engineering Manager",
      content: "Exceptional build quality and innovative design. These products exceed professional standards.",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Product Designer",
      content: "Perfect blend of functionality and aesthetics. iNordexa understands modern professional needs.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">iNordexa™</span>
              <span className="text-sm text-gray-600 ml-2 hidden sm:inline">Professional technology solutions for modern living</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors">Products</a>
              <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors">Products</a>
                <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors">Solutions</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Innovate Your
                <span className="text-blue-600"> Technology</span>
                <br />Experience
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover premium technology solutions engineered for professionals who demand excellence. 
                Transform your workspace with cutting-edge innovations designed for the digital age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                  Explore Solutions
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl h-96 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Globe className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Global Innovation</h3>
                  <p className="text-blue-100">Connecting technology worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose iNordexa™?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We deliver professional-grade technology solutions with unmatched quality, 
              innovative design, and comprehensive support for modern businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Featured Solutions</h2>
            <p className="text-xl text-gray-600">Professional technology products designed for excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                    <p className="font-medium">{product.category}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-current" : ""} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Trusted by professionals worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Technology?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who trust iNordexa™ for their technology needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Today
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">iNordexa™</h3>
              <p className="text-gray-300 text-sm mb-4">
                Leading provider of professional technology solutions for the modern digital workplace.
              </p>
              <div className="flex space-x-4">
                <Facebook size={20} className="text-gray-400 hover:text-white cursor-pointer" />
                <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer" />
                <Twitter size={20} className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Smart Technology</a></li>
                <li><a href="#" className="hover:text-white">Professional Tools</a></li>
                <li><a href="#" className="hover:text-white">Energy Solutions</a></li>
                <li><a href="#" className="hover:text-white">Custom Integration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/shipping" className="hover:text-white">Shipping Info</a></li>
                <li><a href="/returns" className="hover:text-white">Returns</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+44 20 7946 0958</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@inordexa.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>London, United Kingdom</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <p className="text-sm text-gray-400">
                  © 2025 iNordexa™. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</a>
                <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</a>
                <a href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookies</a>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 max-w-4xl mx-auto">
              <p className="mb-2">
                <strong>Legal Notice:</strong> iNordexa™ is a registered trademark. All prices include applicable taxes. 
                30-day return policy applies to all products. Warranty terms vary by product category.
                Seller: iNordexa Ltd., 27 Old Gloucester Street, London, WC1N 3AX, United Kingdom.
              </p>
              <p>
                <strong>Data Protection:</strong> We process personal data in accordance with GDPR and UK data protection laws. 
                See our Privacy Policy for details. This website uses analytics and marketing cookies for optimization.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;