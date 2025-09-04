import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';

interface VisualCaptchaProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export default function VisualCaptcha({ value, onChange, onValidation }: VisualCaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    return result;
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    const isValid = value.toUpperCase() === captchaText;
    setIsVerified(isValid);
    onValidation(isValid);
  };

  useEffect(() => {
    setIsVerified(false);
    onValidation(false);
  }, [captchaText, onValidation]);

  useEffect(() => {
    if (value === '') {
      setIsVerified(false);
      onValidation(false);
    }
  }, [value, onValidation]);

  const handleRefresh = () => {
    generateCaptcha();
    onChange('');
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex items-center justify-center" style={{ width: '120px', height: '60px' }}>
        <span 
          className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300 select-none transform -rotate-2"
          style={{ 
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            letterSpacing: '2px'
          }}
        >
          {captchaText}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent pointer-events-none" />
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="Enter captcha"
        className="flex-1"
        maxLength={5}
      />
      
      <Button
        type="button"
        onClick={handleVerify}
        disabled={value.length !== 5}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify
      </Button>
    </div>
  );
}
