import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { checkPwnedPassword } from '../services/pwnedPasswordsService';
import { PasswordStrength, BreachInfo } from '../types';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { ClipboardIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon, ArrowLeftIcon } from '../constants';

interface PasswordCheckerProps {
  onNavigateToForm: () => void;
  generatedPassword?: string | null;
  onBackToForm?: () => void;
}

const RequirementCheck: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <div className={`flex items-center transition-colors duration-300 ${met ? 'text-strength-strong' : 'text-secondary-text'}`}>
    {met ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <XCircleIcon className="w-4 h-4 mr-2" />}
    <span>{label}</span>
  </div>
);

const PasswordChecker: React.FC<PasswordCheckerProps> = ({ onNavigateToForm, generatedPassword, onBackToForm }) => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, hasLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSymbol: false });
  const [breachInfo, setBreachInfo] = useState<BreachInfo>({ isPwned: false, count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (generatedPassword) {
      setPassword(generatedPassword);
    }
  }, [generatedPassword]);
  
  const analyzePassword = (pass: string) => {
    const hasLength = pass.length >= 15;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pass);
    let score = 0;
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    
    setStrength({ score, hasLength, hasUppercase, hasLowercase, hasNumber, hasSymbol });
  };

  useEffect(() => {
    analyzePassword(password);
    const handler = setTimeout(() => {
      if (password) {
        setIsLoading(true);
        checkPwnedPassword(password).then(info => {
          setBreachInfo(info);
          setIsLoading(false);
        });
      } else {
        setBreachInfo({ isPwned: false, count: 0 });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [password]);

  const strengthColor = useMemo(() => {
    if (strength.score <= 2) return 'bg-strength-weak';
    if (strength.score <= 4) return 'bg-strength-medium';
    return 'bg-strength-strong';
  }, [strength.score]);

  const strengthText = useMemo(() => {
    if (strength.score <= 2) return 'Weak';
    if (strength.score <= 4) return 'Medium';
    return 'Strong';
  }, [strength.score]);
  
  const handleCopy = () => {
    copy(password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // This is a bit of a trick to re-trigger generation in the parent
    // by navigating back to the form, which will then generate a new one
    // and come back here.
    onNavigateToForm(); 
  };
  
  return (
    <div className="bg-surface border border-border-color p-6 md:p-8 rounded-xl shadow-lg w-full transition-all duration-300">
      <div className="relative">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter or generate a password"
          className="w-full bg-input-bg border-2 border-border-color rounded-lg p-4 text-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {generatedPassword && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
               {onBackToForm && (
                <button onClick={onBackToForm} className="text-secondary-text hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" title="Back to form">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
               )}
               <button onClick={handleRegenerate} className="text-secondary-text hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" title="Regenerate">
                   <RefreshCwIcon className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
               </button>
               <button onClick={handleCopy} className="text-secondary-text hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" title="Copy to clipboard">
                   <ClipboardIcon className="w-5 h-5" />
               </button>
           </div>
        )}
      </div>

      {isCopied && <div className="text-center text-sm text-green-600 mt-2">Copied to clipboard!</div>}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-primary-text">Password Strength</span>
          <span className={`font-bold ${strengthColor.replace('bg-','text-')}`}>{strengthText}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${strengthColor} transition-all duration-500`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <RequirementCheck label="At least 15 characters" met={strength.hasLength} />
        <RequirementCheck label="Includes an uppercase letter" met={strength.hasUppercase} />
        <RequirementCheck label="Includes a lowercase letter" met={strength.hasLowercase} />
        <RequirementCheck label="Includes a number" met={strength.hasNumber} />
        <RequirementCheck label="Includes a symbol" met={strength.hasSymbol} />
      </div>

      <div className="mt-6 border-t border-border-color pt-6">
        <div className="flex items-center justify-center">
            {isLoading ? (
                <div className="flex items-center space-x-2 text-secondary-text">
                    <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                    <span>Checking for breaches...</span>
                </div>
            ) : breachInfo.isPwned ? (
                <div className="text-center text-strength-weak">
                    <XCircleIcon className="w-8 h-8 mx-auto mb-2"/>
                    <p className="font-bold">Oh no — pwned!</p>
                    <p>This password has been seen <span className="font-extrabold">{breachInfo.count.toLocaleString()}</span> times before in data breaches.</p>
                </div>
            ) : password ? (
                 <div className="text-center text-strength-strong">
                    <CheckCircleIcon className="w-8 h-8 mx-auto mb-2"/>
                    <p className="font-bold">All good!</p>
                    <p>This password was not found in any of the Pwned Passwords data breaches.</p>
                </div>
            ) : (
                <p className="text-secondary-text">Enter a password to check its breach status.</p>
            )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={onNavigateToForm}
          className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Generate Personalized Password
        </button>
      </div>
    </div>
  );
};

export default PasswordChecker;