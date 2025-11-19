
import { UserProfile } from '../types';

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const MIN_LENGTH = 15;

const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const getYearDigits = (dob: string) => {
  if (!dob) return '';
  try {
    return new Date(dob).getFullYear().toString().slice(-2);
  } catch {
    return '';
  }
};

const getAnswerPart = (answer: string) => {
    if (!answer) return '';
    const clean = answer.replace(/[^a-zA-Z0-9]/g, '');
    if (clean.length <= 3) return clean;
    return clean.substring(0, 3);
};


const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function generatePassword(profile: UserProfile): string {
  const parts: string[] = [];
  
  // 1. Partial name segments
  if (profile.firstName) parts.push(toTitleCase(profile.firstName.substring(0, 2)));
  if (profile.lastName) parts.push(toTitleCase(profile.lastName.slice(-2)));

  // 2. Encoded DOB digits
  const year = getYearDigits(profile.dob);
  if (year) parts.push(year);

  // 3. Selected question-answer patterns
  const answeredQuestions = profile.securityAnswers.filter(sq => sq.answer.trim() !== '');
  if (answeredQuestions.length > 0) {
      parts.push(toTitleCase(getAnswerPart(answeredQuestions[0].answer)));
  }
  if (answeredQuestions.length > 1) {
    parts.push(getAnswerPart(answeredQuestions[1].answer).toLowerCase());
  }

  // 4. Randomized characters and symbols
  parts.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  parts.push(String(Math.floor(Math.random() * 90) + 10));

  // 5. Assemble and shuffle
  let password = shuffleArray(parts).join('');

  // 6. Ensure length and complexity
  while (password.length < MIN_LENGTH) {
    const randomChar = 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
    password += randomChar;
  }
  
  if (!/[A-Z]/.test(password)) {
    const i = Math.floor(Math.random() * password.length);
    password = password.substring(0, i) + password[i].toUpperCase() + password.substring(i + 1);
  }
  if (!/[a-z]/.test(password)) {
     const i = Math.floor(Math.random() * password.length);
    password = password.substring(0, i) + password[i].toLowerCase() + password.substring(i + 1);
  }
  if (!/\d/.test(password)) {
      password += String(Math.floor(Math.random() * 10));
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  return password.slice(0, Math.max(MIN_LENGTH, Math.floor(Math.random() * 4) + MIN_LENGTH));
}
