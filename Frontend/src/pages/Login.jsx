import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";

const Login = () => {
  const { login }    = useAuth();
  const location     = useLocation();

  // ✅ Pick up state passed from the register success redirect
  const fromRegister = location.state?.message || "";
  const prefillEmail = location.state?.email   || "";

  const [form, setForm]         = useState({ email: prefillEmail, password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Both fields are required."); return; }

    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(form);
      // ✅ login() now calls navigate("/dashboard") internally — see AuthContext fix
      login(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[400px] bg-amber/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-8">
          <span className="font-mono text-amber font-bold text-2xl tracking-tighter">TTM</span>
          <h1 className="mt-3 text-2xl font-mono font-bold text-text tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-dim">Access your team workspace</p>
        </div>

        <div className="card p-6">
          {/* ✅ Success banner shown when arriving from /register */}
          {fromRegister && !error && (
            <div className="mb-4 flex items-start gap-2 bg-success/10 border border-success/20
                            text-success text-xs font-mono px-3 py-2.5 rounded">
              <CheckCircle size={13} className="mt-0.5 shrink-0" />
              <span>{fromRegister}</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-danger/10 border border-danger/20
                            text-danger text-xs font-mono px-3 py-2.5 rounded">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className="field" placeholder="you@company.com" autoComplete="email"
                // ✅ Only autofocus email if it's NOT pre-filled (password is next step)
                autoFocus={!prefillEmail}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} name="password"
                  value={form.password} onChange={handleChange}
                  className="field pr-10" placeholder="••••••••"
                  autoComplete="current-password"
                  // ✅ Autofocus password when email is pre-filled from register
                  autoFocus={!!prefillEmail}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-text transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-canvas/40 border-t-canvas rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-dim font-mono">
          No account?{" "}
          <Link to="/register" className="text-amber hover:text-amber-glow transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
