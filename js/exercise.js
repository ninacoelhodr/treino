/* ==============================================
   EXERCISE MANAGEMENT SYSTEM
   ============================================== */

class ExerciseManager {
  constructor() {
    this.currentWorkout = null;
    this.exercises = [];
    this.currentExerciseIndex = 0;
    this.userId = null;
    this.workoutId = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Event bindings for exercise interactions
  }

  // Load workout data and display exercises
  async loadWorkout(userId, workoutId) {
    try {
      this.userId = userId;
      this.workoutId = workoutId;
      
      // Check if this is a new session and notify user
      const wasStartedToday = Storage.wasWorkoutStartedToday(userId, workoutId);
      
      // Load user data
      const userData = await this.loadUserData(userId);
      if (!userData || !userData.treinos || !userData.treinos[workoutId]) {
        throw new Error('Treino não encontrado');
      }
      
      this.currentWorkout = userData.treinos[workoutId];
      this.exercises = this.currentWorkout.exercicios || [];
      this.currentExerciseIndex = 0;
      
      if (this.exercises.length === 0) {
        throw new Error('Nenhum exercício encontrado neste treino');
      }
      
      // Notify user about session status
      if (wasStartedToday) {
        AppUtils.showSuccess('Continuando treino da mesma sessão 💪');
      } else {
        AppUtils.showSuccess('Nova sessão de treino iniciada 🆕');
      }
      
      // Update workout header
      this.updateWorkoutHeader();
      
      // Display all exercises
      this.displayAllExercises();
      
    } catch (error) {
      AppUtils.showError('Erro ao carregar treino: ' + error.message);
    }
  }

  // Update workout header information
  updateWorkoutHeader() {
    const title = AppUtils.$('#current-workout-title');
    const totalExercises = AppUtils.$('#total-exercises');
    
    if (title) {
      title.textContent = this.currentWorkout.foco || 'Treino';
    }
    
    if (totalExercises) {
      const sessionInfo = this.getSessionInfo();
      totalExercises.innerHTML = `${this.exercises.length} exercícios ${sessionInfo}`;
    }
    
    // Add reset button if there's progress in current session
    this.addSessionControls();
  }

  // Get session information for display
  getSessionInfo() {
    const stats = Storage.getSessionStats(this.userId, this.workoutId);
    if (!stats) return '';
    
    const hasProgress = this.hasAnyProgress();
    if (hasProgress) {
      return '<span class="session-status active">• Sessão ativa</span>';
    }
    
    return '<span class="session-status">• Nova sessão</span>';
  }

  // Check if there's any progress in current workout
  hasAnyProgress() {
    for (let i = 0; i < this.exercises.length; i++) {
      const progress = Storage.getExerciseProgress(this.userId, this.workoutId, i);
      if (progress.completedSeries.length > 0) {
        return true;
      }
    }
    return false;
  }

  // Add session control buttons
  addSessionControls() {
    const headerActions = AppUtils.$('#workout-header-actions') || this.createHeaderActions();
    
    // Clear existing controls
    headerActions.innerHTML = '';
    
    // Add reset button if there's progress
    if (this.hasAnyProgress()) {
      const resetBtn = AppUtils.createElement('button', {
        className: 'reset-session-btn',
        innerHTML: `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Recomeçar
        `
      });
      
      resetBtn.addEventListener('click', () => this.confirmResetSession());
      headerActions.appendChild(resetBtn);
    }
  }

  // Create header actions container if it doesn't exist
  createHeaderActions() {
    const header = AppUtils.$('#workout-header') || AppUtils.$('.workout-header');
    if (!header) return null;
    
    let actions = AppUtils.$('#workout-header-actions');
    if (!actions) {
      actions = AppUtils.createElement('div', {
        id: 'workout-header-actions',
        className: 'workout-header-actions'
      });
      header.appendChild(actions);
    }
    
    return actions;
  }

  // Confirm session reset
  confirmResetSession() {
    if (confirm('Tem certeza que deseja recomeçar o treino? Todo o progresso atual será perdido.')) {
      Storage.resetCurrentWorkoutSession(this.userId, this.workoutId);
      AppUtils.showSuccess('Treino reiniciado! 🔄');
      
      // Reload the workout display
      this.displayAllExercises();
      this.updateWorkoutHeader();
    }
  }

  // Display all exercises in a list
  displayAllExercises() {
    const container = AppUtils.$('#exercises-list');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create exercise items for all exercises
    this.exercises.forEach((exercise, index) => {
      const exerciseItem = this.createExerciseItem(exercise, index);
      
      // Start all exercises collapsed except the first one
      if (index > 0) {
        exerciseItem.classList.add('collapsed');
        const toggleIcon = exerciseItem.querySelector('.accordion-toggle');
        if (toggleIcon) toggleIcon.innerHTML = '▶';
      } else {
        // First exercise starts open
        const toggleIcon = exerciseItem.querySelector('.accordion-toggle');
        if (toggleIcon) toggleIcon.innerHTML = '▼';
        
        // Auto-play first video of first exercise (only on desktop)
        setTimeout(() => {
          this.autoPlayVideo(0);
        }, 500); // Wait for DOM to be ready
      }
      
      container.appendChild(exerciseItem);
    });
  }

  // Create exercise item element for the list
  createExerciseItem(exercise, index) {
    const item = AppUtils.createElement('div', {
      className: 'exercise-item',
      'data-exercise-index': index
    });
    
    // Exercise header
    const header = this.createExerciseItemHeader(exercise, index);
    item.appendChild(header);
    
    // Exercise content (video + details)
    const content = this.createExerciseContent(exercise, index);
    item.appendChild(content);
    
    // Exercise actions
    const actions = this.createExerciseActions(exercise, index);
    item.appendChild(actions);
    
    return item;
  }

  // Create exercise item header
  createExerciseItemHeader(exercise, index) {
    const header = AppUtils.createElement('div', {
      className: 'exercise-header accordion-header'
    });
    
    // Get completion status
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      index
    );
    
    const totalSeries = exercise.series || 1;
    const completedSeries = progressData.completedSeries.length;
    const isCompleted = completedSeries === totalSeries;
    
    const titleSection = AppUtils.createElement('div', {
      className: 'exercise-title-section'
    });
    
    const title = AppUtils.createElement('h3', {
      className: 'exercise-title',
      innerHTML: exercise.nome
    });
    
    const seriesCount = AppUtils.createElement('span', {
      className: 'series-count',
      innerHTML: `${completedSeries}/${totalSeries} séries`
    });
    
    const toggleIcon = AppUtils.createElement('div', {
      className: 'accordion-toggle',
      innerHTML: '▼'
    });
    
    titleSection.appendChild(title);
    titleSection.appendChild(seriesCount);
    titleSection.appendChild(toggleIcon);
    
    // Add click handler for accordion toggle
    header.addEventListener('click', () => {
      this.toggleAccordion(index);
    });
    
    header.appendChild(titleSection);
    
    return header;
  }

  // Create exercise content section
  createExerciseContent(exercise, index) {
    const content = AppUtils.createElement('div', {
      className: 'exercise-content'
    });
    
    // Main content (videos + series info)
    const mainContent = AppUtils.createElement('div', {
      className: 'exercise-main-content'
    });
    
    // Video section (both videos side by side)
    const videoSection = this.createVideoSection(exercise);
    mainContent.appendChild(videoSection);
    
    // Series section (below videos)
    const seriesSection = this.createSeriesInfoSection(exercise, index);
    mainContent.appendChild(seriesSection);
    
    // Weight section removed - now handled by Weight button
    
    content.appendChild(mainContent);
    
    // Sidebar with muscle image only
    const sidebar = AppUtils.createElement('div', {
      className: 'exercise-sidebar'
    });
    
    if (exercise.imagem) {
      const muscleImage = AppUtils.createElement('img', {
        className: 'muscle-group-image',
        src: exercise.imagem,
        alt: `Músculos trabalhados - ${exercise.nome}`,
        loading: 'lazy'
      });
      
      muscleImage.onerror = () => {
        muscleImage.style.display = 'none';
      };
      
      sidebar.appendChild(muscleImage);
    }
    
    content.appendChild(sidebar);
    
    return content;
  }

  // Create video section
  createVideoSection(exercise) {
    const section = AppUtils.createElement('div', {
      className: 'exercise-video-section'
    });
    
    const videosContainer = AppUtils.createElement('div', {
      className: 'videos-container'
    });
    
    // First video
    if (exercise.link) {
      const videoWrapper1 = AppUtils.createElement('div', {
        className: 'video-wrapper'
      });
      
      const video1 = AppUtils.createElement('video', {
        className: 'exercise-video',
        src: exercise.link,
        controls: true,
        preload: 'metadata',
        muted: true,
        playsinline: true // Prevents fullscreen on iOS
      });
      
      video1.onerror = () => {
        videoWrapper1.innerHTML = `
          <div class="video-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>
            <p>Vídeo 1 indisponível</p>
          </div>
        `;
      };
      
      videoWrapper1.appendChild(video1);
      videosContainer.appendChild(videoWrapper1);
    }
    
    // Second video
    if (exercise.link2) {
      const videoWrapper2 = AppUtils.createElement('div', {
        className: 'video-wrapper'
      });
      
      const video2 = AppUtils.createElement('video', {
        className: 'exercise-video',
        src: exercise.link2,
        controls: true,
        preload: 'metadata',
        muted: true,
        playsinline: true // Prevents fullscreen on iOS
      });
      
      video2.onerror = () => {
        videoWrapper2.innerHTML = `
          <div class="video-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>
            <p>Vídeo 2 indisponível</p>
          </div>
        `;
      };
      
      videoWrapper2.appendChild(video2);
      videosContainer.appendChild(videoWrapper2);
    }
    
    // If no videos available
    if (!exercise.link && !exercise.link2) {
      videosContainer.innerHTML = `
        <div class="video-placeholder full-width">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
          </svg>
          <p>Nenhum vídeo disponível</p>
        </div>
      `;
    }
    
    section.appendChild(videosContainer);
    return section;
  }

  // Create details section
  createDetailsSection(exercise, index) {
    const section = AppUtils.createElement('div', {
      className: 'exercise-details'
    });
    
    // Muscle group image
    if (exercise.imagem) {
      const muscleImage = AppUtils.createElement('img', {
        className: 'muscle-group-image',
        src: exercise.imagem,
        alt: `Músculos trabalhados - ${exercise.nome}`,
        loading: 'lazy'
      });
      
      muscleImage.onerror = () => {
        muscleImage.style.display = 'none';
      };
      
      section.appendChild(muscleImage);
    }
    
    // Series information
    const seriesInfo = this.createSeriesInfoSection(exercise, index);
    section.appendChild(seriesInfo);
    
    // Weight section removed - now handled by Weight button
    
    return section;
  }

  // Create series information section
  createSeriesInfoSection(exercise, index) {
    const container = AppUtils.createElement('div', {
      className: 'series-info'
    });
    
    // Create title with last weight
    const titleContainer = AppUtils.createElement('div', {
      className: 'series-title-container'
    });
    
    const title = AppUtils.createElement('h4', {
      className: 'series-title',
      innerHTML: 'Séries e Repetições'
    });
    
    const lastWeight = AppUtils.createElement('span', {
      className: 'last-weight-display'
    });
    
    // Get and display last weight if exercise should track weight
    if (this.shouldShowWeightTracking(exercise)) {
      const lastWeightValue = Storage.getLastWeight(this.userId, exercise.nome);
      if (lastWeightValue) {
        lastWeight.innerHTML = `${lastWeightValue}kg`;
        lastWeight.classList.add('has-weight');
      } else {
        lastWeight.innerHTML = 'Sem peso';
        lastWeight.classList.add('no-weight');
      }
    }
    
    titleContainer.appendChild(title);
    titleContainer.appendChild(lastWeight);
    
    const seriesList = AppUtils.createElement('div', {
      className: 'series-list'
    });
    
    // Get current progress
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      index
    );
    
    // Create series items
    for (let i = 0; i < exercise.series; i++) {
      const seriesItem = this.createSimpleSeriesItem(
        i + 1, 
        exercise.reps || exercise.tempo, 
        progressData.completedSeries.includes(i),
        index,
        i
      );
      seriesList.appendChild(seriesItem);
    }
    
    container.appendChild(titleContainer);
    container.appendChild(seriesList);
    
    return container;
  }

  // Create simple series item
  createSimpleSeriesItem(seriesNumber, repsOrTime, isCompleted, exerciseIndex, seriesIndex) {
    const item = AppUtils.createElement('div', {
      className: `series-item ${isCompleted ? 'completed' : ''}`
    });
    
    const number = AppUtils.createElement('span', {
      className: 'series-number',
      innerHTML: `${seriesNumber}ª`
    });
    
    const details = AppUtils.createElement('span', {
      className: 'series-reps',
      innerHTML: repsOrTime.toString().includes('s') || repsOrTime.toString().includes('min') 
        ? repsOrTime 
        : `${repsOrTime} reps`
    });
    
    const indicator = AppUtils.createElement('div', {
      className: 'completion-indicator'
    });
    
    // Tornar o item inteiro clicável
    item.addEventListener('click', () => {
      this.toggleSeriesCompletionInList(exerciseIndex, seriesIndex);
    });
    
    item.appendChild(number);
    item.appendChild(details);
    item.appendChild(indicator);
    
    return item;
  }

  // Create weight information section
  createWeightInfoSection(exercise) {
    const container = AppUtils.createElement('div', {
      className: 'weight-section'
    });
    
    const title = AppUtils.createElement('h4', {
      innerHTML: 'Peso'
    });
    
    const inputGroup = AppUtils.createElement('div', {
      className: 'weight-input-group'
    });
    
    const input = AppUtils.createElement('input', {
      type: 'number',
      className: 'weight-input',
      placeholder: '0.0',
      min: '0',
      step: '0.5'
    });
    
    const unit = AppUtils.createElement('span', {
      className: 'weight-unit',
      innerHTML: 'kg'
    });
    
    // Load last weight used
    const lastWeight = Storage.getLastWeight(this.userId, exercise.nome);
    if (lastWeight) {
      input.value = lastWeight;
    }
    
    // Save weight on change
    input.addEventListener('change', () => {
      const weight = parseFloat(input.value);
      if (weight > 0) {
        Storage.addWeight(this.userId, exercise.nome, weight);
      }
    });
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(unit);
    
    container.appendChild(title);
    container.appendChild(inputGroup);
    
    return container;
  }

  // Update weight history inline
  updateWeightHistoryInline(exerciseName, container) {
    // Remove existing history
    const existingHistory = container.querySelector('.weight-history');
    if (existingHistory) {
      existingHistory.remove();
    }
    
    const weights = Storage.getWeights(this.userId, exerciseName);
    if (weights.length === 0) return;
    
    const history = AppUtils.createElement('div', {
      className: 'weight-history'
    });
    
    // Show last 3 weights
    weights.slice(-3).forEach((weightData) => {
      const tag = AppUtils.createElement('span', {
        className: 'weight-tag',
        innerHTML: `${weightData.weight}kg`
      });
      
      history.appendChild(tag);
    });
    
    container.appendChild(history);
  }

  // Create exercise actions section
  createExerciseActions(exercise, index) {
    const actions = AppUtils.createElement('div', {
      className: 'exercise-actions'
    });
    
    // Show exercise timer only for time-based exercises
    if (exercise.tempo) {
      const exerciseTimerBtn = AppUtils.createElement('button', {
        className: 'start-exercise-timer-btn',
        innerHTML: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          Timer ${exercise.tempo}
        `
      });
      
      exerciseTimerBtn.addEventListener('click', () => {
        if (window.TimerManager && exercise.tempo) {
          const timeInSeconds = this.parseTimeToSeconds(exercise.tempo);
          window.TimerManager.startExerciseTimer(timeInSeconds);
        }
      });
      
      actions.appendChild(exerciseTimerBtn);
    }
    
    // Get completion status for complete button
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      index
    );
    
    const totalSeries = exercise.series || 1;
    const completedSeries = progressData.completedSeries.length;
    const allCompleted = completedSeries === totalSeries;
    
    const completeBtn = AppUtils.createElement('button', {
      className: `complete-exercise-btn ${allCompleted ? 'completed' : ''}`,
      innerHTML: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
        </svg>
        ${allCompleted ? 'Fechar' : completedSeries > 0 ? 'Concluir Restantes' : 'Concluir Todas'}
      `
    });
    
    // Add click handler for complete button
    completeBtn.addEventListener('click', () => {
      this.toggleExerciseCompletion(index);
    });

    // Weight button (only for weight-based exercises)
    if (this.shouldShowWeightTracking(exercise)) {
      const weightBtn = AppUtils.createElement('button', {
        className: 'weight-exercise-btn',
        innerHTML: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6h12v12H6z" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M8 8v8M16 8v8M10 12h4" stroke="currentColor" stroke-width="2"/>
          </svg>
          Peso
        `
      });
      
      weightBtn.addEventListener('click', () => {
        this.openWeightModal(exercise, index);
      });
      
      actions.appendChild(weightBtn);
    }
    
    actions.appendChild(completeBtn);
    
    return actions;
  }

  // Create exercise media section
  createExerciseMedia(exercise) {
    const media = AppUtils.createElement('div', {
      className: 'exercise-media'
    });
    
    // Main image
    if (exercise.imagem) {
      const img = AppUtils.createElement('img', {
        className: 'exercise-image',
        src: exercise.imagem,
        alt: exercise.nome,
        loading: 'lazy'
      });
      
      img.onerror = () => {
        img.style.display = 'none';
      };
      
      media.appendChild(img);
    }
    
    // Media controls
    if (exercise.link || exercise.link2) {
      const controls = AppUtils.createElement('div', {
        className: 'media-controls'
      });
      
      const videoButton = AppUtils.createElement('button', {
        className: 'media-button',
        innerHTML: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
          </svg>
        `
      });
      
      videoButton.addEventListener('click', () => {
        this.toggleVideos(exercise);
      });
      
      controls.appendChild(videoButton);
      media.appendChild(controls);
    }
    
    // Videos container (hidden by default)
    if (exercise.link || exercise.link2) {
      const videosContainer = this.createVideosContainer(exercise);
      media.appendChild(videosContainer);
    }
    
    return media;
  }

  // Create videos container
  createVideosContainer(exercise) {
    const container = AppUtils.createElement('div', {
      className: 'exercise-videos',
      id: `videos-${this.currentExerciseIndex}`
    });
    
    if (exercise.link) {
      const video1Container = AppUtils.createElement('div', {
        className: 'video-container'
      });
      
      const video1 = AppUtils.createElement('video', {
        className: 'exercise-video',
        src: exercise.link,
        controls: true,
        preload: 'none',
        muted: true
      });
      
      const label1 = AppUtils.createElement('div', {
        className: 'video-label',
        innerHTML: 'Ângulo 1'
      });
      
      video1Container.appendChild(video1);
      video1Container.appendChild(label1);
      container.appendChild(video1Container);
    }
    
    if (exercise.link2) {
      const video2Container = AppUtils.createElement('div', {
        className: 'video-container'
      });
      
      const video2 = AppUtils.createElement('video', {
        className: 'exercise-video',
        src: exercise.link2,
        controls: true,
        preload: 'none',
        muted: true
      });
      
      const label2 = AppUtils.createElement('div', {
        className: 'video-label',
        innerHTML: 'Ângulo 2'
      });
      
      video2Container.appendChild(video2);
      video2Container.appendChild(label2);
      container.appendChild(video2Container);
    }
    
    return container;
  }

  // Toggle videos visibility
  toggleVideos(exercise) {
    const videosContainer = AppUtils.$(`#videos-${this.currentExerciseIndex}`);
    const videoButton = AppUtils.$('.media-button');
    
    if (videosContainer) {
      const isActive = videosContainer.classList.contains('active');
      
      if (isActive) {
        videosContainer.classList.remove('active');
        videoButton.classList.remove('active');
      } else {
        videosContainer.classList.add('active');
        videoButton.classList.add('active');
      }
    }
  }

  // Create exercise progress section
  createExerciseProgress(exercise) {
    const progress = AppUtils.createElement('div', {
      className: 'exercise-progress'
    });
    
    if (this.isTimeBased(exercise)) {
      // Time-based exercise
      const timeSection = this.createTimeBasedSection(exercise);
      progress.appendChild(timeSection);
    } else {
      // Reps-based exercise
      const seriesSection = this.createSeriesSection(exercise);
      progress.appendChild(seriesSection);
    }
    
    // Weight tracking section (for applicable exercises)
    if (this.shouldShowWeightTracking(exercise)) {
      const weightSection = this.createWeightSection(exercise);
      progress.appendChild(weightSection);
    }
    
    return progress;
  }

  // Create series section for reps-based exercises
  createSeriesSection(exercise) {
    const container = AppUtils.createElement('div', {
      className: 'series-container'
    });
    
    const header = AppUtils.createElement('div', {
      className: 'series-header'
    });
    
    const title = AppUtils.createElement('h4', {
      className: 'series-title',
      innerHTML: 'Séries'
    });
    
    const info = AppUtils.createElement('span', {
      className: 'series-info',
      innerHTML: `${exercise.series} x ${exercise.reps}`
    });
    
    header.appendChild(title);
    header.appendChild(info);
    
    const seriesList = AppUtils.createElement('div', {
      className: 'series-list'
    });
    
    // Get current progress
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      this.currentExerciseIndex
    );
    
    // Create series items
    for (let i = 0; i < exercise.series; i++) {
      const seriesItem = this.createSeriesItem(i + 1, exercise.reps, progressData);
      seriesList.appendChild(seriesItem);
    }
    
    container.appendChild(header);
    container.appendChild(seriesList);
    
    return container;
  }

  // Create individual series item
  createSeriesItem(seriesNumber, reps, progressData) {
    const isCompleted = progressData.completedSeries.includes(seriesNumber - 1);
    
    const item = AppUtils.createElement('div', {
      className: `series-item ${isCompleted ? 'completed' : ''}`,
      'data-series': seriesNumber - 1
    });
    
    const number = AppUtils.createElement('div', {
      className: 'series-number',
      innerHTML: seriesNumber.toString()
    });
    
    const details = AppUtils.createElement('div', {
      className: 'series-details'
    });
    
    const repsText = AppUtils.createElement('span', {
      className: 'series-reps',
      innerHTML: `${reps} repetições`
    });
    
    details.appendChild(repsText);
    
    const actions = AppUtils.createElement('div', {
      className: 'series-actions'
    });
    
    const completeButton = AppUtils.createElement('button', {
      className: `series-button ${isCompleted ? 'completed' : ''}`,
      innerHTML: isCompleted ? '✓' : '○'
    });
    
    completeButton.addEventListener('click', () => {
      this.toggleSeriesCompletion(seriesNumber - 1);
    });
    
    actions.appendChild(completeButton);
    
    item.appendChild(number);
    item.appendChild(details);
    item.appendChild(actions);
    
    return item;
  }

  // Create time-based section
  createTimeBasedSection(exercise) {
    const container = AppUtils.createElement('div', {
      className: 'series-container'
    });
    
    const header = AppUtils.createElement('div', {
      className: 'series-header'
    });
    
    const title = AppUtils.createElement('h4', {
      className: 'series-title',
      innerHTML: 'Tempo do Exercício'
    });
    
    const info = AppUtils.createElement('span', {
      className: 'series-info',
      innerHTML: `${exercise.series} x ${exercise.tempo}`
    });
    
    header.appendChild(title);
    header.appendChild(info);
    
    const seriesList = AppUtils.createElement('div', {
      className: 'series-list'
    });
    
    // Get current progress
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      this.currentExerciseIndex
    );
    
    // Create time-based series items
    for (let i = 0; i < exercise.series; i++) {
      const seriesItem = this.createTimeBasedSeriesItem(i + 1, exercise.tempo, progressData);
      seriesList.appendChild(seriesItem);
    }
    
    container.appendChild(header);
    container.appendChild(seriesList);
    
    return container;
  }

  // Create time-based series item
  createTimeBasedSeriesItem(seriesNumber, tempo, progressData) {
    const isCompleted = progressData.completedSeries.includes(seriesNumber - 1);
    const timeInSeconds = AppUtils.parseTime(tempo);
    
    const item = AppUtils.createElement('div', {
      className: `series-item ${isCompleted ? 'completed' : ''}`,
      'data-series': seriesNumber - 1
    });
    
    const number = AppUtils.createElement('div', {
      className: 'series-number',
      innerHTML: seriesNumber.toString()
    });
    
    const details = AppUtils.createElement('div', {
      className: 'series-details'
    });
    
    const timeText = AppUtils.createElement('span', {
      className: 'series-reps',
      innerHTML: tempo
    });
    
    const timerControls = AppUtils.createElement('div', {
      className: 'exercise-timer-controls'
    });
    
    const timerDisplay = AppUtils.createElement('div', {
      className: 'timer-display-small',
      innerHTML: AppUtils.formatTime(timeInSeconds)
    });
    
    const startButton = AppUtils.createElement('button', {
      className: 'timer-button-small',
      innerHTML: `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="5,3 19,12 5,21" fill="currentColor"/>
        </svg>
      `
    });
    
    startButton.addEventListener('click', () => {
      if (window.TimerManager) {
        window.TimerManager.startExerciseTimer(timeInSeconds);
      }
    });
    
    const completeButton = AppUtils.createElement('button', {
      className: `series-button ${isCompleted ? 'completed' : ''}`,
      innerHTML: isCompleted ? '✓' : '○'
    });
    
    completeButton.addEventListener('click', () => {
      this.toggleSeriesCompletion(seriesNumber - 1);
    });
    
    timerControls.appendChild(timerDisplay);
    timerControls.appendChild(startButton);
    
    details.appendChild(timeText);
    details.appendChild(timerControls);
    
    item.appendChild(number);
    item.appendChild(details);
    item.appendChild(completeButton);
    
    return item;
  }

  // Create weight tracking section
  createWeightSection(exercise) {
    const container = AppUtils.createElement('div', {
      className: 'weight-input-container'
    });
    
    const label = AppUtils.createElement('label', {
      className: 'weight-input-label',
      innerHTML: 'Peso utilizado (opcional)'
    });
    
    const inputGroup = AppUtils.createElement('div', {
      className: 'weight-input-group'
    });
    
    const input = AppUtils.createElement('input', {
      type: 'number',
      className: 'weight-input',
      placeholder: 'Ex: 20',
      min: '0',
      step: '0.5'
    });
    
    const unit = AppUtils.createElement('span', {
      className: 'weight-unit',
      innerHTML: 'kg'
    });
    
    // Load last weight used
    const lastWeight = Storage.getLastWeight(this.userId, exercise.nome);
    if (lastWeight) {
      input.value = lastWeight;
    }
    
    // Save weight on input change
    input.addEventListener('change', () => {
      const weight = parseFloat(input.value);
      if (weight > 0) {
        Storage.addWeight(this.userId, exercise.nome, weight);
        this.updateWeightHistory(exercise.nome, container);
      }
    });
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(unit);
    
    container.appendChild(label);
    container.appendChild(inputGroup);
    
    // Add weight history
    this.updateWeightHistory(exercise.nome, container);
    
    return container;
  }

  // Update weight history display
  updateWeightHistory(exerciseName, container) {
    // Remove existing history
    const existingHistory = container.querySelector('.weight-history');
    if (existingHistory) {
      existingHistory.remove();
    }
    
    const weights = Storage.getWeights(this.userId, exerciseName);
    if (weights.length === 0) return;
    
    const history = AppUtils.createElement('div', {
      className: 'weight-history'
    });
    
    weights.forEach((weightData, index) => {
      const item = AppUtils.createElement('button', {
        className: 'weight-history-item',
        innerHTML: `${weightData.weight}kg`
      });
      
      item.addEventListener('click', () => {
        const input = container.querySelector('.weight-input');
        if (input) {
          input.value = weightData.weight;
        }
      });
      
      history.appendChild(item);
    });
    
    container.appendChild(history);
  }

  // Toggle series completion in list view
  toggleSeriesCompletionInList(exerciseIndex, seriesIndex) {
    const progressData = Storage.getExerciseProgress(
      this.userId, 
      this.workoutId, 
      exerciseIndex
    );
    
    const completedIndex = progressData.completedSeries.indexOf(seriesIndex);
    const isNowCompleted = completedIndex === -1;
    
    if (completedIndex > -1) {
      // Remove from completed
      progressData.completedSeries.splice(completedIndex, 1);
    } else {
      // Add to completed
      progressData.completedSeries.push(seriesIndex);
    }
    
    // Update progress in storage
    progressData.currentSeries = progressData.completedSeries.length;
    Storage.setExerciseProgress(
      this.userId,
      this.workoutId,
      exerciseIndex,
      progressData
    );

    // Update visual state of the specific series item immediately
    const seriesItems = document.querySelectorAll(`[data-exercise-index="${exerciseIndex}"] .series-item`);
    if (seriesItems[seriesIndex]) {
      if (isNowCompleted) {
        seriesItems[seriesIndex].classList.add('completed');
      } else {
        seriesItems[seriesIndex].classList.remove('completed');
      }
    }

    // Check if all series are complete to collapse the exercise
    this.checkAndCollapseExercise(exerciseIndex, progressData);
    
    // Update the specific exercise item's UI
    this.updateExerciseItemStatus(exerciseIndex);
  }

  // Toggle accordion open/close state
  toggleAccordion(exerciseIndex) {
    const exerciseElement = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    if (!exerciseElement) return;
    
    const isCollapsed = exerciseElement.classList.contains('collapsed');
    
    // If trying to open an accordion, close all others first
    if (isCollapsed) {
      this.closeAllAccordions();
      
      // Open the selected accordion
      exerciseElement.classList.remove('collapsed');
      const toggleIcon = exerciseElement.querySelector('.accordion-toggle');
      if (toggleIcon) toggleIcon.innerHTML = '▼';
      
      // Auto-play video for opened accordion
      this.autoPlayVideo(exerciseIndex);
    } else {
      // Close the current accordion
      exerciseElement.classList.add('collapsed');
      const toggleIcon = exerciseElement.querySelector('.accordion-toggle');
      if (toggleIcon) toggleIcon.innerHTML = '▶';
      
      // Stop video playback
      this.stopVideo(exerciseIndex);
    }
  }

  // Close all accordions
  closeAllAccordions() {
    const allExercises = document.querySelectorAll('.exercise-item');
    allExercises.forEach((element) => {
      element.classList.add('collapsed');
      const toggleIcon = element.querySelector('.accordion-toggle');
      if (toggleIcon) toggleIcon.innerHTML = '▶';
      
      // Stop any playing videos
      const videos = element.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  // Auto-play both videos when accordion opens (skip only on iOS)
  autoPlayVideo(exerciseIndex) {
    // Skip auto-play only on iOS devices to prevent fullscreen behavior
    if (this.isIOSDevice()) {
      return;
    }
    
    setTimeout(() => {
      const exerciseElement = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
      if (exerciseElement && !exerciseElement.classList.contains('collapsed')) {
        const allVideos = exerciseElement.querySelectorAll('video');
        allVideos.forEach(video => {
          video.play().catch(error => {
            console.log('Auto-play prevented by browser:', error);
          });
        });
      }
    }, 300); // Wait for accordion animation
  }

  // Check if user is on an iOS device (iPhone/iPad)
  isIOSDevice() {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
           (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 0);
  }

  // Stop video playback for specific exercise
  stopVideo(exerciseIndex) {
    const exerciseElement = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    if (exerciseElement) {
      const videos = exerciseElement.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    }
  }

  // Toggle exercise completion manually
  toggleExerciseCompletion(exerciseIndex) {
    const exercise = this.exercises[exerciseIndex];
    if (!exercise) return;

    const progressData = Storage.getExerciseProgress(
      this.userId,
      this.workoutId,
      exerciseIndex
    );

    const totalSeries = exercise.series || 1;
    const completedCount = progressData.completedSeries.length;
    const allCompleted = completedCount === totalSeries;

    if (allCompleted) {
      // Se todas estão completas, apenas fecha o modal sem alterar o progresso
      this.collapseExercise(exerciseIndex);
      // Garante que a UI está atualizada com o progresso correto
      this.updateExerciseItemStatus(exerciseIndex);
    } else {
      // Se nenhuma ou algumas estão marcadas, marca todas as restantes como completas
      progressData.completedSeries = Array.from({length: totalSeries}, (_, i) => i);
      progressData.currentSeries = totalSeries;

      // Update storage
      Storage.setExerciseProgress(
        this.userId,
        this.workoutId,
        exerciseIndex,
        progressData
      );

      // Update UI
      this.updateExerciseItemStatus(exerciseIndex);

      // Fecha o modal após marcar como completo
      this.collapseExercise(exerciseIndex);
    }
  }

  // Collapse exercise (close accordion)
  collapseExercise(exerciseIndex) {
    try {
      const exerciseElement = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
      
      if (exerciseElement) {
        exerciseElement.classList.add('collapsed');
        const toggleIcon = exerciseElement.querySelector('.accordion-toggle');
        if (toggleIcon) toggleIcon.innerHTML = '▶';
        
        // Stop video playback
        this.stopVideo(exerciseIndex);
        
        // Auto-open next exercise if available
        this.openNextExercise(exerciseIndex);
      }
    } catch (error) {
      console.error('Error collapsing exercise:', error);
    }
  }

  // Open the next uncompleted exercise
  openNextExercise(currentIndex) {
    const nextIndex = this.findNextUncompletedExercise(currentIndex);
    if (nextIndex !== -1) {
      setTimeout(() => {
        this.toggleAccordion(nextIndex);
      }, 300); // Small delay for smooth transition
    }
  }

  // Find the next uncompleted exercise
  findNextUncompletedExercise(startIndex) {
    for (let i = startIndex + 1; i < this.exercises.length; i++) {
      const exercise = this.exercises[i];
      const progressData = Storage.getExerciseProgress(
        this.userId,
        this.workoutId,
        i
      );
      
      const totalSeries = exercise.series || 1;
      const completedSeries = progressData.completedSeries.length;
      
      // If not all series are completed, return this index
      if (completedSeries < totalSeries) {
        return i;
      }
    }
    return -1; // No more uncompleted exercises
  }

  // Check if all series are completed and collapse exercise if needed
  checkAndCollapseExercise(exerciseIndex, progressData = null) {
    try {
      const exercise = this.exercises[exerciseIndex];
      if (!exercise || !exercise.series) return;

      // Get progress data if not provided
      if (!progressData) {
        progressData = Storage.getExerciseProgress(
          this.userId, 
          this.workoutId, 
          exerciseIndex
        );
      }

      const allCompleted = progressData.completedSeries.length === (exercise.series || 1);
      
      if (allCompleted) {
        this.collapseExercise(exerciseIndex);
      }
    } catch (error) {
      console.error('Error checking exercise completion:', error);
    }
  }

  // Update exercise item status
  updateExerciseItemStatus(exerciseIndex) {
    const exerciseItem = AppUtils.$(`[data-exercise-index="${exerciseIndex}"]`);
    if (!exerciseItem) return;

    const exercise = this.exercises[exerciseIndex];
    const progressData = Storage.getExerciseProgress(
      this.userId,
      this.workoutId,
      exerciseIndex
    );

    const totalSeries = exercise.series || 1;
    const completedSeries = progressData.completedSeries.length;
    const isCompleted = completedSeries === totalSeries;

    // Update status indicator
    const indicator = exerciseItem.querySelector('.status-indicator');
    if (indicator) {
      indicator.classList.toggle('completed', isCompleted);
    }

    // Update series count in header
    const seriesCount = exerciseItem.querySelector('.series-count');
    if (seriesCount) {
      seriesCount.textContent = `${completedSeries}/${totalSeries} séries`;
    }

    // Update complete button
    const completeBtn = exerciseItem.querySelector('.complete-exercise-btn');
    if (completeBtn) {
      completeBtn.classList.toggle('completed', isCompleted);
      const buttonText = isCompleted ? 'Fechar' :
                        completedSeries > 0 ? 'Concluir Restantes' :
                        'Concluir Todas';
      completeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
        </svg>
        ${buttonText}
      `;
    }

    // Update all series items visual state
    const seriesItems = exerciseItem.querySelectorAll('.series-item');
    seriesItems.forEach((item, seriesIndex) => {
      const isSeriesCompleted = progressData.completedSeries.includes(seriesIndex);
      item.classList.toggle('completed', isSeriesCompleted);
    });
  }



  // Open weight modal
  openWeightModal(exercise, exerciseIndex) {
    const modal = AppUtils.createElement('div', {
      className: 'weight-modal-overlay',
      innerHTML: `
        <div class="weight-modal">
          <div class="weight-modal-header">
            <h3>${exercise.nome}</h3>
            <button class="close-modal-btn">&times;</button>
          </div>
          <div class="weight-modal-content">
            <div class="weight-input-section">
              <label for="weight-input">Peso (kg):</label>
              <input type="number" id="weight-input" step="0.5" min="0" placeholder="Ex: 50">
            </div>
            <div class="weight-history">
              <h4>Últimos pesos:</h4>
              <div class="weight-list"></div>
            </div>
            <div class="weight-modal-actions">
              <button class="save-weight-btn">Salvar Peso</button>
              <button class="cancel-weight-btn">Cancelar</button>
            </div>
          </div>
        </div>
      `
    });

    // Load weight history
    const weightList = modal.querySelector('.weight-list');
    const weights = Storage.getWeights(this.userId, exercise.nome);
    
    if (weights.length > 0) {
      weights.forEach(weight => {
        const weightItem = AppUtils.createElement('div', {
          className: 'weight-history-item',
          innerHTML: `${weight.value}kg - ${new Date(weight.date).toLocaleDateString()}`
        });
        weightList.appendChild(weightItem);
      });
    } else {
      weightList.innerHTML = '<p class="no-weights">Nenhum peso registrado ainda</p>';
    }

    // Event listeners
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-weight-btn');
    const saveBtn = modal.querySelector('.save-weight-btn');
    const weightInput = modal.querySelector('#weight-input');

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', () => {
      const weight = parseFloat(weightInput.value);
      if (weight > 0) {
        Storage.addWeight(this.userId, exercise.nome, weight);
        AppUtils.showSuccess(`Peso ${weight}kg salvo para ${exercise.nome}`);
        
        // Update last weight display in the interface
        this.updateLastWeightDisplay(exercise.nome, weight);
        
        closeModal();
      } else {
        AppUtils.showError('Por favor, digite um peso válido');
      }
    });

    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.body.appendChild(modal);
    weightInput.focus();
  }

  // Update last weight display in the interface
  updateLastWeightDisplay(exerciseName, newWeight) {
    // Find all last weight displays for this exercise
    const weightDisplays = document.querySelectorAll('.last-weight-display');
    
    weightDisplays.forEach(display => {
      // Check if this display belongs to the current exercise by looking at the exercise name in the DOM
      const exerciseElement = display.closest('[data-exercise-index]');
      if (exerciseElement) {
        const exerciseIndex = parseInt(exerciseElement.dataset.exerciseIndex);
        const exercise = this.exercises[exerciseIndex];
        
        if (exercise && exercise.nome === exerciseName) {
          display.innerHTML = `${newWeight}kg`;
          display.classList.remove('no-weight');
          display.classList.add('has-weight');
        }
      }
    });
  }

  // Complete workout
  completeWorkout() {
    Storage.completeWorkoutSession();
    AppUtils.showSuccess('Treino finalizado! Parabéns!');
    
    // Navigate back to workout selection
    setTimeout(() => {
      if (window.Navigation) {
        window.Navigation.navigateTo('workout-selection-screen');
      }
    }, 2000);
  }

  // Check if exercise is time-based
  isTimeBased(exercise) {
    return exercise.tempo && !exercise.reps;
  }

  // Parse time string to seconds
  parseTimeToSeconds(timeString) {
    if (!timeString) return 0;
    
    // Remove any whitespace
    timeString = timeString.trim();
    
    // Check for different patterns
    if (timeString.includes('s')) {
      // Format like "30s", "45s"
      return parseInt(timeString.replace('s', ''));
    } else if (timeString.includes('min')) {
      // Format like "2min", "1.5min" 
      const minutes = parseFloat(timeString.replace('min', ''));
      return minutes * 60;
    } else if (timeString.includes(':')) {
      // Format like "1:30", "2:00"
      const parts = timeString.split(':');
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    } else {
      // Assume it's just seconds if no unit specified
      const num = parseInt(timeString);
      return isNaN(num) ? 0 : num;
    }
  }

  // Check if exercise should show weight tracking
  shouldShowWeightTracking(exercise) {
    // Don't show weight tracking for cardio/time-based exercises
    const cardioExercises = ['bicicleta', 'elíptico', 'corrida', 'caminhada'];
    const exerciseName = exercise.nome.toLowerCase();
    
    return !cardioExercises.some(cardio => exerciseName.includes(cardio)) &&
           !this.isTimeBased(exercise);
  }

  // Load user data
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

  // Get current exercise progress
  getCurrentProgress() {
    return {
      exerciseIndex: this.currentExerciseIndex,
      totalExercises: this.exercises.length,
      currentExercise: this.exercises[this.currentExerciseIndex],
      progress: Storage.getExerciseProgress(
        this.userId,
        this.workoutId,
        this.currentExerciseIndex
      )
    };
  }

  // Reset current workout progress
  resetWorkout() {
    for (let i = 0; i < this.exercises.length; i++) {
      Storage.clearExerciseProgress(this.userId, this.workoutId, i);
    }
    
    this.displayAllExercises();
  }


}

// Export exercise manager
window.ExerciseManager = new ExerciseManager();