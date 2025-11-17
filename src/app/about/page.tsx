"use client";

import React from 'react';
import { Shield, Users, Globe, Zap, Award, Target, ChevronRight, Star, Lightbulb, Clock } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
      title: "Innovation Excellence",
      description: "Pioneering cutting-edge technology solutions that set industry standards"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Uncompromising Quality",
      description: "Rigorous testing and premium materials ensure lasting performance"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Client-Centric Approach",
      description: "Tailored solutions designed around real-world professional requirements"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: "Global Expertise",
      description: "International perspective with deep understanding of diverse markets"
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Foundation",
      description: "Established with vision to revolutionize professional technology solutions"
    },
    {
      year: "2021",
      title: "European Expansion",
      description: "Launched operations across 15 European markets with local partnerships"
    },
    {
      year: "2023",
      title: "Innovation Hub",
      description: "Opened advanced R&D facility in London focusing on emerging technologies"
    },
    {
      year: "2024",
      title: "Global Recognition",
      description: "Received industry awards for technological excellence and sustainability"
    }
  ];

  const team = [
    {
      name: "Dr. Elena Richardson",
      role: "Chief Executive Officer",
      background: "Former VP of Innovation at leading tech multinational",
      expertise: "Strategic Leadership, Technology Vision"
    },
    {
      name: "Marcus Chen",
      role: "Chief Technology Officer", 
      background: "Ex-Senior Engineering Director with 15+ years experience",
      expertise: "Product Development, Technical Architecture"
    },
    {
      name: "Sarah Mitchell",
      role: "Head of Global Operations",
      background: "International business strategist and operations expert",
      expertise: "Supply Chain, Quality Management"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">About iNordexa™</h1>
          <p className="text-xl text-center max-w-4xl mx-auto opacity-90">
            We are a forward-thinking technology company dedicated to delivering professional-grade 
            solutions that empower businesses and individuals to achieve extraordinary results through innovation.
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2019, iNordexa™ emerged from a shared vision: to bridge the gap between 
                advanced technology and practical professional applications. We believe that exceptional 
                innovation should be accessible, reliable, and transformative.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our commitment extends beyond product development to encompass comprehensive support, 
                sustainable practices, and long-term partnerships that drive meaningful progress 
                in the digital transformation landscape.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white p-3 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Our Vision</h4>
                  <p className="text-gray-600">Leading global technology innovation for professional excellence</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                    <div className="text-sm text-gray-600">Satisfied Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
                    <div className="text-sm text-gray-600">Global Markets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                    <div className="text-sm text-gray-600">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
                    <div className="text-sm text-gray-600">Product Solutions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The fundamental principles that guide every decision and drive our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our evolution as a technology leader</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-0.5 bg-blue-600"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8'}`}>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-full lg:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Leadership Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals driving innovation and growth</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{member.name}</h3>
                <p className="text-blue-600 text-center font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm mb-3">{member.background}</p>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 font-medium">Expertise: {member.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose iNordexa™?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Industry Recognition</h4>
                    <p className="text-gray-600">Award-winning technology solutions recognized by international industry bodies</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Proven Track Record</h4>
                    <p className="text-gray-600">Five years of consistent growth and client satisfaction across global markets</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cutting-Edge Innovation</h4>
                    <p className="text-gray-600">Continuous investment in R&D ensuring our solutions stay ahead of market trends</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Ready to Experience Professional Excellence?</h3>
                <p className="mb-6 opacity-90">
                  Join the growing community of professionals who trust iNordexa™ 
                  for their critical technology needs.
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center">
                  Start Your Journey
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}