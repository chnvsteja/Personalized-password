import React, { useState, useCallback } from 'react';
import PasswordChecker from './components/PasswordChecker';
import ProfileForm from './components/ProfileForm';
import { UserProfile } from './types';

type Page = 'checker' | 'form';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('checker');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleNavigateToForm = useCallback(() => {
    setGeneratedPassword(null);
    setPage('form');
  }, []);

  const handlePasswordGenerated = useCallback((password: string, profile: UserProfile) => {
    setGeneratedPassword(password);
    setUserProfile(profile);
    setPage('checker');
  }, []);

  const handleBackToForm = useCallback(() => {
    setPage('form');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text">
          Personalized Password Generator
        </h1>
        <p className="text-secondary-text mt-2 text-lg">
          Create strong, memorable passwords tailored to you.
        </p>
      </header>
      <main className="w-full max-w-2xl">
        {page === 'checker' ? (
          <PasswordChecker
            onNavigateToForm={handleNavigateToForm}
            generatedPassword={generatedPassword}
            onBackToForm={userProfile ? handleBackToForm : undefined}
          />
        ) : (
          <ProfileForm 
            onPasswordGenerated={handlePasswordGenerated} 
            initialProfile={userProfile}
          />
        )}
      </main>
      <footer className="mt-8 text-center text-secondary-text text-sm">
        <p>Password breach checks are performed securely using the k-Anonymity model.</p>
        <p>&copy; {new Date().getFullYear()} Personalized Password Generator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;