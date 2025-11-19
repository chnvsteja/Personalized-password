import React, { useState, useCallback } from 'react';
import { UserProfile, SecurityQuestionAnswer } from '../types';
import { SECURITY_QUESTIONS } from '../constants';
import { generatePassword } from '../services/passwordGeneratorService';

interface ProfileFormProps {
  onPasswordGenerated: (password: string, profile: UserProfile) => void;
  initialProfile: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onPasswordGenerated, initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      firstName: '',
      lastName: '',
      dob: '',
      securityAnswers: Array(5).fill({ question: '', answer: '' }),
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newAnswers = [...profile.securityAnswers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setProfile(prev => ({ ...prev, securityAnswers: newAnswers }));
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const answeredCount = profile.securityAnswers.filter(sq => sq.question && sq.answer.trim()).length;

    if (answeredCount < 2) {
      setError('Please select and answer at least two security questions.');
      return;
    }
    
    setError(null);
    const newPassword = generatePassword(profile);
    onPasswordGenerated(newPassword, profile);
  }, [profile, onPasswordGenerated]);

  const usedQuestions = profile.securityAnswers.map(sq => sq.question);

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border-color p-6 md:p-8 rounded-xl shadow-lg w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-text mb-1">Personal Details</h2>
        <p className="text-secondary-text text-sm">This information helps create a memorable password for you.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-secondary-text mb-1">First Name</label>
          <input type="text" id="firstName" name="firstName" value={profile.firstName} onChange={handleInputChange} className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-primary-text focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-secondary-text mb-1">Last Name</label>
          <input type="text" id="lastName" name="lastName" value={profile.lastName} onChange={handleInputChange} className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-primary-text focus:ring-primary focus:border-primary" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="dob" className="block text-sm font-medium text-secondary-text mb-1">Date of Birth</label>
          <input type="date" id="dob" name="dob" value={profile.dob} onChange={handleInputChange} className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-primary-text focus:ring-primary focus:border-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary-text mb-1">Security Questions</h2>
        <p className="text-secondary-text text-sm">Answer at least two. These add variety to your password.</p>
      </div>

      <div className="space-y-4">
        {profile.securityAnswers.map((sq, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <select
              value={sq.question}
              onChange={(e) => handleSecurityChange(index, 'question', e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-primary-text focus:ring-primary focus:border-primary"
            >
              <option value="">Select question {index + 1}...</option>
              {SECURITY_QUESTIONS.map(q => (
                <option key={q} value={q} disabled={usedQuestions.includes(q) && sq.question !== q}>{q}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Your answer"
              value={sq.answer}
              onChange={(e) => handleSecurityChange(index, 'answer', e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-primary-text focus:ring-primary focus:border-primary"
              disabled={!sq.question}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
        Generate My Password
      </button>
    </form>
  );
};

export default ProfileForm;