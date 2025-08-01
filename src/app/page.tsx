"use client";

import React, { useState } from 'react';
import { Star, Shield, Truck, CreditCard, ChevronRight, Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const products = [
    {
      name: "Professional Stapler",
      price: "€29.99",
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviews: 245
    },
    {
      name: "Smart Watch Pro",
      price: "€149.99",
      image: "/api/placeholder/300/300",
      rating: 4.9,
      reviews: 892
    },
    {
      name: "Garden Trimmer",
      price: "€89.99",
      image: "/api/placeholder/300/300",
      rating: 4.7,
      reviews: 156
    }
  ];

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "Free Europe-wide Delivery",
      description: "Fast and reliable shipping across all European countries"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      title: "Pay on Delivery",
      description: "Secure cash on delivery payment option available"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Quality Guarantee",
      description: "30-day money-back guarantee on all products"
    }
  ];

  const testimonials = [
    {
      name: "Maria Schmidt",
      location: "Germany",
      text: "Amazing quality products and fast delivery. The smartwatch exceeded my expectations!",
      rating: 5
    },
    {
      name: "Jean Dupont",
      location: "France",
      text: "Professional tools at great prices. The pay on delivery option gave me confidence to order.",
      rating: 5
    },
    {
      name: "Alessandro Rossi",
      location: "Italy",
      text: "Excellent customer service and high-quality products. Highly recommended!",
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Newheras™</span>
              <span className="text-sm text-gray-600 ml-2 hidden sm:inline">Creative tools for your everyday life</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => scrollToSection('products')} className="text-gray-700 hover:text-blue-600 transition-colors">Products</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition-colors">About Us</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">Contact</button>
            </nav>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => scrollToSection('home')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Home</button>
              <button onClick={() => scrollToSection('products')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Products</button>
              <button onClick={() => scrollToSection('about')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">About Us</button>
              <button onClick={() => scrollToSection('contact')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Contact</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Creative Tools for Your
              <span className="text-blue-600 block">Everyday Life</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover high-quality tools and gadgets designed to enhance your daily routine.
              From professional staplers to smart watches and garden equipment - we've got you covered across Europe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection('products')}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Shop Now <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Carefully selected tools for modern living</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{product.name}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {renderStars(Math.floor(product.rating))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Newheras™?</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Newheras™, we believe that the right tools can transform your everyday experiences.
                Founded with a passion for innovation and quality, we curate exceptional products that
                combine functionality with style.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality Assurance</h3>
                    <p className="text-gray-600">Every product is rigorously tested to meet our high standards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Europe-wide Reach</h3>
                    <p className="text-gray-600">Serving customers across all European countries with reliable delivery</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                    <p className="text-gray-600">Pay on delivery option for your peace of mind</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-lg text-blue-700">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">We're here to help with any questions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+44 7353023196</p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@newheras.com</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">Milan, Italy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h3 className="text-xl font-bold mb-4">Newheras™</h3>
              <p className="text-gray-400 mb-4">Creative tools for your everyday life</p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Office Tools</a></li>
                <li><a href="#" className="hover:text-white">Smart Devices</a></li>
                <li><a href="#" className="hover:text-white">Garden Equipment</a></li>
                <li><a href="#" className="hover:text-white">Home Accessories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Newheras™. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-white">Privacy Policy</a>
                <a href="/terms" className="hover:text-white">Terms of Service</a>
                <a href="/cookies" className="hover:text-white">Cookie Policy</a>
                <a href="/gdpr" className="hover:text-white">GDPR Compliance</a>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p className="mb-2">
                <strong>Legal Notice:</strong> Newheras™ is a registered trademark. All product names, logos, and brands are property of their respective owners.
              </p>
              <p className="mb-2">
                <strong>Delivery:</strong> Free delivery across Europe. Cash on delivery available. Delivery times: 3-7 business days.
              </p>
              <p className="mb-2">
                <strong>Returns:</strong> 30-day return policy. Items must be in original condition. Customer service: info@newheras.com
              </p>
              <p>
                <strong>Business Registration:</strong> VAT ID: IT12345678901 | Commercial Registry: Milan Court |
                Registered Office: Via Roma 123, 20121 Milano, Italy
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;