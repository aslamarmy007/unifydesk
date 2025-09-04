import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import ThreeJSAnimation from './ThreeJSAnimation';

export default function Footer() {
  return (
    <footer className="relative z-10 glass-card border-t-0 border-x-0 border-b-0 rounded-none mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Address */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-4 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 animate-glow relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl opacity-20 animate-pulse-custom"></div>
                <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
                <svg className="w-7 h-7 text-white relative z-10 drop-shadow-sm" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor" stroke="none" opacity="0.3"/>
                  <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="8" cy="17" r="1.5" fill="currentColor" stroke="none"/>
                  <path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke="currentColor" fill="none"/>
                  <path d="M8.5 7h7.5M8.5 12h7.5M8.5 17h7.5" stroke="currentColor" stroke-width="1.2"/>
                </svg>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl opacity-20 blur-sm"></div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">UnifyDesk</h3>
            </div>
            <address className="text-sm text-gray-600 dark:text-gray-400 not-italic leading-relaxed">
              <p>123 Innovation Street</p>
              <p>Tech District, Mumbai 400001</p>
              <p>Maharashtra, India</p>
              <p className="mt-2">
                <a href="tel:+91-22-12345678" className="hover:text-yellow-600">+91-22-12345678</a>
              </p>
              <p>
                <a href="mailto:contact@unifydesk.com" className="hover:text-yellow-600">contact@unifydesk.com</a>
              </p>
            </address>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Dashboard</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Workspace</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Projects</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Team</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Settings</a></li>
            </ul>
          </div>

          {/* Other Pages */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Other Pages</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Contact</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Careers</a></li>
            </ul>
          </div>

          {/* Social Media and Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                <FaLinkedin className="text-lg" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                <FaFacebook className="text-lg" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                <FaInstagram className="text-lg" />
              </a>
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 transition-colors duration-200">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 UnifyDesk. All rights reserved. | Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
