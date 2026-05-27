import { useState } from "react";
import { C } from "../constants/colors";
import Field from "../components/Field";
import Input from "../components/Input";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ user: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  }

  function submit() {
    const nextErrors = {};
    if (!form.user.trim()) nextErrors.user = "Username is required.";
    if (!form.pass) nextErrors.pass = "Password is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => onLogin(form.user), 500);
  }

  return (
    <main className="login-screen">
      <section className="login-shell">
        <div className="login-visual">
          <img className="login-logo" src="/login page logo edvent.png" alt="EdVent" />
          <div>
            <h1>Plan polished events without losing track of the details.</h1>
            <p>
              EdVent keeps client records, budgets, tasks, vendors, and status updates in one calm workspace.
            </p>
          </div>
        </div>

        <div className="login-panel">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-copy">Sign in to continue managing your event portfolio.</p>

          <Field label="Username" error={errors.user}>
            <Input
              value={form.user}
              onChange={(event) => set("user", event.target.value)}
              placeholder="Enter your username"
              error={errors.user}
            />
          </Field>

          <Field label="Password" error={errors.pass}>
            <div style={{ position: "relative" }}>
              <Input
                value={form.pass}
                onChange={(event) => set("pass", event.target.value)}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                error={errors.pass}
                style={{ paddingRight: 44 }}
                onKeyDown={(event) => event.key === "Enter" && submit()}
              />
              <button
                onClick={() => setShowPass((value) => !value)}
                className="btn btn-ghost"
                style={{ position: "absolute", right: 5, top: 5, minHeight: 30, padding: 7 }}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                <Icon name={showPass ? "eyeOff" : "eye"} size={17} color={C.muted} />
              </button>
            </div>
          </Field>

          {(errors.user || errors.pass) && (
            <div className="chip" style={{ width: "100%", justifyContent: "center", color: C.danger, borderColor: C.dangerLight, background: C.dangerLight, marginBottom: 14 }}>
              {errors.user || errors.pass}
            </div>
          )}

          <Btn
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", minHeight: 44 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </Btn>

          <div className="divider">or continue with</div>

          <div className="social-row">
            {[{ label: "Google", color: "#4285F4" }, { label: "Facebook", color: "#1877F2" }].map((provider) => (
              <button
                key={provider.label}
                className="social-button"
                onClick={() => onLogin(`${provider.label} User`)}
              >
                <span style={{ color: provider.color, fontWeight: 900 }}>{provider.label[0]}</span>
                {provider.label}
              </button>
            ))}
          </div>

          <div className="link-row">
            <button className="text-link">Forgot password</button>
            <button className="text-link" style={{ color: C.navy }}>Create account</button>
          </div>
        </div>
      </section>
    </main>
  );
}
