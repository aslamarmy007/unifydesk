import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThreeJSAnimation from '@/components/ThreeJSAnimation';
import OTPVerification from '@/components/OTPVerification';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import VisualCaptcha from '@/components/VisualCaptcha';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').regex(/^[A-Za-z]+$/, 'First name must contain only letters'),
  lastName: z.string().optional().refine((val) => !val || /^[A-Za-z]+$/.test(val), 'Last name must contain only letters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').regex(/^[A-Za-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender' }),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine((val) => {
    const today = new Date();
    const birthDate = new Date(val);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    return actualAge >= 18;
  }, 'You must be at least 18 years old'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
  nationality: z.string().default('Indian'),
  state: z.string().min(1, 'Please select a state'),
  city: z.string().min(1, 'Please select a city'),
  address: z.string().min(1, 'Address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]+$/, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  captcha: z.string().min(1, 'Please enter the captcha'),
  terms: z.boolean().refine(val => val, 'You must agree to the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [phoneStatus, setPhoneStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [nameErrors, setNameErrors] = useState({ firstName: '', lastName: '' });
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [lastOtpSent, setLastOtpSent] = useState({ email: 0, phone: 0 });
  
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nationality: 'Indian',
    },
  });

  const { watch, setValue, setError, clearErrors } = form;
  const watchedPassword = watch('password');


  // Fetch states
  const { data: states } = useQuery({
    queryKey: ['/api/states'],
    staleTime: Infinity,
  });

  // Fetch cities when state changes
  const { data: cities } = useQuery({
    queryKey: ['/api/cities', selectedStateCode],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/cities/${selectedStateCode}`);
      return response.json();
    },
    enabled: !!selectedStateCode,
    staleTime: Infinity,
  });

  // Username availability check
  const checkUsername = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest('GET', `/api/check-username/${username}`);
      return response.json();
    },
    onMutate: () => setUsernameStatus('checking'),
    onSuccess: (data) => {
      setUsernameStatus(data.available ? 'available' : 'taken');
      if (!data.available) {
        setError('username', { message: 'Username is already taken' });
      } else {
        clearErrors('username');
      }
    },
    onError: () => setUsernameStatus(null),
  });

  // Email availability check
  const checkEmail = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('GET', `/api/check-email/${email}`);
      return response.json();
    },
    onMutate: () => setEmailStatus('checking'),
    onSuccess: (data) => {
      setEmailStatus(data.available ? 'available' : 'taken');
      if (!data.available) {
        setError('email', { message: 'Email is already registered' });
      } else {
        clearErrors('email');
      }
    },
    onError: () => setEmailStatus(null),
  });

  // Phone availability check
  const checkPhone = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest('GET', `/api/check-phone/${phone}`);
      return response.json();
    },
    onMutate: () => setPhoneStatus('checking'),
    onSuccess: (data) => {
      setPhoneStatus(data.available ? 'available' : 'taken');
      if (!data.available) {
        setError('phone', { message: 'Phone number is already registered' });
      } else {
        clearErrors('phone');
      }
    },
    onError: () => setPhoneStatus(null),
  });

  // Send OTP mutation
  const sendOTP = useMutation({
    mutationFn: async ({ identifier, type }: { identifier: string; type: 'email' | 'phone' }) => {
      const response = await apiRequest('POST', '/api/send-otp', { identifier, type });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${variables.type}.`,
      });
      if (variables.type === 'email') {
        setShowEmailOTP(true);
      } else {
        setShowPhoneOTP(true);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  // Signup mutation
  const signup = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiRequest('POST', '/api/signup', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created Successfully!",
        description: "Please check your email for verification.",
      });
      // Store session and redirect
      sessionStorage.setItem('sessionId', data.sessionId);
      // In a real app, you'd redirect to a success page
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Session management
  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('sessionId', sessionId);
    
    // Auto-refresh after 1 hour
    const timer = setTimeout(() => {
      if (confirm('Your session is about to expire. Would you like to refresh the page?')) {
        window.location.reload();
      }
    }, 3600000); // 1 hour

    return () => clearTimeout(timer);
  }, []);

  const handleUsernameChange = (value: string) => {
    setValue('username', value);
    if (value.length >= 3) {
      checkUsername.mutate(value);
    } else {
      setUsernameStatus(null);
    }
  };

  const handleEmailChange = (value: string) => {
    setValue('email', value);
    
    // Reset verification if email changed from verified email
    if (currentEmail && currentEmail !== value && emailVerified) {
      setEmailVerified(false);
      setShowEmailOTP(false);
      setCurrentEmail('');
      toast({
        title: "Email Changed",
        description: "Please verify your new email address.",
        variant: "destructive",
      });
    }
    
    if (value.includes('@')) {
      checkEmail.mutate(value);
    } else {
      setEmailStatus(null);
    }
  };

  const handlePhoneChange = (value: string) => {
    setValue('phone', value);
    
    // Reset verification if phone changed from verified phone
    if (currentPhone && currentPhone !== value && phoneVerified) {
      setPhoneVerified(false);
      setShowPhoneOTP(false);
      setCurrentPhone('');
      toast({
        title: "Phone Changed",
        description: "Please verify your new phone number.",
        variant: "destructive",
      });
    }
    
    if (value.length === 10) {
      checkPhone.mutate(value);
    } else {
      setPhoneStatus(null);
    }
  };

  // Live validation for names
  const validateName = (name: string, field: 'firstName' | 'lastName') => {
    let error = '';
    if (name && /\s/.test(name)) {
      error = 'No spaces allowed';
    } else if (name && /\d/.test(name)) {
      error = 'No numbers allowed';
    } else if (name && /[^A-Za-z]/.test(name)) {
      error = 'Only letters allowed';
    }
    
    setNameErrors(prev => ({ ...prev, [field]: error }));
    
    // Auto-hide error after 6 seconds
    if (error) {
      setTimeout(() => {
        setNameErrors(prev => ({ ...prev, [field]: '' }));
      }, 6000);
    }
    
    return error === '';
  };

  const handleNameChange = (value: string, field: 'firstName' | 'lastName') => {
    setValue(field, value);
    validateName(value, field);
  };

  const handleStateChange = (value: string) => {
    // Find the selected state data to get the code
    const selectedStateData = Array.isArray(states) ? states.find((state: any) => state.value === value) : null;
    
    setSelectedState(value);
    setSelectedStateCode(selectedStateData?.code || value); // Use the state code for API calls
    setValue('state', value);
    setValue('city', ''); // Reset city when state changes
  };

  const handleEmailVerify = () => {
    const email = form.getValues('email');
    const now = Date.now();
    
    // Check if 3 minutes have passed since last OTP
    if (lastOtpSent.email && (now - lastOtpSent.email) < 180000) {
      const remaining = Math.ceil((180000 - (now - lastOtpSent.email)) / 1000);
      toast({
        title: "Please wait",
        description: `You can resend OTP in ${remaining} seconds`,
        variant: "destructive",
      });
      return;
    }
    
    setCurrentEmail(email);
    setLastOtpSent(prev => ({ ...prev, email: now }));
    sendOTP.mutate({ identifier: email, type: 'email' });
  };

  const handlePhoneVerify = () => {
    const phone = form.getValues('phone');
    const now = Date.now();
    
    // Check if 3 minutes have passed since last OTP
    if (lastOtpSent.phone && (now - lastOtpSent.phone) < 180000) {
      const remaining = Math.ceil((180000 - (now - lastOtpSent.phone)) / 1000);
      toast({
        title: "Please wait",
        description: `You can resend OTP in ${remaining} seconds`,
        variant: "destructive",
      });
      return;
    }
    
    setCurrentPhone(phone);
    setLastOtpSent(prev => ({ ...prev, phone: now }));
    sendOTP.mutate({ identifier: phone, type: 'phone' });
  };

  const onSubmit = (data: SignupFormData) => {
    if (!emailVerified) {
      toast({
        title: "Email Not Verified",
        description: "Please verify your email address before creating an account.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number before creating an account.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaValid) {
      toast({
        title: "Invalid Captcha",
        description: "Please enter the correct captcha.",
        variant: "destructive",
      });
      return;
    }

    signup.mutate(data);
  };

  const renderValidationIcon = (status: string | null, isLoading?: boolean) => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    if (status === 'available') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'taken') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900 animate-morph-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl animate-pulse-custom"></div>
      </div>
      
      <Header />
      
      <main className="relative z-10 min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-slide-in-down">
            <div className="inline-flex items-center justify-center mb-6">
              <ThreeJSAnimation type="welcome" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-yellow-100 dark:to-white bg-clip-text text-transparent mb-4 leading-tight">
              Welcome to UnifyDesk
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
              Create your account and join thousands of professionals who trust UnifyDesk for their unified workspace needs.
            </p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>

          {/* Signup Form Card */}
          <div className="max-w-3xl mx-auto animate-slide-in-up">
            <Card className="glass-card shadow-2xl border-0 relative overflow-hidden">
              {/* Card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-600/5 pointer-events-none"></div>
              <CardContent className="p-10 sm:p-12 relative z-10">
                

                {/* Signup Form */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Name Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-foreground flex items-center">
                        First Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        className="modern-input h-12 text-base font-medium"
                        onChange={(e) => handleNameChange(e.target.value, 'firstName')}
                      />
                      {nameErrors.firstName && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium animate-slide-in-up">{nameErrors.firstName}</p>
                      )}
                      {form.formState.errors.firstName && !nameErrors.firstName && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        className="modern-input h-12 text-base font-medium"
                        onChange={(e) => handleNameChange(e.target.value, 'lastName')}
                      />
                      {nameErrors.lastName && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium animate-slide-in-up">{nameErrors.lastName}</p>
                      )}
                      {form.formState.errors.lastName && !nameErrors.lastName && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="username"
                        placeholder="Choose a unique username"
                        onChange={(e) => handleUsernameChange(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {renderValidationIcon(usernameStatus, checkUsername.isPending)}
                      </div>
                    </div>
                    {usernameStatus === 'available' && (
                      <p className="text-xs text-green-500 mt-1">Username is available!</p>
                    )}
                    {form.formState.errors.username && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.username.message}</p>
                    )}
                  </div>

                  {/* Gender and Date of Birth Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center">
                        Gender <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Controller
                        name="gender"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="modern-input h-12 text-base font-medium">
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.gender && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.gender.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-foreground flex items-center">
                        Date of Birth <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...form.register('dateOfBirth')}
                        className="modern-input h-12 text-base font-medium"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {form.formState.errors.dateOfBirth && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.dateOfBirth.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="pr-24"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {renderValidationIcon(emailStatus, checkEmail.isPending)}
                        {emailStatus === 'available' && !emailVerified && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleEmailVerify}
                            disabled={sendOTP.isPending}
                          >
                            Verify
                          </Button>
                        )}
                        {emailVerified && (
                          <div className="flex items-center space-x-1">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-blue-500 font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <OTPVerification
                      identifier={form.getValues('email')}
                      type="email"
                      isVisible={showEmailOTP}
                      onVerified={() => {
                        setEmailVerified(true);
                        setShowEmailOTP(false);
                      }}
                      onClose={() => setShowEmailOTP(false)}
                    />

                    {form.formState.errors.email && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">+91</span>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-3"></div>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, ''))}
                        className="pl-20 pr-24"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {renderValidationIcon(phoneStatus, checkPhone.isPending)}
                        {phoneStatus === 'available' && !phoneVerified && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handlePhoneVerify}
                            disabled={sendOTP.isPending}
                          >
                            Verify
                          </Button>
                        )}
                        {phoneVerified && (
                          <div className="flex items-center space-x-1">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-blue-500 font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <OTPVerification
                      identifier={form.getValues('phone')}
                      type="phone"
                      isVisible={showPhoneOTP}
                      onVerified={() => {
                        setPhoneVerified(true);
                        setShowPhoneOTP(false);
                      }}
                      onClose={() => setShowPhoneOTP(false)}
                    />

                    {form.formState.errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  {/* Nationality (Read-only) */}
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value="Indian"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>

                  {/* State and City Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-semibold text-foreground flex items-center">
                        State <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select onValueChange={handleStateChange}>
                        <SelectTrigger className="modern-input h-12 text-base font-medium">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(states) ? states.map((state: any) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          )) : []}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.state && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold text-foreground flex items-center">
                        City <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select onValueChange={(value) => setValue('city', value)} disabled={!selectedState}>
                        <SelectTrigger className="modern-input h-12 text-base font-medium">
                          <SelectValue placeholder={selectedState ? "Select City" : "Please select state first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(cities) ? cities.map((city: any) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          )) : []}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.city && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="address"
                      rows={3}
                      {...form.register('address')}
                      placeholder="Enter your complete address"
                      className="resize-none"
                    />
                    {form.formState.errors.address && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  {/* Password Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...form.register('password')}
                          placeholder="Create a strong password"
                          className="pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      
                      <PasswordStrengthMeter password={watchedPassword || ''} />

                      {form.formState.errors.password && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground flex items-center">
                        Confirm Password <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...form.register('confirmPassword')}
                          placeholder="Confirm your password"
                          className={`modern-input h-12 text-base font-medium pr-12 ${
                            watch('confirmPassword') && watch('password') && watch('confirmPassword') === watch('password')
                              ? 'border-green-500 focus:border-green-500'
                              : watch('confirmPassword') && watch('password') && watch('confirmPassword') !== watch('password')
                              ? 'border-red-500 focus:border-red-500'
                              : ''
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {watch('confirmPassword') && watch('password') && watch('confirmPassword') === watch('password') && (
                        <p className="text-xs text-green-500 mt-2 font-medium flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Passwords match
                        </p>
                      )}
                      {form.formState.errors.confirmPassword && (
                        <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center">
                      Security Verification <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex items-center space-x-4">
                      <VisualCaptcha
                        value={captchaValue}
                        onChange={setCaptchaValue}
                        onValidation={setCaptchaValid}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCaptchaValid(captchaValue.length === 5)}
                        className="h-10 px-6 font-medium"
                      >
                        Verify
                      </Button>
                    </div>
                    {captchaValid && (
                      <p className="text-xs text-green-500 mt-2 font-medium flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Captcha verified
                      </p>
                    )}
                    {form.formState.errors.captcha && (
                      <p className="error-message show text-xs text-red-500 mt-2 font-medium">{form.formState.errors.captcha.message}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      onCheckedChange={(checked) => setValue('terms', !!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-6">
                      I agree to the <a href="#" className="text-yellow-600 hover:text-yellow-700 font-medium">Terms and Conditions</a> and <a href="#" className="text-yellow-600 hover:text-yellow-700 font-medium">Privacy Policy</a>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                  </div>
                  {form.formState.errors.terms && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.terms.message}</p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                      disabled={signup.isPending}
                    >
                      {signup.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account? 
                      <a href="#" className="text-yellow-600 hover:text-yellow-700 font-medium ml-1">Sign In</a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
