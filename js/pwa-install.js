// PWA Installation Helper
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isIOSDevice = this.detectIOSDevice();
    this.setupEventListeners();
  }

  detectIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 0);
  }

  setupEventListeners() {
    // Android/Chrome install prompt - captura mas não mostra o pop-up nativo
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt fired - Android/Chrome PWA ready');
      e.preventDefault(); // Bloqueia o pop-up nativo
      this.deferredPrompt = e;
      this.showInstallBanner(); // Mostra nosso banner personalizado
    });

    // iOS install guidance
    if (this.isIOSDevice && !this.isStandalone()) {
      this.showIOSInstallGuidance();
    }

    // Track if app was installed
    window.addEventListener('appinstalled', (e) => {
      console.log('App installed successfully');
      this.hideInstallBanner();
    });
  }

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  showInstallBanner() {
    if (this.isStandalone()) return;

    // Delay para não ser muito intrusivo
    setTimeout(() => {
      const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">
          <img src="icons/halteres.png" alt="Treino App" width="32" height="32">
        </div>
        <div class="install-banner-text">
          <strong>Instalar Treino App</strong>
          <p>Adicione à sua tela inicial para acesso rápido</p>
        </div>
        <div class="install-banner-actions">
          <button id="install-button" class="install-btn">Instalar</button>
          <button id="dismiss-banner" class="dismiss-btn">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Handle install button click
    document.getElementById('install-button').addEventListener('click', () => {
      this.promptInstall();
    });

    // Handle dismiss button
    document.getElementById('dismiss-banner').addEventListener('click', () => {
      this.hideInstallBanner();
    });

      // Auto-hide after 8 seconds
      setTimeout(() => {
        this.hideInstallBanner();
      }, 8000);
    }, 2000); // Delay de 2 segundos para mostrar o banner
  }

  showIOSInstallGuidance() {
    if (this.isStandalone()) return;

    // Check if guidance was already shown recently
    const lastShown = localStorage.getItem('ios-install-guidance-shown');
    if (lastShown && Date.now() < parseInt(lastShown)) {
      return; // Don't show again within 7 days
    }

    // Show guidance after 3 seconds
    setTimeout(() => {
      const modal = document.createElement('div');
      modal.id = 'ios-install-modal';
      modal.className = 'ios-install-modal';
      modal.innerHTML = `
        <div class="ios-install-content">
          <div class="ios-install-header">
            <img src="icons/halteres.png" alt="Treino App" width="40" height="40">
            <h3>Instalar Treino App</h3>
            <button id="close-ios-modal" class="close-btn">×</button>
          </div>
          <div class="ios-install-steps">
            <div class="step">
              <span class="step-number">1</span>
              <p>Toque no botão de <strong>compartilhar</strong> 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </p>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <p>Selecione <strong>"Adicionar à Tela de Início"</strong></p>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <p>Toque em <strong>"Adicionar"</strong> para confirmar</p>
            </div>
          </div>
          <button id="got-it-btn" class="got-it-btn">Entendi!</button>
        </div>
      `;

      document.body.appendChild(modal);

      // Handle close buttons
      document.getElementById('close-ios-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
      });

      document.getElementById('got-it-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        // Set a flag to not show again for 7 days
        localStorage.setItem('ios-install-guidance-shown', Date.now() + (7 * 24 * 60 * 60 * 1000));
      });

      // Auto-close after 15 seconds
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 15000);

    }, 3000);
  }

  async promptInstall() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    this.deferredPrompt = null;
    this.hideInstallBanner();
  }

  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }
}

// Initialize PWA installer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing PWA installer...');
  const installer = new PWAInstaller();
  console.log('PWA installer created:', installer);
  console.log('Is iOS device:', installer.isIOSDevice);
  console.log('Is standalone:', installer.isStandalone());
});