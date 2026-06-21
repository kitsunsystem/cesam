import React, { useState } from 'react';
import { playClick } from '../utils/audio';

const DEVICES = [
  "JetPeel",
  "Viora Reaction",
  "Viora V20",
  "Viora V30",
  "Primelease",
  "Cooltech",
  "Alma Rejuve",
  "Autre..."
];

const MaintenanceForm = ({ onSubmit, onBack, addToast }) => {
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [customDevice, setCustomDevice] = useState('');
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    serialNumber: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleDevice = (device) => {
    playClick();
    if (selectedDevices.includes(device)) {
      setSelectedDevices(selectedDevices.filter(d => d !== device));
    } else {
      setSelectedDevices([...selectedDevices, device]);
    }
    if (errors.devices) {
      setErrors(prev => ({ ...prev, devices: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleInputFocus = () => {
    playClick();
  };

  const validateForm = () => {
    const newErrors = {};
    if (selectedDevices.length === 0) {
      newErrors.devices = "Sélectionnez au moins un dispositif.";
    }
    if (selectedDevices.includes("Autre...") && !customDevice.trim()) {
      newErrors.customDevice = "Veuillez spécifier votre équipement.";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Nom et prénom obligatoires.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Numéro de téléphone obligatoire.";
    } else if (!/^[+0-9\s-]{8,20}$/.test(formData.phone.trim())) {
      newErrors.phone = "Format invalide.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Adresse email obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format email invalide.";
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Numéro de série obligatoire.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playClick();
    if (!validateForm()) {
      addToast("Erreur de saisie", "Veuillez remplir les informations requises.", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const mappedDevices = selectedDevices.map(d => d === "Autre..." ? `Autre: ${customDevice}` : d);
      
      const newTicket = {
        id: 'cesam-' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        company: formData.company || 'Cabinet Indépendant',
        phone: formData.phone,
        email: formData.email,
        devices: mappedDevices,
        serialNumber: formData.serialNumber,
        description: formData.description,
        date: new Date().toISOString(),
        status: 'new'
      };

      onSubmit(newTicket);
      setIsSubmitting(false);
      setIsSuccess(true);
      addToast("Transmission réussie", "Votre demande d'entretien a été enregistrée.", "success");

      // Log email content to console
      console.log("%c[CESAM SYSTEM - TICKET SENT]", "color: #00f2fe; font-weight: bold; letter-spacing: 0.05em;");
      console.log(`Destinataire : medyassine.1234567@gmail.com`);
      console.log(`Objet : [SAV Cesam] Demande d'Entretien Technique`);
      console.log(`Appareil(s) : ${mappedDevices.join(", ")}`);
      console.log(`Nom Client : ${formData.name}`);
      console.log(`Société : ${formData.company || 'N/A'}`);
      console.log(`Téléphone : ${formData.phone}`);
      console.log(`Email : ${formData.email}`);
      console.log(`Numéro de Série : ${formData.serialNumber}`);
      console.log(`Description : ${formData.description}`);
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div className="glass-panel success-screen" style={{ margin: 'auto 0' }}>
        <div className="success-icon-container animate-liquid-in stagger-1">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{ width: '30px', height: '30px' }}>
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" />
            <path className="checkmark-check" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
          <style dangerouslySetInnerHTML={{__html: `
            .checkmark-circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-miterlimit: 10;
              animation: stroke 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .checkmark-check {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: stroke 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
            }
            @keyframes stroke {
              100% { stroke-dashoffset: 0; }
            }
          `}} />
        </div>
        <h2 className="success-title animate-liquid-in stagger-2">Demande enregistrée</h2>
        <p className="success-message animate-liquid-in stagger-3">
          Votre demande d'entretien a été traitée.<br />
          Un email récapitulatif a été transmis à <strong>medyassine.1234567@gmail.com</strong>.<br />
          Notre équipe technique vous recontactera par téléphone sous 24h.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-liquid-in stagger-4">
          <button className="glass-button" onClick={() => { playClick(); onBack(); }}>
            Retourner au menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel form-step-container">
      <h2 className="form-title animate-liquid-in stagger-1">Demande d'entretien</h2>
      <p className="form-subtitle animate-liquid-in stagger-2">Planifiez l'assistance et la révision réglementaire de vos technologies esthétiques.</p>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Devices */}
        <div className="section-label animate-liquid-in stagger-3">
          <span className="section-label-number">1</span>
          Sélection des équipements
        </div>
        
        <div className="devices-grid">
          {DEVICES.map((device, idx) => {
            const isSelected = selectedDevices.includes(device);
            // Stagger device tags (indices 4 to 11)
            const staggerClass = `stagger-${Math.min(4 + idx, 12)}`;
            return (
              <div
                key={device}
                className={`device-tag animate-liquid-in ${staggerClass} ${isSelected ? 'selected liquid-glow' : ''}`}
                onClick={() => toggleDevice(device)}
              >
                {device}
              </div>
            );
          })}
        </div>
        
        {/* Custom equipment text input if "Autre..." is selected */}
        {selectedDevices.includes("Autre...") && (
          <div className="form-group animate-liquid-in" style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
            <label htmlFor="customDevice">Spécifiez votre équipement</label>
            <input
              type="text"
              id="customDevice"
              name="customDevice"
              className={`form-input ${errors.customDevice ? 'input-error' : ''}`}
              placeholder="Ex: Appareil de cryolipolyse..."
              value={customDevice}
              onChange={(e) => {
                setCustomDevice(e.target.value);
                if (errors.customDevice) {
                  setErrors(prev => ({ ...prev, customDevice: null }));
                }
              }}
              onFocus={handleInputFocus}
            />
            {errors.customDevice && <span style={{ color: 'var(--color-red)', fontSize: '0.72rem', fontWeight: 300 }}>{errors.customDevice}</span>}
          </div>
        )}

        {errors.devices && (
          <div className="animate-liquid-in" style={{ color: 'var(--color-red)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1.25rem', fontWeight: 300 }}>
            {errors.devices}
          </div>
        )}

        {/* Step 2: Info */}
        <div className="section-label animate-liquid-in" style={{ marginTop: '0.5rem' }}>
          <span className="section-label-number">2</span>
          Informations de contact et détails
        </div>

        <div className="form-grid">
          <div className="form-group animate-liquid-in">
            <label htmlFor="company">Cabinet / Société / Institut</label>
            <input
              type="text"
              id="company"
              name="company"
              className="form-input"
              placeholder="Ex: Clinique Esthétique"
              value={formData.company}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
          </div>

          <div className="form-group animate-liquid-in">
            <label htmlFor="name">Nom et Prénom</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Ex: Dr. Jean Dupont"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {errors.name && <span style={{ color: 'var(--color-red)', fontSize: '0.72rem', fontWeight: 300 }}>{errors.name}</span>}
          </div>

          <div className="form-group animate-liquid-in">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="Ex: 06 12 34 56 78"
              value={formData.phone}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {errors.phone && <span style={{ color: 'var(--color-red)', fontSize: '0.72rem', fontWeight: 300 }}>{errors.phone}</span>}
          </div>

          <div className="form-group animate-liquid-in">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Ex: contact@cabinet.fr"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {errors.email && <span style={{ color: 'var(--color-red)', fontSize: '0.72rem', fontWeight: 300 }}>{errors.email}</span>}
          </div>

          <div className="form-group animate-liquid-in span-2-cols">
            <label htmlFor="serialNumber">Numéro de série de l'appareil</label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              className={`form-input ${errors.serialNumber ? 'input-error' : ''}`}
              placeholder="Ex: CS-2026-X891"
              value={formData.serialNumber}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {errors.serialNumber && <span style={{ color: 'var(--color-red)', fontSize: '0.72rem', fontWeight: 300 }}>{errors.serialNumber}</span>}
          </div>

          <div className="form-group animate-liquid-in span-2-cols">
            <label htmlFor="description">Observation (facultatif)</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input"
              placeholder="Ex: Le système de refroidissement ne s'active pas, code d'erreur E04..."
              value={formData.description}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Step 3: Actions */}
        <div className="form-actions animate-liquid-in stagger-11">
          <button type="button" className="glass-button" onClick={() => { playClick(); onBack(); }} disabled={isSubmitting}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour
          </button>
          
          <button type="submit" className="glass-button primary liquid-glow" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                  <path d="M4 12a8 8 0 018-8V4" fill="currentColor" />
                </svg>
                Envoi...
              </>
            ) : (
              <>
                Envoyer
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
