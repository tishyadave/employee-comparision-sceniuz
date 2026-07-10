import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// Synthesize cute cat meow using Web Audio API (no assets needed)
const playMeowSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.quadraticCurveTo(800, now + 0.08, 650, now + 0.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.type = 'triangle';
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.warn("AudioContext block by browser autoplay policy");
  }
};

// Synthesize whoosh sound using Web Audio API
const playWhooshSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.type = 'sine';
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Ignore autoplay errors
  }
};

// Vector SVGs converted to data URLs for Phaser textures
const catSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="12,24 24,10 24,24" fill="#ffffff" />
  <polygon points="16,22 22,14 22,22" fill="#ff9ffc" />
  <polygon points="52,24 40,10 40,24" fill="#ffffff" />
  <polygon points="48,22 42,14 42,22" fill="#ff9ffc" />
  <circle cx="32" cy="34" r="20" fill="#ffffff" />
  <circle cx="24" cy="30" r="3.5" fill="#1e293b" />
  <circle cx="23" cy="29" r="1.2" fill="#ffffff" />
  <circle cx="40" cy="30" r="3.5" fill="#1e293b" />
  <circle cx="39" cy="29" r="1.2" fill="#ffffff" />
  <circle cx="20" cy="35" r="3" fill="#ff9ffc" opacity="0.6" />
  <circle cx="44" cy="35" r="3" fill="#ff9ffc" opacity="0.6" />
  <polygon points="32,36 30,34 34,34" fill="#ff9ffc" />
  <path d="M30,39 Q32,41 32,39 Q32,41 34,39" stroke="#1e293b" stroke-width="1.5" fill="none" />
</svg>`;
const catDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(catSvg);

const pawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <path d="M16,14 C12,14 10,18 10,22 C10,26 13,28 16,28 C19,28 22,26 22,22 C22,18 20,14 16,14 Z" fill="rgba(255, 255, 255, 0.45)" />
  <circle cx="9" cy="12" r="3" fill="rgba(255, 255, 255, 0.45)" />
  <circle cx="14" cy="7" r="3.2" fill="rgba(255, 255, 255, 0.45)" />
  <circle cx="20" cy="7" r="3.2" fill="rgba(255, 255, 255, 0.45)" />
  <circle cx="25" cy="12" r="3" fill="rgba(255, 255, 255, 0.45)" />
</svg>`;
const pawDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(pawSvg);

const fishSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <path d="M6,16 C10,10 22,10 26,16 C22,22 10,22 6,16 Z" fill="#ff9ffc" />
  <polygon points="24,16 30,12 30,20" fill="#ff9ffc" />
  <circle cx="10" cy="14" r="1.5" fill="#1e293b" />
</svg>`;
const fishDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(fishSvg);

export default function CatchTheCatGame({ onGameFinished }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  
  const [gameState, setGameState] = useState('intro'); // intro, playing, gameover
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const scoreRef = useRef(0);
  const teleportTimerRef = useRef(null);

  // Countdown logic
  useEffect(() => {
    if (gameState !== 'intro') return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setGameState('playing');
    }
  }, [countdown, gameState]);

  // Main playing timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setGameState('gameover');
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    }
  }, [timeLeft, gameState]);

  // Launch Phaser Game
  useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current) return;

    let gameInstance = null;

    // Use a small timeout to let React layout and paint the container
    const layoutTimer = setTimeout(() => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.clientWidth || 800;
      const parentHeight = containerRef.current.clientHeight || 500;

      class GameScene extends Phaser.Scene {
        constructor() {
          super('GameScene');
          this.assetsLoaded = false;
        }

        init() {
          // Load textures asynchronously using HTML Image elements to bypass XHR fetch CORS errors in Phaser loader
          const assets = [
            { key: 'cat', url: catDataUrl },
            { key: 'paw', url: pawDataUrl },
            { key: 'fish', url: fishDataUrl }
          ];

          let loadedCount = 0;
          assets.forEach(asset => {
            const img = new Image();
            img.onload = () => {
              if (this.textures) {
                this.textures.addImage(asset.key, img);
              }
              loadedCount++;
              if (loadedCount === assets.length) {
                this.assetsLoaded = true;
                this.onAssetsLoaded();
              }
            };
            img.src = asset.url;
          });
        }

        create() {
          // Background color
          this.cameras.main.setBackgroundColor('#0b0b16');

          // Create slow drifting stars/particles
          this.particles = [];
          for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, parentWidth);
            const y = Phaser.Math.Between(0, parentHeight);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.6));
            this.particles.push({
              el: star,
              speed: Phaser.Math.FloatBetween(0.2, 0.7)
            });
          }

          // Click on background event (miss)
          this.input.on('pointerdown', (pointer) => {
            if (!this.assetsLoaded || !this.cat) return;
            const catBounds = this.cat.getBounds();
            if (catBounds.contains(pointer.x, pointer.y)) return;
            this.missCat(pointer);
          });
        }

        update() {
          // Drift background stars
          for (let p of this.particles) {
            p.el.y += p.speed;
            if (p.el.y > parentHeight) {
              p.el.y = 0;
              p.el.x = Phaser.Math.Between(0, parentWidth);
            }
          }
        }

        onAssetsLoaded() {
          if (!this.sys || !this.sys.isActive()) return;

          // Add cat element
          this.cat = this.add.image(parentWidth / 2, parentHeight / 2, 'cat');
          this.cat.setInteractive();
          this.cat.setScale(0.85);

          // Click on cat event
          this.cat.on('pointerdown', (pointer) => {
            this.catchCat(pointer);
          });

          // Set initial movement timer
          this.scheduleTeleport();
        }

        scheduleTeleport() {
          if (teleportTimerRef.current) clearTimeout(teleportTimerRef.current);
          
          const currentScore = scoreRef.current;
          const interval = Math.max(450, 1500 - (Math.floor(currentScore / 5) * 150));

          teleportTimerRef.current = setTimeout(() => {
            this.teleportCat();
          }, interval);
        }

        teleportCat() {
          if (!this.cat || !this.sys || !this.sys.isActive()) return;

          // Animate exit tween
          this.tweens.add({
            targets: this.cat,
            scale: 0,
            duration: 100,
            onComplete: () => {
              if (!this.cat || !this.sys || !this.sys.isActive()) return;
              
              const rx = Phaser.Math.Between(40, parentWidth - 40);
              const ry = Phaser.Math.Between(40, parentHeight - 40);
              this.cat.setPosition(rx, ry);
              
              this.tweens.add({
                targets: this.cat,
                scale: 0.85,
                duration: 120
              });
              
              this.scheduleTeleport();
            }
          });
        }

        catchCat(pointer) {
          playMeowSound();

          // Increment score
          scoreRef.current += 1;
          setScore(scoreRef.current);

          // Spawn floating fish particle
          const fishIcon = this.add.image(pointer.x, pointer.y - 20, 'fish').setScale(0.7);
          const fishText = this.add.text(pointer.x + 12, pointer.y - 30, '+1 🐟', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ff9ffc',
            fontWeight: 'bold'
          });

          // Floating upward tween for catches
          this.tweens.add({
            targets: [fishIcon, fishText],
            y: pointer.y - 70,
            alpha: 0,
            duration: 600,
            onComplete: () => {
              fishIcon.destroy();
              fishText.destroy();
            }
          });

          // Teleport cat instantly
          this.teleportCat();
        }

        missCat(pointer) {
          playWhooshSound();

          // Spawn paw print at mouse click spot
          const paw = this.add.image(pointer.x, pointer.y, 'paw').setScale(0.8).setAlpha(0.7);

          // Fade out tween
          this.tweens.add({
            targets: paw,
            alpha: 0,
            scale: 0.4,
            duration: 500,
            onComplete: () => paw.destroy()
          });
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: parentWidth,
        height: parentHeight,
        parent: containerRef.current,
        transparent: true,
        scene: [GameScene],
        physics: {
          default: 'arcade'
        }
      };

      gameInstance = new Phaser.Game(config);
      gameRef.current = gameInstance;
    }, 100);

    return () => {
      clearTimeout(layoutTimer);
      if (gameInstance) {
        gameInstance.destroy(true);
        if (gameRef.current === gameInstance) {
          gameRef.current = null;
        }
      }
      if (teleportTimerRef.current) {
        clearTimeout(teleportTimerRef.current);
      }
    };
  }, [gameState]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (teleportTimerRef.current) clearTimeout(teleportTimerRef.current);
    };
  }, []);

  const getEndMessage = (s) => {
    if (s <= 5) return "The cat wasn't even trying.";
    if (s <= 10) return "Not bad, Curious Human.";
    if (s <= 20) return "The cat is impressed.";
    if (s <= 30) return "Cat Whisperer.";
    return "Impossible... are you secretly a cat?";
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(5, 5, 10, 0.92)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'monospace'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '560px',
        backgroundColor: '#0c0c16',
        borderRadius: '16px',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* TOP HUD ROW */}
        {gameState === 'playing' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10
          }}>
            <div style={{ color: '#ff9ffc', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🐟 Score: <span style={{ color: '#ffffff' }}>{score}</span>
            </div>
            <div style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⏱ Time: <span style={{ color: '#ffffff' }}>{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* PHASER GAME CONTAINER */}
        <div 
          ref={containerRef} 
          style={{ 
            flex: 1, 
            width: '100%', 
            height: '100%',
            position: 'relative',
            cursor: 'crosshair'
          }} 
        />

        {/* INTRO COUNTDOWN OVERLAY */}
        {gameState === 'intro' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0c0c16',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            zIndex: 20
          }}>
            <h2 style={{ color: '#10b981', fontSize: '28px', margin: 0 }}>🐈 Catch the Cat</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: 0 }}>
              "Think you're fast enough, Curious Human?"
            </p>
            <div style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ff9ffc',
              textShadow: '0 0 20px rgba(255, 159, 252, 0.5)',
              transform: 'scale(1.2)',
              transition: 'transform 0.5s ease-in-out'
            }}>
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        )}

        {/* END SCREEN OVERLAY */}
        {gameState === 'gameover' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(12, 12, 22, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            zIndex: 20,
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff9ffc', fontSize: '32px', margin: 0, textShadow: '0 0 15px rgba(255,159,252,0.4)' }}>🐈 Game Over</h2>
            
            <div style={{ fontSize: '20px', color: '#ffffff' }}>
              Fish Collected: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{score}</span>
            </div>

            <p style={{
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '16px',
              maxWidth: '400px',
              lineHeight: '1.5',
              margin: '10px 0'
            }}>
              "{getEndMessage(score)}"
            </p>

            <button
              onClick={() => onGameFinished(score)}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.6)',
                color: '#10b981',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.1)';
              }}
            >
              Return to the Developer Hideout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
