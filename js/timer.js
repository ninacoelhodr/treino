/* ==============================================
   TIMER SYSTEM
   ============================================== */

class Timer {
  constructor() {
    this.timeLeft = 0;
    this.totalTime = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.callbacks = {
      onTick: null,
      onComplete: null,
      onStart: null,
      onPause: null,
      onReset: null
    };
  }

  // Set timer duration in seconds
  setTime(seconds) {
    this.timeLeft = seconds;
    this.totalTime = seconds;
    this.updateDisplay();
  }

  // Start or resume timer
  start() {
    if (this.timeLeft <= 0) return false;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
    
    if (this.callbacks.onStart) {
      this.callbacks.onStart(this.timeLeft);
    }
    
    return true;
  }

  // Pause timer
  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.callbacks.onPause) {
      this.callbacks.onPause(this.timeLeft);
    }
  }

  // Reset timer to original time
  reset() {
    this.pause();
    this.timeLeft = this.totalTime;
    this.updateDisplay();
    
    if (this.callbacks.onReset) {
      this.callbacks.onReset(this.timeLeft);
    }
  }

  // Toggle play/pause
  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  // Internal tick method
  tick() {
    this.timeLeft--;
    
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.timeLeft, this.totalTime);
    }
    
    this.updateDisplay();
    
    if (this.timeLeft <= 0) {
      this.complete();
    }
  }

  // Complete timer
  complete() {
    this.pause();
    this.timeLeft = 0;
    
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Play sound if audio is available
    this.playCompletionSound();
  }

  // Update display elements
  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    
    const minutesEl = AppUtils.$('#timer-minutes');
    const secondsEl = AppUtils.$('#timer-seconds');
    const progressCircle = AppUtils.$('.timer-progress');
    
    if (minutesEl) {
      minutesEl.textContent = minutes.toString().padStart(2, '0');
    }
    
    if (secondsEl) {
      secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Update circular progress
    if (progressCircle && this.totalTime > 0) {
      const progress = (this.totalTime - this.timeLeft) / this.totalTime;
      const circumference = 2 * Math.PI * 45; // radius = 45
      const offset = circumference * (1 - progress);
      progressCircle.style.strokeDashoffset = offset;
    }
  }

  // Play completion sound
  playCompletionSound() {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available:', error);
    }
  }

  // Set callback functions
  onTick(callback) {
    this.callbacks.onTick = callback;
    return this;
  }

  onComplete(callback) {
    this.callbacks.onComplete = callback;
    return this;
  }

  onStart(callback) {
    this.callbacks.onStart = callback;
    return this;
  }

  onPause(callback) {
    this.callbacks.onPause = callback;
    return this;
  }

  onReset(callback) {
    this.callbacks.onReset = callback;
    return this;
  }

  // Get current state
  getState() {
    return {
      timeLeft: this.timeLeft,
      totalTime: this.totalTime,
      isRunning: this.isRunning,
      progress: this.totalTime > 0 ? (this.totalTime - this.timeLeft) / this.totalTime : 0
    };
  }

  // Cleanup
  destroy() {
    this.pause();
    this.callbacks = {};
  }
}

// Timer Manager Class
class TimerManager {
  constructor() {
    this.restTimer = new Timer();
    this.exerciseTimer = new Timer();
    this.currentTimer = null;
    this.isModalOpen = false;
    
    // Bind methods to ensure correct context
    this.startRestTimer = this.startRestTimer.bind(this);
    this.startExerciseTimer = this.startExerciseTimer.bind(this);
    this.toggleTimer = this.toggleTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.closeModal = this.closeModal.bind(this);
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupTimerCallbacks();
  }

  bindEvents() {
    // Timer modal controls
    const playPauseBtn = AppUtils.$('#timer-play-pause');
    const resetBtn = AppUtils.$('#timer-reset');
    const closeBtn = AppUtils.$('#timer-close');
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.toggleTimer());
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Timer option buttons
    const timerOptions = document.querySelectorAll('.timer-option-btn');
    timerOptions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seconds = parseInt(e.target.dataset.seconds);
        this.selectTimerOption(seconds, e.target);
      });
    });
    
    // Click outside to close modal
    const modal = AppUtils.$('#timer-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
  }

  setupTimerCallbacks() {
    // Rest timer callbacks
    this.restTimer
      .onStart(() => this.updateTimerUI(true))
      .onPause(() => this.updateTimerUI(false))
      .onComplete(() => this.onRestComplete())
      .onTick((timeLeft) => this.updateProgressCircle(timeLeft, this.restTimer.totalTime));
    
    // Exercise timer callbacks
    this.exerciseTimer
      .onStart(() => this.updateTimerUI(true))
      .onPause(() => this.updateTimerUI(false))
      .onComplete(() => this.onExerciseComplete())
      .onTick((timeLeft) => this.updateProgressCircle(timeLeft, this.exerciseTimer.totalTime));
  }

  // Start rest timer (uses last selected time as default)
  startRestTimer(seconds = null) {
    // Get user's last selected timer preference
    const userId = Storage.getCurrentUser();
    const lastTimerChoice = this.getLastTimerChoice(userId);
    const restTime = seconds || lastTimerChoice || 30; // Default to 30s if no preference
    
    this.currentTimer = this.restTimer;
    this.restTimer.setTime(restTime);
    
    this.showModal('Descanso entre séries', 'Aproveite para se hidratar!');
    this.showTimerOptions();
    // Don't auto-start, wait for user to select time and press play
  }

  // Show timer options and set active based on current time
  showTimerOptions() {
    const options = document.querySelectorAll('.timer-option-btn');
    const currentTime = this.restTimer.totalTime;
    const userId = Storage.getCurrentUser();
    const isRemembered = this.getLastTimerChoice(userId) === currentTime;
    
    options.forEach(btn => {
      btn.classList.remove('active', 'remembered');
      const btnTime = parseInt(btn.dataset.seconds);
      
      if (btnTime === currentTime) {
        btn.classList.add('active');
        if (isRemembered) {
          btn.classList.add('remembered');
        }
      }
    });
    
    // Update subtitle text
    const subtitle = AppUtils.$('#timer-subtitle');
    if (subtitle) {
      if (isRemembered) {
        subtitle.textContent = '✨ Usando sua preferência salva';
      } else {
        subtitle.textContent = 'Sua última escolha será lembrada';
      }
    }
    
    const timerOptions = AppUtils.$('#timer-options');
    if (timerOptions) {
      timerOptions.style.display = 'flex';
    }
  }

  // Select timer option
  selectTimerOption(seconds, buttonElement) {
    // Update active state
    const options = document.querySelectorAll('.timer-option-btn');
    options.forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    // Update timer with new time
    this.restTimer.setTime(seconds);
    
    // Save user's timer preference
    const userId = Storage.getCurrentUser();
    this.saveLastTimerChoice(userId, seconds);
  }

  // Start exercise timer (for time-based exercises)
  startExerciseTimer(seconds) {
    this.currentTimer = this.exerciseTimer;
    this.exerciseTimer.setTime(seconds);
    
    this.showModal('Tempo do exercício', 'Mantenha o ritmo!');
    this.hideTimerOptions();
    this.exerciseTimer.start();
  }

  // Save user's last timer choice
  saveLastTimerChoice(userId, seconds) {
    if (!userId) return;
    
    const key = `timer-choice-${userId}`;
    Storage.set(key, {
      seconds: seconds,
      lastUpdated: Date.now()
    });
  }

  // Get user's last timer choice
  getLastTimerChoice(userId) {
    if (!userId) return null;
    
    const key = `timer-choice-${userId}`;
    const choice = Storage.get(key);
    
    return choice ? choice.seconds : null;
  }

  // Hide timer options for exercise timer
  hideTimerOptions() {
    const timerOptions = AppUtils.$('#timer-options');
    if (timerOptions) {
      timerOptions.style.display = 'none';
    }
  }

  // Show timer modal
  showModal(title, subtitle = '') {
    const modal = AppUtils.$('#timer-modal');
    const titleEl = AppUtils.$('#timer-title');
    
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    if (modal) {
      modal.style.display = 'flex';
      this.isModalOpen = true;
      AppUtils.animateElement(modal, 'animate-fade-in');
    }
  }

  // Close timer modal
  closeModal() {
    const modal = AppUtils.$('#timer-modal');
    
    if (modal) {
      modal.style.display = 'none';
      this.isModalOpen = false;
    }
    
    // Pause current timer if running
    if (this.currentTimer && this.currentTimer.isRunning) {
      this.currentTimer.pause();
    }
  }

  // Toggle current timer
  toggleTimer() {
    if (this.currentTimer) {
      this.currentTimer.toggle();
    }
  }

  // Reset current timer
  resetTimer() {
    if (this.currentTimer) {
      this.currentTimer.reset();
    }
  }

  // Update timer UI based on state
  updateTimerUI(isPlaying) {
    const playIcon = AppUtils.$('.play-icon');
    const pauseIcon = AppUtils.$('.pause-icon');
    const modal = AppUtils.$('#timer-modal');
    
    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (modal) modal.classList.add('playing');
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (modal) modal.classList.remove('playing');
    }
  }

  // Update progress circle
  updateProgressCircle(timeLeft, totalTime) {
    const progressCircle = AppUtils.$('.timer-progress');
    
    if (progressCircle && totalTime > 0) {
      const progress = (totalTime - timeLeft) / totalTime;
      const circumference = 2 * Math.PI * 45;
      const offset = circumference * (1 - progress);
      progressCircle.style.strokeDashoffset = offset;
    }
  }

  // Handle rest timer completion
  onRestComplete() {
    const modal = AppUtils.$('#timer-modal');
    if (modal) {
      modal.classList.add('finished');
    }
    
    AppUtils.showSuccess('Descanso finalizado!');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      this.closeModal();
      if (modal) {
        modal.classList.remove('finished');
      }
    }, 3000);
  }

  // Handle exercise timer completion
  onExerciseComplete() {
    const modal = AppUtils.$('#timer-modal');
    if (modal) {
      modal.classList.add('finished');
    }
    
    AppUtils.showSuccess('Exercício finalizado!');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      this.closeModal();
      if (modal) {
        modal.classList.remove('finished');
      }
    }, 3000);
  }

  // Get active timer state
  getActiveTimerState() {
    return this.currentTimer ? this.currentTimer.getState() : null;
  }

  // Cleanup
  destroy() {
    this.restTimer.destroy();
    this.exerciseTimer.destroy();
    this.currentTimer = null;
    this.isModalOpen = false;
  }
}

// Create and export timer manager instance
window.TimerManager = new TimerManager();