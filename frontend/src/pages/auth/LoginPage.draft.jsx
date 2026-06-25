import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SplitText from "@/components/SplitText";
import Prism from "@/components/Prism";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => {
        navigate(
          user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
          { replace: true }
        );
      }, 1000);
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

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {success && (
            <p className={styles.toast}>Everything's ready. Jump in!</p>
          )}
        </div>
      </div>
    </div>
  );
}