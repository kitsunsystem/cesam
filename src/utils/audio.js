// Web Audio API Synthesizer for soft, organic luxury system sounds
let audioCtx = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// Play a micro silent oscillator burst to unlock AudioContext on iOS/Safari
export const unlockAudioContext = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Silent
    osc.start(0);
    osc.stop(audioCtx.currentTime + 0.01);

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    console.warn("Silent audio unlock failed", e);
  }
};

// Check if AudioContext is running
export const isAudioRunning = () => {
  return audioCtx && audioCtx.state === 'running';
};

// Play an extremely soft, organic haptic pop (like a premium button tap)
export const playClick = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Muted bubble/pop signature: low frequency sine wave decaying in 25ms
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.025);

    // Extremely low volume for subtlety
    gainNode.gain.setValueAtTime(0.012, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.025);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {
    console.warn("Audio click failed", e);
  }
};

// Play a gentle, airy glass chime for transitions
export const playTransition = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Soft crystalline bell tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5

    // Slow attack (50ms) and release (400ms) to create a gentle puff sound
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio transition failed", e);
  }
};

// Play a warm, ambient major triad chord on success (C5 + E5 + G5)
export const playSuccess = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 (Major triad)

    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Smooth attack and very slow fade out
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.005, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.start(now);
      osc.stop(now + 0.85);
    });
  } catch (e) {
    console.warn("Audio success failed", e);
  }
};

// Play a cinematic luxury brand startup chime (warm filter sweep chord)
export const playIntro = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    // C3, G3, C4, E4, G4, C5 (Full C Major chord for deep warm harmonics)
    const freqs = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Low voices use sawtooth for warmth; high voices use sine for clarity
      osc.type = idx < 2 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Biquad filter: sweeps open from 150Hz to 1200Hz to simulate a swelling pad synth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 1.2);

      // Swell attack: 0 to 0.004 in 1.2s, then slow release to 0 in 3.5s
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.004, now + 1.0);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
 
      osc.start(now);
      osc.stop(now + 3.6);
    });
  } catch (e) {
    console.warn("Audio intro failed", e);
  }
};

// Play a sparkling, ascending crystalline arpeggio when returning to home menu
export const playHomeReturn = () => {
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Sparkling major arpeggio sequence (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      
      gainNode.gain.setValueAtTime(0, now + i * 0.055);
      gainNode.gain.linearRampToValueAtTime(0.006, now + i * 0.055 + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.055 + 0.3);
      
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.35);
    });
  } catch (e) {
    console.warn("Home return audio failed", e);
  }
};
