
export interface PasswordStrength {
  score: number; // 0-4
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export interface BreachInfo {
  isPwned: boolean;
  count: number;
}

export interface SecurityQuestionAnswer {
  question: string;
  answer: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  securityAnswers: SecurityQuestionAnswer[];
}
