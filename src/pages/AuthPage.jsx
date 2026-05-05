import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({
    penName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const destination = useMemo(() => location.state?.from ?? "/", [location.state]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp(form);
        if (!result.session) {
          setNotice("Confirmation email bhej di gayi hai. Verify karke phir mehfil mein aa jaiye.");
          return;
        }
      } else {
        await signIn(form.email, form.password);
      }

      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mahfil-card w-full max-w-lg overflow-hidden">
        <div className="border-b border-surface-border px-6 py-6">
          <p className="mahfil-pill border-primary/20 bg-primary/10 text-primary">Mahfil</p>
          <h1 className="mt-4 font-poetry text-4xl">Dil se likhne walon ki jagah.</h1>
          <p className="mt-3 text-sm leading-7 text-text-soft">
            Supabase Auth ke saath secure sign in, apna pen name, aur AI-powered mehfil tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="inline-flex rounded-full border border-surface-border bg-surface-soft p-1">
            {["signup", "signin"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  mode === value ? "bg-primary text-white" : "text-text-soft"
                }`}
              >
                {value === "signup" ? "Nayi Mehfil" : "Wapas Aaiye"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-soft">
                Pen Name
              </span>
              <input
                required
                className="surface-input"
                value={form.penName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, penName: event.target.value }))
                }
                placeholder="Ghalib Modern"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-soft">
              Email
            </span>
            <input
              required
              type="email"
              className="surface-input"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="aap@mahfil.app"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-soft">
              Password
            </span>
            <input
              required
              type="password"
              className="surface-input"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Kam az kam 6 characters"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
              {notice}
            </div>
          ) : null}

          <Button className="w-full" size="lg" disabled={loading}>
            {loading
              ? "Thodi der..."
              : mode === "signup"
                ? "Mahfil Join Karein"
                : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
