import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

// CountryStateCity API integration
const CSC_API_BASE = 'https://api.countrystatecity.in/v1';
const CSC_API_KEY = process.env.COUNTRYSTATECITY_API_KEY || 'YOUR_API_KEY_HERE';

// Cache for API responses to improve performance
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchFromCSCAPI(endpoint: string) {
  const cacheKey = endpoint;
  const cached = apiCache.get(cacheKey);
  
  // Return cached data if it's still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`${CSC_API_BASE}${endpoint}`, {
      headers: {
        'X-CSCAPI-KEY': CSC_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Error fetching from CSC API (${endpoint}):`, error);
    // Return fallback data if API fails
    return getFallbackData(endpoint);
  }
}

function getFallbackData(endpoint: string) {
  // Comprehensive fallback data for all Indian states and UTs
  if (endpoint.includes('/states')) {
    return [
      { name: 'Andhra Pradesh', iso2: 'AP' },
      { name: 'Arunachal Pradesh', iso2: 'AR' },
      { name: 'Assam', iso2: 'AS' },
      { name: 'Bihar', iso2: 'BR' },
      { name: 'Chhattisgarh', iso2: 'CG' },
      { name: 'Goa', iso2: 'GA' },
      { name: 'Gujarat', iso2: 'GJ' },
      { name: 'Haryana', iso2: 'HR' },
      { name: 'Himachal Pradesh', iso2: 'HP' },
      { name: 'Jharkhand', iso2: 'JH' },
      { name: 'Karnataka', iso2: 'KA' },
      { name: 'Kerala', iso2: 'KL' },
      { name: 'Madhya Pradesh', iso2: 'MP' },
      { name: 'Maharashtra', iso2: 'MH' },
      { name: 'Manipur', iso2: 'MN' },
      { name: 'Meghalaya', iso2: 'ML' },
      { name: 'Mizoram', iso2: 'MZ' },
      { name: 'Nagaland', iso2: 'NL' },
      { name: 'Odisha', iso2: 'OR' },
      { name: 'Punjab', iso2: 'PB' },
      { name: 'Rajasthan', iso2: 'RJ' },
      { name: 'Sikkim', iso2: 'SK' },
      { name: 'Tamil Nadu', iso2: 'TN' },
      { name: 'Telangana', iso2: 'TS' },
      { name: 'Tripura', iso2: 'TR' },
      { name: 'Uttar Pradesh', iso2: 'UP' },
      { name: 'Uttarakhand', iso2: 'UK' },
      { name: 'West Bengal', iso2: 'WB' },
      // Union Territories
      { name: 'Andaman and Nicobar Islands', iso2: 'AN' },
      { name: 'Chandigarh', iso2: 'CH' },
      { name: 'Dadra and Nagar Haveli and Daman and Diu', iso2: 'DH' },
      { name: 'Delhi', iso2: 'DL' },
      { name: 'Jammu and Kashmir', iso2: 'JK' },
      { name: 'Ladakh', iso2: 'LA' },
      { name: 'Lakshadweep', iso2: 'LD' },
      { name: 'Puducherry', iso2: 'PY' },
    ];
  }
  
  // Fallback cities data for major states
  const stateCitiesMap: Record<string, any[]> = {
    'MH': [
      { name: 'Mumbai' }, { name: 'Pune' }, { name: 'Nagpur' }, { name: 'Nashik' }, 
      { name: 'Aurangabad' }, { name: 'Solapur' }, { name: 'Thane' }, { name: 'Kolhapur' }
    ],
    'DL': [
      { name: 'New Delhi' }, { name: 'Central Delhi' }, { name: 'North Delhi' }, 
      { name: 'South Delhi' }, { name: 'East Delhi' }, { name: 'West Delhi' }
    ],
    'KA': [
      { name: 'Bangalore' }, { name: 'Mysore' }, { name: 'Mangalore' }, { name: 'Hubli' }, 
      { name: 'Belgaum' }, { name: 'Gulbarga' }, { name: 'Davanagere' }
    ],
    'TN': [
      { name: 'Chennai' }, { name: 'Coimbatore' }, { name: 'Madurai' }, { name: 'Salem' }, 
      { name: 'Tiruchirappalli' }, { name: 'Vellore' }, { name: 'Tirunelveli' }
    ],
    'GJ': [
      { name: 'Ahmedabad' }, { name: 'Surat' }, { name: 'Vadodara' }, { name: 'Rajkot' }, 
      { name: 'Bhavnagar' }, { name: 'Jamnagar' }, { name: 'Gandhinagar' }
    ],
    'UP': [
      { name: 'Lucknow' }, { name: 'Kanpur' }, { name: 'Ghaziabad' }, { name: 'Agra' }, 
      { name: 'Varanasi' }, { name: 'Meerut' }, { name: 'Allahabad' }
    ],
    'RJ': [
      { name: 'Jaipur' }, { name: 'Jodhpur' }, { name: 'Udaipur' }, { name: 'Kota' }, 
      { name: 'Bikaner' }, { name: 'Ajmer' }, { name: 'Alwar' }
    ],
    'WB': [
      { name: 'Kolkata' }, { name: 'Howrah' }, { name: 'Durgapur' }, { name: 'Asansol' }, 
      { name: 'Siliguri' }, { name: 'Bardhaman' }, { name: 'Malda' }
    ]
  };
  
  // Extract state code from endpoint like /countries/IN/states/MH/cities
  const stateCodeMatch = endpoint.match(/\/states\/([A-Z]{2})\/cities/);
  if (stateCodeMatch) {
    const stateCode = stateCodeMatch[1];
    return stateCitiesMap[stateCode] || [];
  }
  
  return [];
}

// Rate limiter for OTP requests
const otpLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many OTP requests, please try again later.',
});

// Email transporter - disabled for demo
const transporter = null;

// Mock email function for demo
async function sendEmail(to: string, subject: string, html: string) {
  // In demo mode, just log the email instead of actually sending
  console.log('📧 Email would be sent to:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 Content:', html.substring(0, 100) + '...');
  return true; // Always return success for demo
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}



export async function registerRoutes(app: Express): Promise<Server> {
  
  // Check username availability
  app.get('/api/check-username/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      res.json({ available: !user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Check email availability
  app.get('/api/check-email/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      res.json({ available: !user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Check phone availability
  app.get('/api/check-phone/:phone', async (req, res) => {
    try {
      const { phone } = req.params;
      const user = await storage.getUserByPhone(phone);
      res.json({ available: !user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Send OTP
  app.post('/api/send-otp', otpLimiter, async (req, res) => {
    try {
      const { identifier, type } = req.body;
      
      if (!identifier || !type || !['email', 'phone'].includes(type)) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      // Check existing OTP
      const existingOtp = await storage.getValidOtp(identifier, type);
      if (existingOtp && (existingOtp.resends || 0) >= 5) {
        return res.status(429).json({ message: 'Maximum resend limit reached' });
      }

      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      if (existingOtp) {
        await storage.deleteOtp(existingOtp.id);
      }

      const otp = await storage.createOtp({
        identifier,
        code,
        type,
        attempts: 0,
        resends: existingOtp ? (existingOtp.resends || 0) + 1 : 0,
        expiresAt,
      });

      // Send OTP
      if (type === 'email') {
        const success = await sendEmail(
          identifier,
          'UnifyDesk - Email Verification Code',
          `<h2>Your verification code is: <strong>${code}</strong></h2><p>This code will expire in 5 minutes.</p>`
        );
        console.log(`📧 Email OTP for ${identifier}: ${code}`); // Show OTP in console for demo
      } else {
        // For demo purposes, log the SMS OTP
        console.log(`📱 SMS OTP for ${identifier}: ${code}`);
      }

      res.json({ 
        success: true, 
        attemptsRemaining: 10,
        resendRemaining: 5 - (otp.resends || 0)
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Verify OTP
  app.post('/api/verify-otp', async (req, res) => {
    try {
      const { identifier, type, code } = req.body;

      if (!identifier || !type || !code) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const otp = await storage.getValidOtp(identifier, type);
      if (!otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      if ((otp.attempts || 0) >= 10) {
        return res.status(429).json({ message: 'Maximum attempts exceeded' });
      }

      if (otp.code !== code) {
        await storage.updateOtpAttempts(otp.id, (otp.attempts || 0) + 1);
        return res.status(400).json({ 
          message: 'Invalid OTP',
          attemptsRemaining: 10 - (otp.attempts || 0) - 1
        });
      }

      // OTP verified successfully
      await storage.deleteOtp(otp.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get Indian states from CountryStateCity API
  app.get('/api/states', async (req, res) => {
    try {
      const statesData = await fetchFromCSCAPI('/countries/IN/states');
      
      // Transform API response to our format
      const states = statesData.map((state: any) => ({
        value: state.iso2.toLowerCase(),
        label: state.name,
        code: state.iso2
      }));

      res.json(states);
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get cities by state from CountryStateCity API
  app.get('/api/cities/:state', async (req, res) => {
    try {
      const { state } = req.params;
      
      // Convert state parameter to uppercase (API expects state codes like MH, DL, etc.)
      const stateCode = state.toUpperCase();
      
      const citiesData = await fetchFromCSCAPI(`/countries/IN/states/${stateCode}/cities`);
      
      // Transform API response to our format
      const cities = citiesData.map((city: any) => ({
        value: city.name.toLowerCase().replace(/\s+/g, '-'),
        label: city.name,
        latitude: city.latitude,
        longitude: city.longitude
      }));

      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User registration
  app.post('/api/signup', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username) ||
                          await storage.getUserByEmail(validatedData.email) ||
                          await storage.getUserByPhone(validatedData.phone);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Send welcome email
      await sendEmail(
        user.email,
        'Welcome to UnifyDesk!',
        `<h2>Welcome ${user.firstName}!</h2><p>Your account has been created successfully.</p>`
      );

      // Create session
      const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await storage.createSession({
        sessionId,
        userId: user.id,
        expiresAt,
      });

      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username, email: user.email },
        sessionId 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
