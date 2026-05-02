/**
 * Register Page
 *
 * - Calls POST /api/auth/register
 * - On success: stores token + user, navigates to /dashboard
 * - Role selector lets testers create ADMIN accounts during development
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";

const Register = () => {
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "MEMBER",
  });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setError("");
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())               errs.name     = "Name is required.";
    if (!form.email.trim())              errs.email    = "Email is required.";
    if (form.password.length < 6)        errs.password = "Min 6 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");

    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
    } catch (err) {
      // Handle express-validator array errors or single message
      const serverErr = err.response?.data;
      if (serverErr?.errors?.length) {
        setError(serverErr.errors.map((e) => e.msg).join(" · "));
      } else {
        setError(serverErr?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const pwStrength = form.password.length === 0
    ? null
    : form.password.length < 6   ? "weak"
    : form.password.length < 10  ? "fair"
    : "strong";

  const strengthConfig = {
    weak:   { label: "Weak",   color: "bg-danger",  w: "w-1/3" },
    fair:   { label: "Fair",   color: "bg-amber",   w: "w-2/3" },
    strong: { label: "Strong", color: "bg-success", w: "w-full" },
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[400px] bg-amber/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">

        {/* Header */}
        <div className="mb-8">
          <span className="font-mono text-amber font-bold text-2xl tracking-tighter">TTM</span>
          <h1 className="mt-3 text-2xl font-mono font-bold text-text tracking-tight">
            Create account
          </h1>
          <p className="mt-1 text-sm text-dim">Join your team workspace</p>
        </div>

        <div className="card p-6">
          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-danger/10 border border-danger/20
                            text-danger text-xs font-mono px-3 py-2.5 rounded">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`field ${fieldErrors.name ? "border-danger" : ""}`}
                placeholder="Jane Smith"
                autoComplete="name"
                autoFocus
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-danger font-mono">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`field ${fieldErrors.email ? "border-danger" : ""}`}
                placeholder="you@company.com"
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-danger font-mono">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`field pr-10 ${fieldErrors.password ? "border-danger" : ""}`}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwStrength && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300
                                    ${strengthConfig[pwStrength].color}
                                    ${strengthConfig[pwStrength].w}`} />
                  </div>
                  <span className="text-[10px] font-mono text-dim">
                    {strengthConfig[pwStrength].label}
                  </span>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-danger font-mono">{fieldErrors.password}</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["MEMBER", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-mono
                                transition-all duration-150
                                ${form.role === r
                                  ? "border-amber text-amber bg-amber/10"
                                  : "border-border text-dim hover:border-muted"}`}
                  >
                    {form.role === r && <CheckCircle size={11} />}
                    {r}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-dim font-mono">
                ADMIN can create projects &amp; assign tasks
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-canvas/40 border-t-canvas
                                   rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-xs text-dim font-mono">
          Already have an account?{" "}
          <Link to="/login" className="text-amber hover:text-amber-glow transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;