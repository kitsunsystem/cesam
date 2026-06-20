import React from 'react';
import { playClick } from '../utils/audio';

const EmptyState = ({ title, onBack }) => {
  return (
    <div className="glass-panel success-screen" style={{ animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Concentric Luxury Rotating Rings */}
      <div className="animate-liquid-in stagger-1" style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2.5rem' }}>
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          style={{ position: 'absolute', top: 0, left: 0, animation: 'spin-clock 6s linear infinite' }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(0, 242, 254, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="40 180"
          />
        </svg>
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          style={{ position: 'absolute', top: 0, left: 0, animation: 'spin-counter 4s linear infinite' }}
        >
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="20 80"
          />
        </svg>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin-clock {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-counter {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `}} />
      </div>

      <h1 className="success-title animate-liquid-in stagger-2">{title}</h1>
      
      <p className="success-message animate-liquid-in stagger-3" style={{ marginBottom: '2.5rem' }}>
        Cet espace est en cours d'intégration et sera disponible prochainement pour les partenaires Cesam Esthetic.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-liquid-in stagger-4">
        <button className="glass-button" onClick={() => { playClick(); onBack(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Retour au menu
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
