export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  return false;
};


export const isValidEmail = (email) => {
  if (isEmpty(email)) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};


export const isValidPassword = (password, minLength = 6) => {
  if (isEmpty(password)) {
    return { isValid: false, message: `Password cannot be empty.` };
  }
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
  }
  
  return { isValid: true, message: 'Password is valid.' };
};


export const doValuesMatch = (value1, value2) => {
  return value1 === value2;
};

export const isValidRating = (rating, min = 1, max = 5) => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return false;
  }
  return rating >= min && rating <= max;
};


export const isValidText = (text, fieldName = "Field", minLength = 1, maxLength = Infinity) => {
  if (isEmpty(text)) {
    return { isValid: false, message: `${fieldName} cannot be empty.` };
  }
  if (text.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long.` };
  }
  if (text.length > maxLength) {
    return { isValid: false, message: `${fieldName} cannot exceed ${maxLength} characters.` };
  }
  return { isValid: true, message: `${fieldName} is valid.` };
};
