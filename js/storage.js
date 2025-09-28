/* ==============================================
   LOCAL STORAGE MANAGEMENT
   ============================================== */

class StorageManager {
  constructor() {
    this.prefix = 'treino-app-';
  }

  // Generic storage methods
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // User preferences
  setCurrentUser(user) {
    return this.set('current-user', user);
  }

  getCurrentUser() {
    return this.get('current-user');
  }

  setCurrentWorkout(workoutId) {
    return this.set('current-workout', workoutId);
  }

  getCurrentWorkout() {
    return this.get('current-workout');
  }

  // Exercise progress tracking
  getExerciseProgress(userId, workoutId, exerciseIndex) {
    // Check if this is a new training session
    this.checkAndResetWorkoutSession(userId, workoutId);
    
    const key = `progress-${userId}-${workoutId}-${exerciseIndex}`;
    return this.get(key, {
      completedSeries: [],
      currentSeries: 0,
      startTime: null,
      weights: []
    });
  }

  setExerciseProgress(userId, workoutId, exerciseIndex, progress) {
    const key = `progress-${userId}-${workoutId}-${exerciseIndex}`;
    return this.set(key, {
      ...progress,
      lastUpdated: Date.now()
    });
  }

  clearExerciseProgress(userId, workoutId, exerciseIndex) {
    const key = `progress-${userId}-${workoutId}-${exerciseIndex}`;
    return this.remove(key);
  }

  // Workout session management
  checkAndResetWorkoutSession(userId, workoutId) {
    const sessionKey = `session-${userId}-${workoutId}`;
    const lastSession = this.get(sessionKey);
    const today = new Date();
    const todayStr = today.toDateString(); // "Mon Oct 01 2024"
    
    // If no session exists, create new one
    if (!lastSession) {
      this.set(sessionKey, {
        date: todayStr,
        startTime: Date.now(),
        lastAccess: Date.now()
      });
      return;
    }
    
    // If it's from a different day, reset progress and create new session
    if (lastSession.date !== todayStr) {
      this.resetWorkoutProgress(userId, workoutId);
      
      // Save new session
      this.set(sessionKey, {
        date: todayStr,
        startTime: Date.now(),
        lastAccess: Date.now()
      });
    } else {
      // Update last access time for existing session (same day)
      lastSession.lastAccess = Date.now();
      this.set(sessionKey, lastSession);
    }
  }

  // Reset all progress for a specific workout
  resetWorkoutProgress(userId, workoutId) {
    // Get all keys that match this workout's progress pattern
    const progressPattern = `progress-${userId}-${workoutId}-`;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix + progressPattern))
      .forEach(key => localStorage.removeItem(key));
    
    console.log(`Reset progress for ${userId} - ${workoutId}`);
  }

  // Get current session info
  getCurrentSession(userId, workoutId) {
    const sessionKey = `session-${userId}-${workoutId}`;
    return this.get(sessionKey);
  }

  // Check if workout was started today
  wasWorkoutStartedToday(userId, workoutId) {
    const session = this.getCurrentSession(userId, workoutId);
    if (!session) return false;
    
    const today = new Date().toDateString();
    return session.date === today;
  }

  // Manually reset workout session (for same day restart)
  resetCurrentWorkoutSession(userId, workoutId) {
    this.resetWorkoutProgress(userId, workoutId);
    
    // Create new session for today
    const sessionKey = `session-${userId}-${workoutId}`;
    const today = new Date();
    this.set(sessionKey, {
      date: today.toDateString(),
      startTime: Date.now(),
      lastAccess: Date.now()
    });
    
    return true;
  }

  // Get session statistics
  getSessionStats(userId, workoutId) {
    const session = this.getCurrentSession(userId, workoutId);
    if (!session) return null;
    
    const now = Date.now();
    const sessionDuration = now - session.startTime;
    const lastActivity = now - session.lastAccess;
    
    return {
      sessionDate: session.date,
      sessionDuration,
      lastActivity,
      isActive: lastActivity < (30 * 60 * 1000) // Active if accessed within 30 minutes
    };
  }

  // Weight tracking
  addWeight(userId, exerciseName, weight) {
    const key = `weights-${userId}-${exerciseName}`;
    let weights = this.get(key, []);
    
    // Add new weight and keep only last 3
    weights.unshift({
      value: parseFloat(weight),
      date: Date.now()
    });
    
    weights = weights.slice(0, 3);
    return this.set(key, weights);
  }

  getWeights(userId, exerciseName) {
    const key = `weights-${userId}-${exerciseName}`;
    return this.get(key, []);
  }

  getLastWeight(userId, exerciseName) {
    const weights = this.getWeights(userId, exerciseName);
    return weights.length > 0 ? weights[0].value : null;
  }

  // Workout session tracking
  startWorkoutSession(userId, workoutId) {
    const session = {
      userId,
      workoutId,
      startTime: Date.now(),
      currentExercise: 0,
      exercises: []
    };
    
    return this.set('current-session', session);
  }

  updateWorkoutSession(updates) {
    const session = this.get('current-session');
    if (!session) return false;
    
    const updatedSession = { ...session, ...updates };
    return this.set('current-session', updatedSession);
  }

  getCurrentSession() {
    return this.get('current-session');
  }

  completeWorkoutSession() {
    const session = this.get('current-session');
    if (!session) return false;
    
    const completedSession = {
      ...session,
      endTime: Date.now(),
      completed: true
    };
    
    // Save to workout history
    const historyKey = `history-${session.userId}`;
    let history = this.get(historyKey, []);
    history.unshift(completedSession);
    
    // Keep only last 10 sessions
    history = history.slice(0, 10);
    this.set(historyKey, history);
    
    // Clear current session
    this.remove('current-session');
    
    return true;
  }

  // Workout history
  getWorkoutHistory(userId, limit = 10) {
    const key = `history-${userId}`;
    const history = this.get(key, []);
    return history.slice(0, limit);
  }

  // Timer settings
  setTimerSettings(settings) {
    return this.set('timer-settings', {
      restTime: 30,
      warmupTime: 300,
      cooldownTime: 300,
      soundEnabled: true,
      vibrationEnabled: true,
      ...settings
    });
  }

  getTimerSettings() {
    return this.get('timer-settings', {
      restTime: 30,
      warmupTime: 300,
      cooldownTime: 300,
      soundEnabled: true,
      vibrationEnabled: true
    });
  }

  // App settings
  setAppSettings(settings) {
    return this.set('app-settings', {
      theme: 'dark',
      animations: true,
      notifications: true,
      autoRest: true,
      ...settings
    });
  }

  getAppSettings() {
    return this.get('app-settings', {
      theme: 'dark',
      animations: true,
      notifications: true,
      autoRest: true
    });
  }

  // Statistics
  getWorkoutStats(userId) {
    const history = this.getWorkoutHistory(userId, 100);
    
    const stats = {
      totalWorkouts: history.length,
      totalTime: 0,
      averageTime: 0,
      workoutsByType: {},
      weeklyFrequency: 0,
      currentStreak: 0
    };
    
    if (history.length === 0) return stats;
    
    // Calculate total and average time
    const completedSessions = history.filter(h => h.endTime && h.startTime);
    stats.totalTime = completedSessions.reduce((acc, session) => {
      return acc + (session.endTime - session.startTime);
    }, 0);
    
    if (completedSessions.length > 0) {
      stats.averageTime = stats.totalTime / completedSessions.length;
    }
    
    // Group by workout type
    history.forEach(session => {
      const workoutType = session.workoutId || 'unknown';
      stats.workoutsByType[workoutType] = (stats.workoutsByType[workoutType] || 0) + 1;
    });
    
    // Calculate weekly frequency (last 7 days)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    stats.weeklyFrequency = history.filter(h => h.startTime > oneWeekAgo).length;
    
    // Calculate current streak
    const today = new Date();
    let streakCount = 0;
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);
      
      const hasWorkout = history.some(h => {
        const sessionDate = new Date(h.startTime);
        return sessionDate >= checkDate && sessionDate < nextDay;
      });
      
      if (hasWorkout) {
        streakCount++;
      } else if (i > 0) {
        // If no workout today, but had workouts on previous days
        break;
      }
    }
    
    stats.currentStreak = streakCount;
    
    return stats;
  }

  // Export/Import data
  exportData() {
    const data = {};
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        data[key] = localStorage.getItem(key);
      });
    
    return {
      version: '1.0.0',
      exportDate: Date.now(),
      data
    };
  }

  importData(importData) {
    try {
      if (!importData.data || !importData.version) {
        throw new Error('Invalid import data format');
      }
      
      // Clear existing data
      this.clear();
      
      // Import new data
      Object.entries(importData.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
}

// Export storage manager instance
window.Storage = new StorageManager();