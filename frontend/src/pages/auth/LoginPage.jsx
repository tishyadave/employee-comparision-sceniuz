import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SplitText from "@/components/SplitText";
import Prism from "@/components/Prism";
import styles from "./LoginPage.module.css";
import BorderGlow from "@/component/BorderGlow/BorderGlow";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Greeting cycle
  const greetings = [
    "Nice to See You Again",
    "Your Experience Starts Here",
    "Ready to Roll?",
    "Good to See You",
  ];
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setGreetingIndex(i => (i + 1) % greetings.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setSuccess(true);
      // Store user role for later navigation
      setUserRole(user.role);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigate after showing toast
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        navigate(userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard", { replace: true });
        setSuccess(false);
        setUserRole(null);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [success, userRole, navigate]);

  return (
    <div className={styles.page}>
      {/* Animated background */}
      <div className={styles.prismContainer}>
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          glow={1}
          noise={0.5}
          transparent={true}
        />
      </div>

      {/* Centered layout column */}
      <div className={styles.centerCol}>
        {/* Greeting — above card, centered */}
        <div className={styles.greetingWrap}>
          <SplitText
            key={greetingIndex}
            text={greetings[greetingIndex]}
            delay={80}
            duration={0.55}
            splitType="words"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
            className={styles.welcome}
          />
        </div>

        {/* Card */}
        <div className={styles.card}>
          <h2 className={styles.title}>Enter your details to proceed further</h2>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Email field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.asterisk}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.asterisk}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  style={{ paddingRight: "3rem" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className={styles.toggleBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (<p className={styles.error}>{error}</p>)}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {success && (
            <>
              <style>{`\n                @keyframes slideInUp {\n                  0% { opacity: 0; transform: translateY(40px) scale(0.9); }\n                  100% { opacity: 1; transform: translateY(0) scale(1); }\n                }\n              `}</style>
              <div style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                zIndex: 99999,
                animation: "slideInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
              }}>
                <BorderGlow
                  animated={true}
                  glowColor="270 90 60"
                  backgroundColor="rgba(10, 10, 16, 0.95)"
                  borderRadius={999}
                  glowRadius={15}
                  glowIntensity={1.0}
                  coneSpread={30}
                  colors={["#a855f7", "#6366f1", "#ec4899"]}
                  fillOpacity={0.4}
                >
                  <div style={{
                    padding: "10px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    whiteSpace: "nowrap"
                  }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      boxShadow: "0 0 8px #22c55e",
                      display: "inline-block"
                    }} />
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      letterSpacing: "0.2px",
                      textShadow: "0 0 8px rgba(168, 85, 247, 0.4)"
                    }}>
                      Knock Knock... You're In.
                    </span>
                  </div>
                </BorderGlow>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}