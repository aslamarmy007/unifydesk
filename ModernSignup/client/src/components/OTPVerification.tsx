import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  identifier: string;
  type: 'email' | 'phone';
  isVisible: boolean;
  onVerified: () => void;
  onClose: () => void;
}

export default function OTPVerification({ 
  identifier, 
  type, 
  isVisible, 
  onVerified, 
  onClose 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [attemptsRemaining, setAttemptsRemaining] = useState(10);
  const [resendRemaining, setResendRemaining] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [lastResendTime, setLastResendTime] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isVisible]);

  // Timer for resend countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(digit => digit) && value) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await apiRequest('POST', '/api/verify-otp', {
        identifier,
        type,
        code,
      });

      if (response.ok) {
        toast({
          title: "Verification Successful",
          description: `Your ${type} has been verified successfully.`,
        });
        onVerified();
        onClose(); // Close OTP modal on success
      } else {
        const data = await response.json();
        const newAttempts = data.attemptsRemaining !== undefined ? data.attemptsRemaining : Math.max(0, attemptsRemaining - 1);
        setAttemptsRemaining(newAttempts);
        setOtp(['', '', '', '', '', '']); // Clear OTP on wrong attempt
        inputRefs.current[0]?.focus();
        
        toast({
          title: "Wrong OTP",
          description: `You entered wrong OTP. ${newAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendRemaining <= 0 || resendTimer > 0) return;

    setIsResending(true);
    try {
      const response = await apiRequest('POST', '/api/send-otp', {
        identifier,
        type,
      });

      if (response.ok) {
        const data = await response.json();
        setResendRemaining(data.resendRemaining || resendRemaining - 1);
        setAttemptsRemaining(10); // Reset attempts on new OTP
        setOtp(['', '', '', '', '', '']);
        setResendTimer(180); // Start 3-minute countdown
        inputRefs.current[0]?.focus();
        
        toast({
          title: "OTP Resent",
          description: `A new OTP has been sent to your ${type}.`,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Resend Failed",
          description: data.message || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {type === 'email' ? 'Email' : 'Phone'} Verification
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resendRemaining <= 0 || isResending || resendTimer > 0}
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          {isResending ? 'Sending...' : 
           resendTimer > 0 ? `Resend in ${Math.floor(resendTimer/60)}:${(resendTimer%60).toString().padStart(2, '0')}` : 
           'Resend OTP'}
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-10 text-center border-blue-300 dark:border-blue-600 focus:ring-blue-500"
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-blue-600 dark:text-blue-300">
          Attempts remaining: {attemptsRemaining}
        </span>
        <span className="text-blue-600 dark:text-blue-300">
          Resends: {resendRemaining}
        </span>
      </div>

      {attemptsRemaining <= 0 && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          Maximum attempts exceeded. Please try again later.
        </div>
      )}
    </div>
  );
}
