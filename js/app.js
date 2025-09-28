/* ==============================================
   MAIN APPLICATION
   ============================================== */

class TreinoApp {
  constructor() {
    this.version = '1.0.0';
    this.isInitialized = false;
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  async init() {
    try {
      // Show loading screen
      AppUtils.setLoading(true);
      
      // Initialize app modules
      await this.initializeModules();
      
      // Setup global event listeners
      this.setupGlobalEvents();
      
      // Check for app updates
      this.checkForUpdates();
      
      // Initialize navigation
      this.navigation = new Navigation();
      
      // Initialize timer manager
      this.timerManager = new TimerManager();
      
      // Setup PWA features
      this.setupPWA();
      
      // Hide loading screen
      AppUtils.setLoading(false);
      
      this.isInitialized = true;
      
      console.log(`Treino App v${this.version} initialized successfully`);
      
    } catch (error) {
      console.error('App initialization failed:', error);
      AppUtils.setLoading(false);
      AppUtils.showError('Erro ao inicializar o aplicativo: ' + error.message);
    }
  }

  async initializeModules() {
    // Verify all required modules are loaded
    const requiredModules = [
      'AppUtils',
      'Storage', 
      'Navigation',
      'TimerManager',
      'ExerciseManager'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
      throw new Error(`Missing required modules: ${missingModules.join(', ')}`);
    }
    
    // Initialize storage
    this.storage = window.Storage;
    
    // Test data loading
    await this.testDataLoading();
  }

  async testDataLoading() {
    try {
      // Test loading both user data files
      const janaResponse = await fetch('data/treinoJana.json');
      const leandroResponse = await fetch('data/treinoLeandro.json');
      
      if (!janaResponse.ok || !leandroResponse.ok) {
        throw new Error('Erro ao carregar dados dos treinos');
      }
      
      const janaData = await janaResponse.json();
      const leandroData = await leandroResponse.json();
      
      // Validate data structure
      if (!this.validateUserData(janaData) || !this.validateUserData(leandroData)) {
        throw new Error('Estrutura dos dados de treino inválida');
      }
      
    } catch (error) {
      console.error('Data loading test failed:', error);
      throw new Error('Falha ao carregar dados dos treinos: ' + error.message);
    }
  }

  validateUserData(userData) {
    return userData && 
           userData.cronograma && 
           userData.treinos && 
           typeof userData.treinos === 'object';
  }

  setupGlobalEvents() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
    });
    
    // Visibility change (for pausing timers when app is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleAppHidden();
      } else {
        this.handleAppVisible();
      }
    });
    
    // Beforeunload (warn about losing progress)
    window.addEventListener('beforeunload', (e) => {
      const session = this.storage.getCurrentSession();
      if (session && !session.completed) {
        e.preventDefault();
        e.returnValue = 'Você tem um treino em andamento. Tem certeza que deseja sair?';
        return e.returnValue;
      }
    });
    
    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.handleGlobalError(e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.handleGlobalError(e.reason);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleGlobalKeydown(e);
    });
  }

  handleAppHidden() {
    // Pause timers when app is hidden
    if (this.timerManager && this.timerManager.currentTimer && this.timerManager.currentTimer.isRunning) {
      this.timerManager.currentTimer.pause();
    }
  }

  handleAppVisible() {
    // Resume timers or show notification when app becomes visible
    if (this.timerManager && this.timerManager.currentTimer && !this.timerManager.currentTimer.isRunning) {
      // Could auto-resume or show notification
    }
  }

  handleGlobalError(error) {
    // Log error details
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Global error details:', errorInfo);
    
    // Show user-friendly error message
    AppUtils.showError('Algo deu errado. Tente recarregar a página.');
  }

  handleGlobalKeydown(e) {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'r':
          // Prevent default refresh and show confirmation
          if (this.storage.getCurrentSession()) {
            e.preventDefault();
            const confirmReload = confirm('Você tem um treino em andamento. Recarregar a página?');
            if (confirmReload) {
              window.location.reload();
            }
          }
          break;
      }
    }
  }

  setupPWA() {
    // Install prompt handling
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or notification
      this.showInstallPrompt(deferredPrompt);
    });
    
    // Track app installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
  }

  showInstallPrompt(deferredPrompt) {
    // Only show if not already installed
    if (!AppUtils.isStandalone()) {
      setTimeout(() => {
        const shouldShow = confirm('Instalar o Treino App na tela inicial?');
        if (shouldShow) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
          });
        }
      }, 5000); // Show after 5 seconds
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('ServiceWorker registered:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateAvailable();
          }
        });
      });
      
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  }

  showUpdateAvailable() {
    const shouldUpdate = confirm('Uma nova versão do app está disponível. Atualizar agora?');
    if (shouldUpdate) {
      window.location.reload();
    }
  }

  checkForUpdates() {
    // Check for app updates (could be enhanced with server-side version check)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_VERSION' });
    }
  }

  // Public API methods
  getAppInfo() {
    return {
      version: this.version,
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      isStandalone: AppUtils.isStandalone(),
      currentUser: this.storage.getCurrentUser(),
      currentWorkout: this.storage.getCurrentWorkout()
    };
  }

  resetApp() {
    const confirmReset = confirm('Isso irá apagar todos os dados salvos. Continuar?');
    if (confirmReset) {
      this.storage.clear();
      if (this.navigation) {
        this.navigation.reset();
      }
      AppUtils.showSuccess('App resetado com sucesso!');
    }
  }

  exportData() {
    try {
      const data = this.storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `treino-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      AppUtils.showSuccess('Backup criado com sucesso!');
    } catch (error) {
      AppUtils.showError('Erro ao criar backup: ' + error.message);
    }
  }

  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const success = this.storage.importData(data);
      if (success) {
        AppUtils.showSuccess('Dados importados com sucesso! Recarregue a página.');
      } else {
        throw new Error('Falha ao importar dados');
      }
    } catch (error) {
      AppUtils.showError('Erro ao importar dados: ' + error.message);
    }
  }

  // Debug methods (development only)
  debug() {
    if (typeof window !== 'undefined') {
      window.TreinoAppDebug = {
        app: this,
        storage: this.storage,
        navigation: this.navigation,
        timer: this.timerManager,
        exercise: window.ExerciseManager,
        utils: AppUtils
      };
      console.log('Debug object available as window.TreinoAppDebug');
    }
  }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.TreinoApp = new TreinoApp();
  });
} else {
  window.TreinoApp = new TreinoApp();
}

// Enable debug mode in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  setTimeout(() => {
    if (window.TreinoApp) {
      window.TreinoApp.debug();
    }
  }, 1000);
}