import React, { useState, useEffect, useRef } from 'react';
import EmptyState from './components/EmptyState';
import MaintenanceForm from './components/MaintenanceForm';
import Backoffice from './components/Backoffice';
import { playClick, playTransition, playSuccess, playIntro, initAudio, unlockAudioContext, playHomeReturn, isAudioRunning } from './utils/audio';

// Preloaded mock data for CRM dashboard
const INITIAL_TICKETS = [
  {
    id: 'cesam-8f92j1',
    name: 'Dr. Valérie Bertrand',
    company: 'Cabinet Esthétique Azur',
    phone: '06 78 90 12 34',
    email: 'valerie.bertrand@cabinet-azur.fr',
    devices: ['JetPeel', 'Viora V30'],
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'new'
  },
  {
    id: 'cesam-3k91a2',
    name: 'Pierre Meyer',
    company: 'Clinique Esthétique des Champs',
    phone: '01 42 25 10 20',
    email: 'p.meyer@clinique-champs.fr',
    devices: ['Primelease', 'Cooltech'],
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'progress'
  },
  {
    id: 'cesam-5p82s3',
    name: 'Dr. Antoine Khelifi',
    company: 'Cabinet Médical de l\'Étoile',
    phone: '06 11 22 33 44',
    email: 'antoine.khelifi@gmail.com',
    devices: ['Viora Reaction'],
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'done'
  }
];

// Pre-calculated particle coordinates for bioluminescent dust background simulation (45 particles)
const BACKGROUND_PARTICLES = Array.from({ length: 45 }).map((_, i) => {
  const colors = ['cyan', 'purple', 'gold', 'white'];
  const color = colors[i % colors.length];
  const size = `${(i % 3) * 0.6 + 1.0}px`;
  const delay = `${(i * 0.17).toFixed(2)}s`;
  const duration = `${(10 + (i % 6) * 3).toFixed(2)}s`;
  const pathType = `wavy-${(i % 3) + 1}`;
  return {
    id: i,
    left: `${(i * 17 + 7) % 100}%`,
    top: `${(i * 13 + 19) % 100}%`,
    size,
    color,
    delay,
    duration,
    pathType
  };
});

// Particle vortex angles and speeds for the splash screen
const VORTEX_PARTICLES = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  angle: (i * 360) / 28,
  delay: (i * 0.07).toFixed(2),
  duration: (1.2 + (i % 3) * 0.4).toFixed(2)
}));

function App() {
  // Entrance Splash states
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [emptyPageTitle, setEmptyPageTitle] = useState('');
  const [tickets, setTickets] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  // Transition variables
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionState, setTransitionState] = useState('idle');
  const [cosmicTransitionState, setCosmicTransitionState] = useState('idle');
  
  // Mouse position and parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Secret triggers click count
  const [footerClicks, setFooterClicks] = useState(0);

  // Audio playback and progress tracking refs
  const introSoundPlayed = useRef(false);
  const progressRef = useRef(0);

  // Sync progress state with ref for event listener closures
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Pre-unlock audio context on any early touch or click during loading
  useEffect(() => {
    const unlockAudio = () => {
      unlockAudioContext();
      setAudioUnlocked(true);
      
      // Fallback: If loader has already finished and intro sound hasn't played yet, play it immediately
      if (progressRef.current === 100 && !introSoundPlayed.current) {
        playIntro();
        introSoundPlayed.current = true;
      }
    };

    window.addEventListener('mousedown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const handleStartApp = (e) => {
    if (e) {
      e.stopPropagation();
    }
    unlockAudioContext();
    setAudioUnlocked(true);
    playClick();
  };

  // Track cursor position for the glowing mouse follower
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        document.documentElement.style.setProperty('--mouse-x', `${touch.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${touch.clientY}px`);
        setMousePos({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Smooth interpolation loop for background parallax
  useEffect(() => {
    if (mousePos.x === 0 && mousePos.y === 0) return;
    
    const targetX = (mousePos.x - window.innerWidth / 2) * -0.015;
    const targetY = (mousePos.y - window.innerHeight / 2) * -0.015;
    
    let animationFrameId;
    const updateParallax = () => {
      setParallax((prev) => {
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        const nextX = prev.x + dx * 0.08;
        const nextY = prev.y + dy * 0.08;
        
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return { x: targetX, y: targetY };
        }
        return { x: nextX, y: nextY };
      });
      animationFrameId = requestAnimationFrame(updateParallax);
    };
    
    animationFrameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Loading screen progression timer (starts automatically on mount)
  useEffect(() => {
    const duration = 2400;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const increment = 100 / steps;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, []);

  // Trigger audio intro and fade out splash screen when loader hits 100%
  useEffect(() => {
    if (progress === 100) {
      // Play C-major brand signature if not already played
      if (!introSoundPlayed.current) {
        playIntro();
        // If AudioContext was successfully running (user had interacted), mark as played
        if (isAudioRunning()) {
          introSoundPlayed.current = true;
        }
      }
      
      // Transition out
      const fadeTimer = setTimeout(() => {
        setSplashFadeOut(true);
      }, 400);
      
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 1250); // Matches CSS transition duration

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [progress]);

  // Initialize tickets from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('cesam_tickets');
    if (stored) {
      try {
        setTickets(JSON.parse(stored));
      } catch (e) {
        console.error("Error reading tickets", e);
        setTickets(INITIAL_TICKETS);
      }
    } else {
      setTickets(INITIAL_TICKETS);
      localStorage.setItem('cesam_tickets', JSON.stringify(INITIAL_TICKETS));
    }
  }, []);

  // Safely reset click counter after 3 seconds of inactivity
  useEffect(() => {
    if (footerClicks === 0) return;
    const timer = setTimeout(() => {
      setFooterClicks(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, [footerClicks]);

  // Sync tickets with LocalStorage
  const saveTickets = (updatedTickets) => {
    setTickets(updatedTickets);
    localStorage.setItem('cesam_tickets', JSON.stringify(updatedTickets));
  };

  // Toast notification system
  const addToast = (title, desc, type = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // iOS-style Soft Condensation Transition Coordinator
  const navigateWithTransition = (screen, title = '', backScreen = '') => {
    if (isTransitioning) return;
    
    playTransition();
    setIsTransitioning(true);
    setTransitionState('exiting');

    // Swap states at 200ms when the blur is at its peak opacity
    setTimeout(() => {
      if (title) {
        setEmptyPageTitle(title);
      }
      if (screen === 'empty-state') {
        setPreviousScreen(backScreen || currentScreen);
      }
      setCurrentScreen(screen);
      setTransitionState('entering');
    }, 200);

    // End transition block at 380ms
    setTimeout(() => {
      setTransitionState('idle');
      setIsTransitioning(false);
    }, 380);
  };

  // Click handler for footer copyright (5-clicks)
  const handleFooterClick = () => {
    playClick();
    const newCount = footerClicks + 1;
    setFooterClicks(newCount);
    
    if (newCount === 3) {
      addToast("Administration", "Accès administrateur en cours de déverrouillage.", "info");
    } else if (newCount >= 5) {
      setFooterClicks(0);
      navigateWithTransition('backoffice');
    }
  };

  // Secret direct dot click
  const handleSecretDotClick = () => {
    playClick();
    navigateWithTransition('backoffice');
  };

  // Form submit handler
  const handleFormSubmit = (newTicket) => {
    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    playSuccess();
  };

  // CRM action handlers
  const handleUpdateStatus = (id, newStatus) => {
    playClick();
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus } : t);
    saveTickets(updated);
    addToast("Mise à jour", "Statut de la demande enregistré.", "success");
  };

  const handleDeleteTicket = (id) => {
    playClick();
    const updated = tickets.filter(t => t.id !== id);
    saveTickets(updated);
    addToast("Suppression", "La fiche d'entretien a été retirée.", "success");
  };

  const handleHeaderLogoClick = () => {
    if (currentScreen === 'home') return;
    if (isTransitioning || cosmicTransitionState !== 'idle') return;
    
    playHomeReturn();
    setCosmicTransitionState('zooming');

    // Zooming takes 350ms, then we transform in the center
    setTimeout(() => {
      setCosmicTransitionState('transforming');
    }, 350);

    // Transforming takes 600ms, then we trigger dissolving transition
    setTimeout(() => {
      setCosmicTransitionState('dissolving');
      setCurrentScreen('home'); // Swap to home menu immediately at start of dissolving phase
    }, 950);

    // End transition completely at 1450ms
    setTimeout(() => {
      setCosmicTransitionState('idle');
    }, 1450);
  };

  const handleUserFirstInteraction = () => {
    initAudio();
  };

  return (
    <div className="app-container" onClick={handleUserFirstInteraction} onTouchStart={handleUserFirstInteraction}>
      {/* Cosmic Portal Logo Transition Overlay */}
      {cosmicTransitionState !== 'idle' && (
        <div className={`cosmic-portal-overlay ${cosmicTransitionState}`}>
          <div className="cosmic-stars"></div>
          <div className="cosmic-nebula"></div>
          <div className="cosmic-energy-rings">
            <div className="energy-ring ring-1"></div>
            <div className="energy-ring ring-2"></div>
          </div>
          <img 
            src="/logo.png" 
            alt="Cosmic Cesam Logo" 
            className={`cosmic-logo ${cosmicTransitionState}`} 
          />
          <div className="cosmic-flash"></div>
        </div>
      )}

      {/* Dynamic Background Glowing & Drifting Plankton Particles */}
      <div 
        className="bg-glow-container" 
        style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
      >
        <div className="bg-glow-orb orb-1"></div>
        <div className="bg-glow-orb orb-2"></div>
        <div className="bg-glow-orb orb-3"></div>
        <div className="particles-container">
          {BACKGROUND_PARTICLES.map((p) => (
            <div
              key={p.id}
              className={`particle color-${p.color} path-${p.pathType}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </div>
      </div>

      {/* Interactive Cursor Follower Glow */}
      <div className="mouse-glow-follower"></div>

      {/* Cinematic Splash Screen Entrance */}
      {showSplash && (
        <div className={`splash-screen ${splashFadeOut ? 'fade-out' : ''}`}>
          {/* Swirling Tech Vortex Particles */}
          <div className="vortex-container">
            {VORTEX_PARTICLES.map((p) => (
              <div 
                key={p.id}
                className="vortex-particle"
                style={{
                  '--rotation': `${p.angle}deg`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`
                }}
              />
            ))}
          </div>

          {/* SVG Precision Circular Neon Progress Indicator */}
          <div className="splash-hud-wrapper">
            <div 
              className="splash-liquid-glow-scaler" 
              style={{ transform: `scale(${0.65 + (progress / 100) * 0.45})` }}
            >
              <div className="splash-liquid-glow"></div>
            </div>
            <svg className="hud-svg-ring" viewBox="0 0 200 200">
              <circle className="hud-ring-ticks" cx="100" cy="100" r="95" strokeDasharray="2, 6" />
              <circle className="hud-ring-outer" cx="100" cy="100" r="86" strokeDasharray="40 120" />
              <circle 
                className="hud-ring-progress" 
                cx="100" 
                cy="100" 
                r="76" 
                strokeDasharray="478" 
                strokeDashoffset={478 - (478 * progress) / 100} 
              />
              <circle className="hud-ring-inner" cx="100" cy="100" r="68" strokeDasharray="10 40" />
            </svg>
            <img src="/logo.png" alt="Cesam Esthetic Logo" className="splash-logo" />
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="header">
        <div className="logo-container" onClick={handleHeaderLogoClick}>
          <div className="logo-icon">
            <img src="/logo.png" alt="Cesam Logo" className="logo-img" />
          </div>
          <span className="logo-text">Cesam</span>
        </div>
        
        {currentScreen === 'backoffice' && (
          <button className="glass-button" onClick={() => { playClick(); navigateWithTransition('home'); }}>
            Quitter
          </button>
        )}
      </header>

      {/* Screen Routing with scale/opacity transition wrapper */}
      <main>
        <div className={`page-container ${
          cosmicTransitionState === 'zooming' || cosmicTransitionState === 'transforming'
            ? 'cosmic-exiting'
            : cosmicTransitionState === 'dissolving'
            ? 'cosmic-entering'
            : transitionState === 'exiting'
            ? 'exiting'
            : transitionState === 'entering'
            ? 'entering'
            : ''
        }`}>
          
          {/* SCREEN 1: Home Grid */}
          {currentScreen === 'home' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 className="animate-liquid-in stagger-1" style={{ fontSize: '1.8rem', fontWeight: '200', marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  CESAM APP
                </h1>
                <p className="animate-liquid-in stagger-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
                  Sélectionnez votre espace d'activité pour gérer vos consommables, vos supports de communication ou votre SAV.
                </p>
              </div>
              
              <div className="grid-container">
                <div className="glass-card animate-liquid-in stagger-3" onClick={() => navigateWithTransition("consommables")}>
                  <div className="card-title">
                    Nos Consomables
                    <span className="card-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>Ouvrir</span>
                  </div>
                  <p className="card-desc">
                    Commandes de consommables d'origine (JetPeel, Wishpro, Skin Eclipse, Twin Slim).
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-4" onClick={() => navigateWithTransition("communication")}>
                  <div className="card-title">
                    Support de communication
                    <span className="card-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>Ouvrir</span>
                  </div>
                  <p className="card-desc">
                    Accédez aux ressources marketing, kits réseaux sociaux et brochures de nos marques.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-5 liquid-glow" style={{ borderColor: 'rgba(0, 242, 254, 0.15)' }} onClick={() => navigateWithTransition('sav')}>
                  <div className="card-title">
                    Espace SAV
                    <span className="card-badge" style={{ background: 'rgba(0, 242, 254, 0.08)', borderColor: 'rgba(0, 242, 254, 0.25)', color: 'var(--accent-cyan)' }}>Actif</span>
                  </div>
                  <p className="card-desc">
                    Demandes d'entretien technique, boutique en ligne et SAV en vidéo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: SAV Menu */}
          {currentScreen === 'sav' && (
            <div>
              <div className="breadcrumbs animate-liquid-in stagger-1">
                <span className="breadcrumb-item" onClick={() => navigateWithTransition('home')}>Accueil</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span style={{ color: '#fff' }}>SAV</span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 className="animate-liquid-in stagger-2" style={{ fontSize: '1.8rem', fontWeight: '200', marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Service après-vente
                </h1>
                <p className="animate-liquid-in stagger-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>
                  Choisissez le service de maintenance ou de formation requis pour vos équipements.
                </p>
              </div>

              <div className="grid-container">
                <div className="glass-card animate-liquid-in stagger-4" onClick={() => navigateWithTransition("empty-state", "le SAV en vidéo")}>
                  <div className="card-title">
                    le SAV en vidéo
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Tutoriels vidéo et manuels de démarrage rapide pour l'utilisation autonome de vos dispositifs.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-5" onClick={() => navigateWithTransition("empty-state", "boutique en ligne")}>
                  <div className="card-title">
                    boutique en ligne
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Pièces techniques et modules de rechange officiels pour l'entretien régulier de vos machines.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-6 liquid-glow" style={{ borderColor: 'rgba(0, 242, 254, 0.15)' }} onClick={() => navigateWithTransition('maintenance')}>
                  <div className="card-title">
                    Demande d'entretien
                    <span className="card-badge" style={{ background: 'rgba(0, 242, 254, 0.08)', borderColor: 'rgba(0, 242, 254, 0.25)', color: 'var(--accent-cyan)' }}>Ouvrir</span>
                  </div>
                  <p className="card-desc">
                    Formulaire technique de demande d'assistance périodique ou curative pour vos dispositifs.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }} className="animate-liquid-in stagger-7">
                <button className="glass-button" onClick={() => navigateWithTransition('home')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Nos Consommables */}
          {currentScreen === 'consommables' && (
            <div>
              <div className="breadcrumbs animate-liquid-in stagger-1">
                <span className="breadcrumb-item" onClick={() => navigateWithTransition('home')}>Accueil</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span style={{ color: '#fff' }}>Nos Consommables</span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 className="animate-liquid-in stagger-2" style={{ fontSize: '1.8rem', fontWeight: '200', marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Nos Consomables
                </h1>
                <p className="animate-liquid-in stagger-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>
                  Sélectionnez votre technologie pour commander des consommables d'origine.
                </p>
              </div>

              <div className="grid-container">
                <div className="glass-card animate-liquid-in stagger-4" onClick={() => navigateWithTransition("empty-state", "Consommables JETPEEL")}>
                  <div className="card-title">
                    JETPEEL
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Solutions d'infusion et pièces à main authentiques JetPeel.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-5" onClick={() => navigateWithTransition("empty-state", "Consommables WISHPRO")}>
                  <div className="card-title">
                    WISHPRO
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Capsules de soin et accessoires de traitement Wishpro.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-6" onClick={() => navigateWithTransition("empty-state", "Consommables SKIN ECLIPSE")}>
                  <div className="card-title">
                    SKIN ECLIPSE
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Consommables et accessoires de soin pour votre système Skin Eclipse.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-7" onClick={() => navigateWithTransition("empty-state", "Consommables TWIN SLIM")}>
                  <div className="card-title">
                    TWIN SLIM
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Électrodes, crèmes et pièces à main pour votre dispositif Twin Slim.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }} className="animate-liquid-in stagger-8">
                <button className="glass-button" onClick={() => navigateWithTransition('home')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Support de communication */}
          {currentScreen === 'communication' && (
            <div>
              <div className="breadcrumbs animate-liquid-in stagger-1">
                <span className="breadcrumb-item" onClick={() => navigateWithTransition('home')}>Accueil</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span style={{ color: '#fff' }}>Support de communication</span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 className="animate-liquid-in stagger-2" style={{ fontSize: '1.8rem', fontWeight: '200', marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Support de communication
                </h1>
                <p className="animate-liquid-in stagger-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>
                  Téléchargez nos kits marketing, photos, vidéos et brochures pour vos cabinets.
                </p>
              </div>

              <div className="grid-container">
                <div className="glass-card animate-liquid-in stagger-4" onClick={() => navigateWithTransition("empty-state", "Supports JETPEEL")}>
                  <div className="card-title">
                    JETPEEL
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Brochures, fiches d'information et contenus pour réseaux sociaux.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-5" onClick={() => navigateWithTransition("empty-state", "Supports REJULIGHT")}>
                  <div className="card-title">
                    REJULIGHT
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Visuels HD, vidéos de démonstration et supports cliniques.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-6" onClick={() => navigateWithTransition("empty-state", "Supports VIORA SERIES")}>
                  <div className="card-title">
                    VIORA SERIES
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Kits de communication pour V30, Reaction et technologies Viora.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-7" onClick={() => navigateWithTransition("empty-state", "Supports TWIN SLIM")}>
                  <div className="card-title">
                    TWIN SLIM
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Brochures patientèle, posters de cabinet et visuels réseaux.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-8" onClick={() => navigateWithTransition("empty-state", "Supports PULSELASER")}>
                  <div className="card-title">
                    PULSELASER
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Fiches techniques et outils promotionnels pour le PulseLaser.
                  </p>
                </div>

                <div className="glass-card animate-liquid-in stagger-9" onClick={() => navigateWithTransition("empty-state", "Supports POWER SYSTEM")}>
                  <div className="card-title">
                    POWER SYSTEM
                    <span className="card-badge">Bientôt</span>
                  </div>
                  <p className="card-desc">
                    Brochures et kits de mise en valeur pour les technologies Power.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }} className="animate-liquid-in stagger-10">
                <button className="glass-button" onClick={() => navigateWithTransition('home')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: Maintenance Form */}
          {currentScreen === 'maintenance' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="breadcrumbs animate-liquid-in stagger-1">
                <span className="breadcrumb-item" onClick={() => navigateWithTransition('home')}>Accueil</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-item" onClick={() => navigateWithTransition('sav')}>SAV</span>
                <span className="breadcrumb-separator">&gt;</span>
                <span style={{ color: '#fff' }}>Demande d'entretien</span>
              </div>

              <MaintenanceForm 
                onSubmit={handleFormSubmit}
                onBack={() => navigateWithTransition('sav')}
                addToast={addToast}
              />
            </div>
          )}

          {/* SCREEN 4: Empty Placeholders */}
          {currentScreen === 'empty-state' && (
            <EmptyState 
              title={emptyPageTitle}
              onBack={() => navigateWithTransition(previousScreen)}
            />
          )}

          {/* SCREEN 5: Admin CRM */}
          {currentScreen === 'backoffice' && (
            <Backoffice 
              tickets={tickets}
              onUpdateStatus={handleUpdateStatus}
              onDeleteTicket={handleDeleteTicket}
              onClose={() => navigateWithTransition('home')}
              addToast={addToast}
            />
          )}

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="footer">
        <span className="secret-trigger" onClick={handleFooterClick}>
          Cesam Esthetic — Espace Partenaires &copy; {new Date().getFullYear()}
        </span>
        <span className="secret-dot" onClick={handleSecretDotClick} title="Administration direct bypass"></span>
      </footer>

      {/* Glass condensation transition overlay */}
      <div className={`liquid-transition-overlay ${isTransitioning ? 'animating' : ''}`}></div>

      {/* Toast alert system */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-desc">{toast.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
