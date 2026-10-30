import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

export function AuthForm({ kind }: { kind: "login" | "signup" }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await (kind === "login" ? login : signup)(username, password);
      navigate({ to: "/" });
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <form onSubmit={submit} className="panel flex flex-col gap-4 p-6">
        <h1 className="font-display text-2xl text-primary glow">{kind === "login" ? "Log in" : "Sign up"}</h1>
        <input className="field" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} aria-label="Username" />
        <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? "…" : kind === "login" ? "Log in" : "Create account"}</button>
        <p className="text-xs text-muted-foreground">
          {kind === "login" ? <>No account? <Link to="/signup" className="text-accent">Sign up</Link> · demo / demo123</> : <>Have an account? <Link to="/login" className="text-accent">Log in</Link></>}
        </p>
      </form>
    </main>
  );
}
