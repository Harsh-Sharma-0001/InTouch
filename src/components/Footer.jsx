import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'API', href: '#' },
      { name: 'About', href: '/about' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Webinars', href: '#' },
      { name: 'Community', href: '#' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-dark-card border-t border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logo}
                alt="InTouch Logo"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="text-white font-bold text-xl">InTouch</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Revolutionizing the way companies conduct interviews. Our AI-powered platform 
              provides secure, efficient, and insightful remote interviewing solutions.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail size={16} className="text-primary" />
                <span>intouch.buisness01@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone size={16} className="text-primary" />
                <span>+91 7505459909</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <MapPin size={16} className="text-primary" />
                <span>GLA University,17km Stone, NH-19, Mathura-Delhi Road, P.O. Chaumuhan, Mathura-281406, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border-color pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col items-center md:items-start space-y-1 text-gray-400 text-sm">
              <span>© {currentYear} InTouch. All rights reserved.</span>
              <span className="flex items-center">
                Made with <Heart size={12} className="text-red-500 mx-1" /> for better interviews
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 