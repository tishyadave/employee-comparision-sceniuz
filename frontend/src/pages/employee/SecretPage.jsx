import React from "react";
import { useNavigate } from "react-router-dom";
import GridScan from "@/component/GridScan/GridScan";
import TiltedCard from "@/component/TiltedCard/TiltedCard";
import CatchTheCatGame from "@/component/CatchTheCatGame/CatchTheCatGame";

const GithubIcon = ({ size = 16, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const lohithAvatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><defs><linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a" /><stop offset="50%" stop-color="%231e1b4b" /><stop offset="100%" stop-color="%23311042" /></linearGradient><linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2310b981" /><stop offset="100%" stop-color="%2306b6d4" /></linearGradient></defs><rect width="300" height="300" rx="15" fill="url(%23devGrad)" /><circle cx="150" cy="120" r="45" fill="none" stroke="url(%23neonGrad)" stroke-width="3" /><circle cx="150" cy="120" r="35" fill="%23111827" /><path d="M 150 95 L 140 120 L 160 120 Z" fill="url(%23neonGrad)" /><path d="M 90 220 C 90 170, 210 170, 210 220 Z" fill="none" stroke="url(%23neonGrad)" stroke-width="3" /><text x="150" y="260" fill="%23ffffff" font-family="monospace" font-size="16" text-anchor="middle" letter-spacing="1">LOHITH ARYAN S</text><text x="150" y="280" fill="%2310b981" font-family="monospace" font-size="12" text-anchor="middle">LEAD ARCHITECT/DEV</text></svg>`;

const tishyaAvatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><defs><linearGradient id="tishyaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a" /><stop offset="50%" stop-color="%232e1042" /><stop offset="100%" stop-color="%234c0519" /></linearGradient><linearGradient id="neonPinkCyan" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23d946ef" /><stop offset="100%" stop-color="%2306b6d4" /></linearGradient></defs><rect width="300" height="300" rx="15" fill="url(%23tishyaGrad)" /><circle cx="150" cy="120" r="45" fill="none" stroke="url(%23neonPinkCyan)" stroke-width="3" /><circle cx="150" cy="120" r="35" fill="%23111827" /><circle cx="150" cy="120" r="15" fill="url(%23neonPinkCyan)" /><path d="M 90 220 C 90 170, 210 170, 210 220 Z" fill="none" stroke="url(%23neonPinkCyan)" stroke-width="3" /><text x="150" y="260" fill="%23ffffff" font-family="monospace" font-size="16" text-anchor="middle" letter-spacing="1">TISHYA DAVE</text><text x="150" y="280" fill="%23d946ef" font-family="monospace" font-size="12" text-anchor="middle">LEAD ARCHITECT/DEV</text></svg>`;

const aiAvatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><defs><linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a" /><stop offset="50%" stop-color="%23022c22" /><stop offset="100%" stop-color="%23022d42" /></linearGradient><linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%238b5cf6" /><stop offset="100%" stop-color="%23ec4899" /></linearGradient></defs><rect width="300" height="300" rx="15" fill="url(%23aiGrad)" /><polygon points="150,60 210,120 180,180 120,180 90,120" fill="none" stroke="url(%23neonPurple)" stroke-width="3" /><circle cx="150" cy="130" r="25" fill="%23111827" stroke="url(%23neonPurple)" stroke-width="2" /><line x1="150" y1="60" x2="150" y2="105" stroke="url(%23neonPurple)" stroke-width="2" /><line x1="90" y1="120" x2="125" y2="130" stroke="url(%23neonPurple)" stroke-width="2" /><line x1="210" y1="120" x2="175" y2="130" stroke="url(%23neonPurple)" stroke-width="2" /><text x="150" y="260" fill="%23ffffff" font-family="monospace" font-size="16" text-anchor="middle" letter-spacing="1">ANTI GRAVITY</text><text x="150" y="280" fill="%23ec4899" font-family="monospace" font-size="12" text-anchor="middle">PAIR PARTNER</text></svg>`;

export default function SecretPage() {
  const navigate = useNavigate();
  const [caffeineLevels, setCaffeineLevels] = React.useState({
    lohith: 103,
    tishya: 85,
    ai: 150
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCaffeineLevels(prev => ({
        lohith: Math.min(200, Math.max(20, prev.lohith + (Math.random() > 0.5 ? 1 : -1))),
        tishya: Math.min(200, Math.max(20, prev.tishya + (Math.random() > 0.5 ? 1 : -1))),
        ai: Math.min(300, Math.max(50, prev.ai + (Math.random() > 0.5 ? 2 : -2)))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [catIndex, setCatIndex] = React.useState(-1);
  const [catSpeech, setCatSpeech] = React.useState("");
  const [showCatSpeech, setShowCatSpeech] = React.useState(false);

  const catQuotes = [
    "prrr you found me !!!",
    "Start with what is right rather than what is acceptable.",
    "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    "The happiness of your life depends upon the quality of your thoughts.",
    "He who has a why to live can bear almost any how.",
    "The strongest developers are forged in failed deployments.",
    "Five clicks brought you here. Curiosity will take you farther.",
    "*glances grumpily* Hmph... you again.",
    "Meow.",
    "I used to guard treasure. Now I guard developer profiles.",
    "You clicked the cat five times. HR has concerns."
  ];

  const [gamePlayed, setGamePlayed] = React.useState(false);
  const [catInteracted, setCatInteracted] = React.useState(false);

  const handleCatClick = () => {
    setCatIndex(prev => {
      const next = prev === -1 ? 0 : (prev + 1) % catQuotes.length;
      setCatSpeech(catQuotes[next]);
      setShowCatSpeech(true);
      return next;
    });
    setCatInteracted(true);
  };

  const [isGameActive, setIsGameActive] = React.useState(false);
  const eggsFound = (gamePlayed ? 1 : 0) + (catInteracted ? 1 : 0);

  return (
    <div style={{
      position: "relative", minHeight: "100vh", color: "#ffffff",
      fontFamily: "Outfit, sans-serif", padding: "40px 20px", boxSizing: "border-box",
      overflow: "hidden", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between", backgroundColor: "#020202"
    }}>
      {/* Matrix GridScan background layer */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", opacity: 0.85 }}>
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#0d2e1b"
          gridScale={0.1}
          scanColor="#10b981"
          scanOpacity={0.45}
          enablePost
          bloomIntensity={0.7}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>

      {/* Header Container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '20px 0 40px' }}>
        <h1 style={{
          fontSize: '38px', color: '#10b981', margin: 0, fontWeight: 'normal',
          letterSpacing: '3px', textShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
          fontFamily: 'monospace'
        }}>
          DEVELOPER'S HIDEOUT
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: '8px 0 0', fontWeight: 'normal', fontFamily: 'monospace' }}>
          Authorized personnel only. Encrypted credits log.
        </p>
      </div>

      {/* Tilted Cards Row */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center",
        alignItems: "center", width: "100%", maxWidth: "900px", flex: 1, margin: "20px 0"
      }}>
        {/* Card 1: Lohith Aryan S */}
        <TiltedCard
          imageSrc="/lohith_avatar.png"
          altText="Lohith Aryan S"
          captionText={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '12px' }}>LOHITH ARYAN S</div>
              <div style={{ color: '#ffffff', opacity: 0.9 }}>Lead Architect / Dev</div>
              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', margin: '4px 0' }} />
              <div><span style={{ color: '#10b981' }}>Skills:</span> React, Node.js, Express, PostgreSQL, Prisma, Neon</div>
              <div><span style={{ color: '#10b981' }}>Caffeine:</span> {caffeineLevels.lohith}%</div>
            </div>
          }
          containerHeight="320px"
          containerWidth="300px"
          imageHeight="280px"
          imageWidth="280px"
          rotateAmplitude={12}
          scaleOnHover={1.12}
          showMobileWarning={false}
          showTooltip={true}
          glowColor="rgba(16, 185, 129, 0.4)"
          displayOverlayContent={true}
          overlayContent={
            <div style={{
              position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
              padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)', border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#ffffff', fontFamily: 'monospace', fontSize: '11px', textAlign: 'center',
              width: 'max-content', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>LOHITH ARYAN S</span>
              <a 
                href="https://github.com/lohith-Aryanxdata" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <GithubIcon size={13} />
              </a>
            </div>
          }
        />

        {/* Card 2: Tishya Dave */}
        <TiltedCard
          imageSrc="/tishya_avatar.png"
          altText="Tishya Dave"
          captionText={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: '#d946ef', fontSize: '12px' }}>TISHYA DAVE</div>
              <div style={{ color: '#ffffff', opacity: 0.9 }}>Lead Architect / Dev</div>
              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', margin: '4px 0' }} />
              <div><span style={{ color: '#d946ef' }}>Skills:</span> UI/UX Design, React, Tailwind, Framer Motion, Neon</div>
              <div><span style={{ color: '#d946ef' }}>Caffeine:</span> {caffeineLevels.tishya}%</div>
            </div>
          }
          containerHeight="320px"
          containerWidth="300px"
          imageHeight="280px"
          imageWidth="280px"
          rotateAmplitude={12}
          scaleOnHover={1.12}
          showMobileWarning={false}
          showTooltip={true}
          glowColor="rgba(217, 70, 239, 0.4)"
          objectFit="cover"
          displayOverlayContent={true}
          overlayContent={
            <div style={{
              position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
              padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)', border: '1px solid rgba(217, 70, 239, 0.4)',
              color: '#ffffff', fontFamily: 'monospace', fontSize: '11px', textAlign: 'center',
              width: 'max-content', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <span style={{ color: '#d946ef', fontWeight: 'bold' }}>TISHYA DAVE</span>
              <span style={{ color: '#d946ef', display: 'inline-flex', alignItems: 'center', opacity: 0.8 }}>
                <GithubIcon size={13} />
              </span>
            </div>
          }
        />

        {/* Card 3: Anti Gravity */}
        <div onClick={() => setIsGameActive(true)} style={{ cursor: 'pointer' }}>
          <TiltedCard
            imageSrc={aiAvatarSvg}
            altText="Anti Gravity"
            captionText={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', color: '#ec4899', fontSize: '12px' }}>ANTI GRAVITY</div>
                <div style={{ color: '#ffffff', opacity: 0.9 }}>Pair Partner</div>
                <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', margin: '4px 0' }} />
                <div><span style={{ color: '#ec4899' }}>Skills:</span> AI Planning, Agentic Coding, Verification</div>
                <div><span style={{ color: '#ec4899' }}>Caffeine:</span> {caffeineLevels.ai}%</div>
              </div>
            }
            containerHeight="320px"
            containerWidth="300px"
            imageHeight="280px"
            imageWidth="280px"
            rotateAmplitude={12}
            scaleOnHover={1.12}
            showMobileWarning={false}
            showTooltip={true}
            glowColor="rgba(236, 72, 153, 0.4)"
            displayOverlayContent={true}
            overlayContent={
              <div style={{
                position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)', border: '1px solid rgba(236, 72, 153, 0.4)',
                color: '#ffffff', fontFamily: 'monospace', fontSize: '11px', textAlign: 'center',
                width: 'max-content', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <span style={{ color: '#ec4899', fontWeight: 'bold' }}>ANTI GRAVITY</span>
                <a 
                  href="https://github.com/google-deepmind" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: '#ec4899', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <GithubIcon size={13} />
                </a>
              </div>
            }
          />
        </div>
      </div>

      {/* Exit Button */}
      <button 
        onClick={() => navigate("/dashboard")}
        style={{
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "8px",
          color: "#10b981",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "14px",
          padding: "10px 24px",
          marginTop: "30px",
          transition: "all 0.2s ease-in-out",
          boxShadow: "0 0 10px rgba(16, 185, 129, 0.1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.05)";
          e.currentTarget.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.1)";
        }}
      >
        [ EXIT_TO_DASHBOARD ]
      </button>

      {/* Tiny Cat Easter Egg */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}>
        {showCatSpeech && (
          <div style={{
            backgroundColor: 'rgba(15, 18, 23, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#ffffff',
            fontSize: '12px',
            marginBottom: '8px',
            maxWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            position: 'relative',
            whiteSpace: 'pre-line'
          }}>
            {catSpeech}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '20px',
              width: '10px',
              height: '10px',
              backgroundColor: 'rgba(15, 18, 23, 0.95)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
              borderRight: '1px solid rgba(16, 185, 129, 0.4)',
              transform: 'rotate(45deg)'
            }} />
          </div>
        )}
        <button
          onClick={handleCatClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#ffffff',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <pre style={{ margin: 0, lineHeight: 1.1, fontFamily: 'monospace' }}>
{`  /\\_/\\
 ( o.o )
  > ^ <`}
          </pre>
        </button>
      </div>

      {isGameActive && (
        <CatchTheCatGame onGameFinished={(finalScore) => {
          setIsGameActive(false);
          setGamePlayed(true);
        }} />
      )}

      {/* Dynamic Island */}
      {eggsFound > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '24px',
          padding: '8px 20px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 999,
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <span>🥚</span>
          <span>Easter Eggs Found:</span>
          <span style={{ 
            color: eggsFound === 2 ? '#10b981' : '#ff9ffc', 
            fontWeight: 'bold',
            textShadow: eggsFound === 2 ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
          }}>
            {eggsFound}/2
          </span>
          {eggsFound === 2 && (
            <span style={{ color: '#10b981', fontSize: '11px', marginLeft: '6px' }}>
              [ COMPLETE! ]
            </span>
          )}
        </div>
      )}
    </div>
  );
}
