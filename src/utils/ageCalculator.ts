/**
 * Live Age Calculation and Category Helper for We 4 You Band Registrations
 */

export interface AgeCalculationResult {
  isValid: boolean;
  years: number;
  months: number;
  days: number;
  formattedAge: string;
  suggestedCategory: string;
}

export const calculateDetailedAge = (birthDateStr: string): AgeCalculationResult => {
  if (!birthDateStr || !birthDateStr.trim()) {
    return {
      isValid: false,
      years: 0,
      months: 0,
      days: 0,
      formattedAge: '',
      suggestedCategory: 'Child (0 – 12 years)',
    };
  }

  const birthDate = new Date(birthDateStr);
  const today = new Date();

  // Validate date
  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return {
      isValid: false,
      years: 0,
      months: 0,
      days: 0,
      formattedAge: 'Invalid or future date',
      suggestedCategory: 'Child (0 – 12 years)',
    };
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in the previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Format human-friendly string
  let formattedAge = '';
  if (years === 0) {
    if (months === 0) {
      formattedAge = `${days} ${days === 1 ? 'day' : 'days'} old`;
    } else {
      formattedAge = `${months} ${months === 1 ? 'month' : 'months'} old`;
    }
  } else if (years === 1) {
    formattedAge = months > 0 ? `1 year, ${months} mo old` : '1 year old';
  } else {
    formattedAge = months > 0 ? `${years} years, ${months} mo old` : `${years} years old`;
  }

  // Category selection
  let suggestedCategory = 'Child (0 – 12 years)';
  if (years >= 65) {
    suggestedCategory = 'Senior (65+ years)';
  } else if (years >= 18) {
    suggestedCategory = 'Adult (18 – 64 years)';
  } else if (years >= 13) {
    suggestedCategory = 'Teen (13 – 17 years)';
  } else {
    suggestedCategory = 'Child (0 – 12 years)';
  }

  return {
    isValid: true,
    years,
    months,
    days,
    formattedAge,
    suggestedCategory,
  };
};

export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown / Not Tested',
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;
