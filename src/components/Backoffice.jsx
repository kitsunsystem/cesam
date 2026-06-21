import React, { useState, useEffect, useRef } from 'react';
import { playClick } from '../utils/audio';

const StatusDropdown = ({ currentStatus, onChange, playClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const handleSelect = (status) => {
    playClick();
    onChange(status);
    setIsOpen(false);
  };

  const getStatusText = (status) => {
    if (status === 'new') return 'Nouveau';
    if (status === 'progress') return 'En cours';
    if (status === 'done') return 'Traité';
    return status;
  };

  const getStatusClass = (status) => {
    if (status === 'new') return 'new';
    if (status === 'progress') return 'progress';
    if (status === 'done') return 'done';
    return '';
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button 
        type="button" 
        className={`custom-dropdown-trigger ${getStatusClass(currentStatus)}`} 
        onClick={toggleDropdown}
      >
        <span className="dropdown-dot"></span>
        <span className="dropdown-label">{getStatusText(currentStatus)}</span>
        <svg 
          className={`dropdown-chevron ${isOpen ? 'open' : ''}`} 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="custom-dropdown-options">
          <div className="custom-dropdown-option new" onClick={() => handleSelect('new')}>
            <span className="dropdown-dot"></span>
            Nouveau
          </div>
          <div className="custom-dropdown-option progress" onClick={() => handleSelect('progress')}>
            <span className="dropdown-dot"></span>
            En cours
          </div>
          <div className="custom-dropdown-option done" onClick={() => handleSelect('done')}>
            <span className="dropdown-dot"></span>
            Traité
          </div>
        </div>
      )}
    </div>
  );
};

const Backoffice = ({ tickets, onUpdateStatus, onDeleteTicket, onClose, addToast }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cesam_admin_auth') === 'true';
  });
  const [pwdError, setPwdError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'cesam2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cesam_admin_auth', 'true');
      setPwdError('');
      addToast("Authentification", "Accès administrateur autorisé.", "success");
    } else {
      setPwdError("Code d'accès incorrect.");
      setPassword('');
      addToast("Échec", "Mot de passe incorrect.", "error");
    }
  };

  const handleLogout = () => {
    playClick();
    setIsAuthenticated(false);
    sessionStorage.removeItem('cesam_admin_auth');
    setPassword('');
    onClose();
  };

  const exportToCSV = () => {
    playClick();
    if (tickets.length === 0) {
      addToast("Export impossible", "Aucune fiche client enregistrée.", "error");
      return;
    }

    const headers = ["ID", "Client", "Societe", "Telephone", "Email", "Dispositifs", "Date Creation", "Statut"];
    const rows = tickets.map(t => [
      t.id,
      t.name,
      t.company,
      t.phone,
      t.email,
      t.devices.join("; "),
      new Date(t.date).toLocaleString('fr-FR'),
      t.status === 'new' ? 'Nouveau' : t.status === 'progress' ? 'En cours' : 'Traite'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cesam_crm_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exportation", "Fichier CSV téléchargé.", "success");
  };

  if (!isAuthenticated) {
    return (
      <div className="pwd-modal-overlay">
        <div className="glass-panel pwd-modal">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 className="pwd-title animate-liquid-in stagger-1">Identification CRM</h3>
          <p className="animate-liquid-in stagger-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 300 }}>
            Saisissez votre code d'accès confidentiel pour ouvrir le gestionnaire de SAV.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-liquid-in stagger-3">
            <input
              type="password"
              className="form-input"
              placeholder="Code d'accès"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => playClick()}
              autoFocus
            />
            {pwdError && <div className="pwd-error">{pwdError}</div>}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="glass-button" style={{ flex: 1 }} onClick={() => { playClick(); onClose(); }}>
                Retour
              </button>
              <button type="submit" className="glass-button primary" style={{ flex: 1 }}>
                Entrer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const countTotal = tickets.length;
  const countNew = tickets.filter(t => t.status === 'new').length;
  const countProgress = tickets.filter(t => t.status === 'progress').length;
  const countDone = tickets.filter(t => t.status === 'done').length;

  const handleFilterClick = (status) => {
    playClick();
    setFilterStatus(status);
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-panel admin-container">
      {/* Admin Header */}
      <div className="admin-header animate-liquid-in stagger-1">
        <div className="admin-title-group">
          <h2>Console CRM SAV</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', fontWeight: 300 }}>
            Visualisation et archivage des requêtes d'assistance partenaires.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass-button" onClick={exportToCSV}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exporter CSV
          </button>
          <button className="glass-button" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }} onClick={handleLogout}>
            Quitter
          </button>
        </div>
      </div>

      {/* CRM Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card animate-liquid-in stagger-2">
          <div className="stat-label">Total Demandes</div>
          <div className="stat-value">{countTotal}</div>
        </div>
        <div className="stat-card animate-liquid-in stagger-3" style={{ borderLeft: '1px solid var(--accent-cyan)' }}>
          <div className="stat-label" style={{ color: 'var(--accent-cyan)' }}>Nouvelles</div>
          <div className="stat-value">{countNew}</div>
        </div>
        <div className="stat-card animate-liquid-in stagger-4" style={{ borderLeft: '1px solid #fbbf24' }}>
          <div className="stat-label" style={{ color: '#fbbf24' }}>En cours</div>
          <div className="stat-value">{countProgress}</div>
        </div>
        <div className="stat-card animate-liquid-in stagger-5" style={{ borderLeft: '1px solid var(--color-green)' }}>
          <div className="stat-label" style={{ color: 'var(--color-green)' }}>Traitées</div>
          <div className="stat-value">{countDone}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-filters-bar animate-liquid-in stagger-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'new', 'progress', 'done'].map((status) => (
            <button
              key={status}
              className="glass-button"
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.7rem',
                background: filterStatus === status ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                borderColor: filterStatus === status ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: filterStatus === status ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => handleFilterClick(status)}
            >
              {status === 'all' && 'Tous'}
              {status === 'new' && 'Nouveau'}
              {status === 'progress' && 'En cours'}
              {status === 'done' && 'Traité'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          {filteredTickets.length} / {countTotal} fiches trouvées
        </div>
      </div>

      {/* Tickets Scroll Area */}
      <div className="admin-content-area">
        {filteredTickets.length === 0 ? (
          <div className="animate-liquid-in stagger-7" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)', fontWeight: 300, fontSize: '0.85rem' }}>
            Aucun dossier d'entretien ne correspond au statut filtré.
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket, idx) => {
              // Stagger the first few ticket fiches (indices 7 to 11)
              const staggerClass = `stagger-${Math.min(7 + idx, 11)}`;
              return (
                <div key={ticket.id} className={`ticket-card animate-liquid-in ${staggerClass}`}>
                  <div>
                    <div className="ticket-header">
                      <div>
                        <div className="ticket-client">{ticket.name}</div>
                        <div className="ticket-company">{ticket.company}</div>
                      </div>
                      <span className={`status-badge ${ticket.status === 'new' ? 'new' : ticket.status === 'progress' ? 'progress' : 'done'}`}>
                        {ticket.status === 'new' ? 'Nouveau' : ticket.status === 'progress' ? 'En cours' : 'Traité'}
                      </span>
                    </div>

                    <div className="ticket-details">
                      <div className="ticket-detail-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <a href={`mailto:${ticket.email}`} style={{ color: 'inherit', textDecoration: 'none' }} className="breadcrumb-item" onClick={() => playClick()}>
                          {ticket.email}
                        </a>
                      </div>
                      
                      <div className="ticket-detail-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <a href={`tel:${ticket.phone}`} style={{ color: 'inherit', textDecoration: 'none' }} className="breadcrumb-item" onClick={() => playClick()}>
                          {ticket.phone}
                        </a>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                          ÉQUIPEMENT(S)
                        </div>
                        <div className="ticket-devices">
                          {ticket.devices.map(device => (
                            <span key={device} className="ticket-device-pill">
                              {device}
                            </span>
                          ))}
                        </div>
                      </div>

                      {ticket.serialNumber && (
                        <div className="ticket-detail-item" style={{ marginTop: '0.65rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                          <span style={{ fontSize: '0.74rem' }}>
                            <strong style={{ color: 'var(--text-muted)' }}>S/N :</strong> {ticket.serialNumber}
                          </span>
                        </div>
                      )}

                      {ticket.description && (
                        <div style={{ marginTop: '0.65rem', background: 'rgba(255, 255, 255, 0.012)', padding: '0.55rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem', letterSpacing: '0.05em' }}>DESCRIPTION DU PROBLÈME</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="ticket-date">Soumis le : {formatDate(ticket.date)}</div>
                    
                    <div className="ticket-actions">
                      <StatusDropdown
                        currentStatus={ticket.status}
                        onChange={(newStatus) => onUpdateStatus(ticket.id, newStatus)}
                        playClick={playClick}
                      />

                      <button
                        className="ticket-delete-btn"
                        title="Supprimer la fiche"
                        onClick={() => {
                          playClick();
                          if (window.confirm("Voulez-vous supprimer définitivement ce dossier client ?")) {
                            onDeleteTicket(ticket.id);
                          }
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Backoffice;
