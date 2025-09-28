/* ==============================================
   UTILITY FUNCTIONS
   ============================================== */

// DOM utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Element creation utility
const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element[key] = value;
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });
  
  return element;
};

// Time formatting utilities
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTime = (timeString) => {
  const match = timeString.match(/(\d+)([smh]?)/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2] || 's';
  
  switch (unit) {
    case 'm': return value * 60;
    case 'h': return value * 3600;
    default: return value;
  }
};

// Animation utilities
const animateElement = (element, className, duration = 300) => {
  return new Promise((resolve) => {
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
      resolve();
    }, duration);
  });
};

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Screen management
const showScreen = (screenId) => {
  $$('.screen').forEach(screen => {
    screen.style.display = 'none';
  });
  
  const targetScreen = $(screenId);
  if (targetScreen) {
    targetScreen.style.display = 'flex';
    animateElement(targetScreen, 'animate-fade-in');
  }
};

// Loading state management
const setLoading = (isLoading) => {
  const loadingScreen = $('#loading-screen');
  if (isLoading) {
    loadingScreen.style.display = 'flex';
  } else {
    loadingScreen.style.display = 'none';
  }
};

// Error handling
const showError = (message) => {
  console.error('App Error:', message);
  // You can implement a toast notification here
  alert(message); // Temporary error display
};

// Success notification
const showSuccess = (message) => {
  console.log('Success:', message);
  // You can implement a toast notification here
};

// Data validation
const validateExerciseData = (exercise) => {
  const required = ['nome'];
  return required.every(field => exercise[field]);
};

const validateWorkoutData = (workout) => {
  return workout.exercicios && Array.isArray(workout.exercicios) && workout.exercicios.length > 0;
};

// URL utilities
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Device detection
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Export utilities
window.AppUtils = {
  $,
  $$,
  createElement,
  formatTime,
  parseTime,
  animateElement,
  debounce,
  showScreen,
  setLoading,
  showError,
  showSuccess,
  validateExerciseData,
  validateWorkoutData,
  isValidUrl,
  isMobile,
  isIOS,
  isStandalone
};