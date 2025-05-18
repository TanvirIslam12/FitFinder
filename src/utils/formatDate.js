export const formatDate = (dateInput, options) => {
  let date;
  if (!dateInput) return "Date not provided";

  if (dateInput.toDate) { 
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options, 
  };

  try {
    return date.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error in date format";
  }
};

export const formatTime = (dateInput, options) => {
  let date;
  if (!dateInput) return "Time not provided";

  if (dateInput.toDate) { 
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return "Invalid Time";
  }

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, 
    ...options,
  };

  try {
    return date.toLocaleTimeString(undefined, defaultOptions);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Error in time format";
  }
};

export const formatDateTime = (dateInput, dateTimeOptions = {}) => {
  const { dateFormatOptions, timeFormatOptions } = dateTimeOptions;
  const datePart = formatDate(dateInput, dateFormatOptions);
  const timePart = formatTime(dateInput, timeFormatOptions);

  if (datePart === "Invalid Date" || timePart === "Invalid Time" || datePart === "Date not provided" || timePart === "Time not provided") {
    return "Invalid Date/Time";
  }
  if (datePart.startsWith("Error") || timePart.startsWith("Error")) {
    return "Error in date/time format";
  }

  return `${datePart}, ${timePart}`;
};


export const formatRelativeTime = (dateInput) => {
  let date;
  if (!dateInput) return "Date not provided";

  if (dateInput.toDate) {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) {
    return "just now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return "yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return formatDate(date);
  }
};
