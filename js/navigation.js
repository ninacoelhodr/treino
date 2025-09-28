/* ==============================================
   NAVIGATION SYSTEM
   ============================================== */

class Navigation {
  constructor() {
    this.currentScreen = 'user-selection-screen';
    this.navigationHistory = [];
    this.maxHistoryLength = 10;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleInitialLoad();
  }

  bindEvents() {
    // Back button
    const backButton = AppUtils.$('#back-button');
    if (backButton) {
      backButton.addEventListener('click', () => this.goBack());
    }

    // Menu button
    const menuButton = AppUtils.$('#menu-button');
    if (menuButton) {
      menuButton.addEventListener('click', () => this.showMenu());
    }

    // User selection cards
    const userCards = AppUtils.$$('.user-card');
    userCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const userId = e.currentTarget.dataset.user;
        this.selectUser(userId);
      });
    });

    // Bottom navigation
    const navItems = AppUtils.$$('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.id;
        this.handleBottomNavAction(action);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Browser back/forward
    window.addEventListener('popstate', (e) => this.handlePopState(e));
  }

  handleInitialLoad() {
    // Check if user was previously selected
    const currentUser = Storage.getCurrentUser();
    const currentWorkout = Storage.getCurrentWorkout();
    
    if (currentUser && currentWorkout) {
      // Resume previous session
      this.selectUser(currentUser, false);
      this.selectWorkout(currentWorkout, false);
    } else if (currentUser) {
      // Show workout selection for user
      this.selectUser(currentUser, false);
    } else {
      // Show user selection (default)
      this.showScreen('user-selection-screen');
    }
  }

  // Navigate to a screen
  navigateTo(screenId, addToHistory = true) {
    const previousScreen = this.currentScreen;
    
    // Add to history if requested
    if (addToHistory && previousScreen !== screenId) {
      this.addToHistory(previousScreen);
    }
    
    this.currentScreen = screenId;
    this.showScreen(screenId);
    this.updateHeader(screenId);
    this.updateBottomNav(screenId);
    
    // Update browser URL without reload
    this.updateURL(screenId);
  }

  // Show specific screen
  showScreen(screenId) {
    AppUtils.showScreen(`#${screenId}`);
  }

  // Select user and navigate to workout selection
  selectUser(userId, addToHistory = true) {
    if (!['jana', 'leandro'].includes(userId)) {
      AppUtils.showError('Usuário inválido');
      return;
    }

    Storage.setCurrentUser(userId);
    this.loadWorkoutSelection(userId);
    this.navigateTo('workout-selection-screen', addToHistory);
  }

  // Load workout selection for user
  async loadWorkoutSelection(userId) {
    try {
      // Load user data
      const userData = await this.loadUserData(userId);
      if (!userData) {
        throw new Error('Dados do usuário não encontrados');
      }

      // Update user info section
      this.updateUserInfo(userId, userData);
      
      // Generate workout tabs
      this.generateWorkoutTabs(userId, userData.treinos);
      
    } catch (error) {
      AppUtils.showError('Erro ao carregar treinos: ' + error.message);
    }
  }

  // Update user info display
  updateUserInfo(userId, userData) {
    const userInitial = AppUtils.$('#current-user-initial');
    const userName = AppUtils.$('#current-user-name');
    const userSchedule = AppUtils.$('#current-user-schedule');
    
    if (userInitial) {
      userInitial.textContent = userId.charAt(0).toUpperCase();
    }
    
    if (userName) {
      userName.textContent = userId.charAt(0).toUpperCase() + userId.slice(1);
    }
    
    if (userSchedule && userData.cronograma) {
      userSchedule.textContent = `${userData.cronograma.frequencia} por semana`;
    }
  }

  // Generate workout tabs
  generateWorkoutTabs(userId, workouts) {
    const tabsContainer = AppUtils.$('#workout-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    Object.entries(workouts).forEach(([workoutId, workout], index) => {
      const workoutNumber = index + 1;
      
      const tab = AppUtils.createElement('button', {
        className: 'workout-tab',
        'data-user': userId,
        'data-workout': workoutId
      });
      
      tab.innerHTML = `
        <div class="workout-tab-number">${workoutNumber}</div>
        <h3>Treino ${workoutNumber}</h3>
        <p>${workout.foco || 'Treino completo'}</p>
      `;
      
      tab.addEventListener('click', () => {
        this.selectWorkout(workoutId);
      });
      
      tabsContainer.appendChild(tab);
    });
  }

  // Select workout and navigate to exercises
  selectWorkout(workoutId, addToHistory = true) {
    const userId = Storage.getCurrentUser();
    if (!userId) {
      AppUtils.showError('Usuário não selecionado');
      return;
    }

    Storage.setCurrentWorkout(workoutId);
    Storage.startWorkoutSession(userId, workoutId);
    
    this.navigateTo('exercise-screen', addToHistory);
    
    // Load exercises for the selected workout
    if (window.ExerciseManager) {
      window.ExerciseManager.loadWorkout(userId, workoutId);
    }
  }

  // Go back in navigation history
  goBack() {
    if (this.navigationHistory.length > 0) {
      const previousScreen = this.navigationHistory.pop();
      this.navigateTo(previousScreen, false);
    } else {
      // Default back behavior
      switch (this.currentScreen) {
        case 'exercise-screen':
          this.navigateTo('workout-selection-screen', false);
          break;
        case 'workout-selection-screen':
          this.navigateTo('user-selection-screen', false);
          Storage.setCurrentUser(null);
          Storage.setCurrentWorkout(null);
          break;
        default:
          // Already at root, do nothing or show exit confirmation
          break;
      }
    }
  }

  // Add screen to navigation history
  addToHistory(screenId) {
    this.navigationHistory.push(screenId);
    
    // Limit history length
    if (this.navigationHistory.length > this.maxHistoryLength) {
      this.navigationHistory.shift();
    }
  }

  // Update header based on current screen
  updateHeader(screenId) {
    const header = AppUtils.$('#app-header');
    const title = AppUtils.$('#app-title');
    const backButton = AppUtils.$('#back-button');
    
    if (!header || !title) return;
    
    // Show header for all screens except user selection
    if (screenId === 'user-selection-screen') {
      header.style.display = 'none';
    } else {
      header.style.display = 'flex';
    }
    
    // Update title and back button visibility
    switch (screenId) {
      case 'workout-selection-screen':
        title.textContent = 'Escolha seu treino';
        if (backButton) backButton.style.display = 'flex';
        break;
      case 'exercise-screen':
        const workoutId = Storage.getCurrentWorkout();
        const workoutNumber = workoutId ? workoutId.replace('treino_', '') : '1';
        title.textContent = `Treino ${workoutNumber}`;
        if (backButton) backButton.style.display = 'flex';
        break;
      default:
        title.textContent = 'Treino App';
        if (backButton) backButton.style.display = 'none';
        break;
    }
  }

  // Update bottom navigation visibility
  updateBottomNav(screenId) {
    const bottomNav = AppUtils.$('#bottom-nav');
    if (!bottomNav) return;
    
    // Show bottom nav only on exercise screen
    if (screenId === 'exercise-screen') {
      bottomNav.style.display = 'flex';
    } else {
      bottomNav.style.display = 'none';
    }
  }

  // Handle bottom navigation actions
  handleBottomNavAction(action) {
    switch (action) {
      case 'nav-workouts':
        // Navigate back to workout selection
        this.navigateTo('workout-selection-screen');
        break;
      case 'nav-timer':
        // Open timer modal with default rest time
        if (window.TimerManager) {
          window.TimerManager.startRestTimer();
        }
        break;
      case 'nav-export':
        // Export workout data
        this.exportWorkoutData();
        break;
    }
  }

  // Handle keyboard navigation
  handleKeydown(e) {
    switch (e.key) {
      case 'Escape':
        // Close modals or go back
        if (window.TimerManager && window.TimerManager.isModalOpen) {
          window.TimerManager.closeModal();
        } else {
          this.goBack();
        }
        break;
      case 'ArrowLeft':
        if (this.currentScreen === 'exercise-screen') {
          // Previous exercise
          if (window.ExerciseManager) {
            window.ExerciseManager.previousExercise();
          }
        }
        break;
      case 'ArrowRight':
        if (this.currentScreen === 'exercise-screen') {
          // Next exercise
          if (window.ExerciseManager) {
            window.ExerciseManager.nextExercise();
          }
        }
        break;
      case ' ':
        // Spacebar - toggle timer
        if (window.TimerManager && window.TimerManager.isModalOpen) {
          e.preventDefault();
          window.TimerManager.toggleTimer();
        }
        break;
    }
  }

  // Handle browser back/forward
  handlePopState(e) {
    const state = e.state;
    if (state && state.screen) {
      this.navigateTo(state.screen, false);
    }
  }

  // Update browser URL
  updateURL(screenId) {
    const state = { screen: screenId };
    const url = `#${screenId}`;
    
    try {
      window.history.pushState(state, '', url);
    } catch (error) {
      // Fallback for environments that don't support history API
      window.location.hash = screenId;
    }
  }

  // Load user data from JSON file
  async loadUserData(userId) {
    try {
      const fileName = userId === 'jana' ? 'treinoJana.json' : 'treinoLeandro.json';
      const response = await fetch(`data/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  // Show menu (future feature)
  showMenu() {
    // Placeholder for menu functionality
    AppUtils.showSuccess('Menu em desenvolvimento');
  }

  // Get current navigation state
  getCurrentState() {
    return {
      currentScreen: this.currentScreen,
      historyLength: this.navigationHistory.length,
      currentUser: Storage.getCurrentUser(),
      currentWorkout: Storage.getCurrentWorkout()
    };
  }

  // Reset navigation to initial state
  reset() {
    this.navigationHistory = [];
    Storage.setCurrentUser(null);
    Storage.setCurrentWorkout(null);
    this.navigateTo('user-selection-screen', false);
  }

  // Export workout data - exports ALL workouts from the week
  exportWorkoutData() {
    const currentUser = Storage.getCurrentUser();
    
    if (!currentUser) {
      AppUtils.showError('Nenhum usuário selecionado');
      return;
    }

    try {
      const exportData = {
        metadata: {
          user: currentUser,
          exportDate: new Date().toISOString(),
          exportType: 'weekly_summary',
          weekPeriod: this.getWeekPeriod()
        },
        workouts: []
      };

      // Load all workout data for the user
      this.loadAllUserWorkouts(currentUser).then(allWorkouts => {
        // Process each workout (treino_1, treino_2, treino_3, treino_4)
        Object.keys(allWorkouts.treinos).forEach(workoutId => {
          const workout = allWorkouts.treinos[workoutId];
          
          const workoutData = {
            workoutId: workoutId,
            workoutName: workout.foco,
            exercises: []
          };

          // Process each exercise in this workout
          workout.exercicios.forEach((exercise, index) => {
            const progressData = Storage.getExerciseProgress(currentUser, workoutId, index);
            const weights = Storage.getWeights(currentUser, exercise.nome);
            const lastWeight = Storage.getLastWeight(currentUser, exercise.nome);
            
            const totalSeries = exercise.series || 1;
            const completedSeries = progressData.completedSeries.length;
            const completionPercentage = Math.round((completedSeries / totalSeries) * 100);

            workoutData.exercises.push({
              name: exercise.nome,
              series: {
                total: totalSeries,
                completed: completedSeries,
                completionPercentage: completionPercentage
              },
              reps: exercise.reps || null,
              tempo: exercise.tempo || null,
              weight: {
                lastUsed: lastWeight,
                history: weights.map(w => ({
                  value: w.value,
                  date: new Date(w.date).toISOString()
                }))
              },
              wasCompleted: completedSeries === totalSeries,
              exerciseType: this.getExerciseType(exercise)
            });
          });

          exportData.workouts.push(workoutData);
        });

        // Generate filename with week period
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `semana_${currentUser}_${dateStr}.json`;

        // Create and download file
        this.downloadJSON(exportData, filename);
        
        AppUtils.showSuccess(`Semana exportada: ${filename}`);
        
      }).catch(error => {
        console.error('Export error:', error);
        AppUtils.showError('Erro ao carregar dados dos treinos');
      });
      
    } catch (error) {
      console.error('Export error:', error);
      AppUtils.showError('Erro ao exportar dados da semana');
    }
  }

  // Load all workout data for a user
  async loadAllUserWorkouts(userId) {
    const fileName = userId === 'jana' ? 'treinoJana.json' : 'treinoLeandro.json';
    const response = await fetch(`data/${fileName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Get current week period for metadata
  getWeekPeriod() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  }

  // Helper function to determine exercise type
  getExerciseType(exercise) {
    if (exercise.tempo && !exercise.reps) {
      return 'tempo';
    } else if (exercise.reps && !exercise.tempo) {
      return 'repetições';
    } else {
      return 'misto';
    }
  }

  // Download JSON data as file
  downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

// Export navigation manager
window.Navigation = Navigation;