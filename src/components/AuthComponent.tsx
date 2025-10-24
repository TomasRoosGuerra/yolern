import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";

export function AuthComponent() {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await authService.signInAnonymously();
    } catch (err) {
      setError("Failed to sign in anonymously");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      setError("");

      if (isSignUp) {
        await authService.signUpWithEmail(email, password);
      } else {
        await authService.signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (state.isAuthenticated) {
    return (
      <div className="auth-component">
        <div className="user-info">
          <span className="user-name">
            {authService.getUserDisplayName()}
            {authService.isAnonymous() && " (Guest)"}
          </span>
          <button
            onClick={handleSignOut}
            className="sign-out-btn"
            disabled={isLoading}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-component">
      <div className="auth-container">
        <h3>Welcome to Yolern</h3>
        <p>Sign in to sync your learning progress across devices</p>

        <div className="auth-options">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="google-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            className="anonymous-btn"
          >
            {isLoading ? "Signing in..." : "Continue as Guest"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleEmailAuth} className="email-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="form-actions">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="auth-btn"
              >
                {isLoading
                  ? "Please wait..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="toggle-mode-btn"
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Need an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx>{`
        .auth-component {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .auth-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 90%;
        }

        .auth-container h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          text-align: center;
        }

        .auth-container p {
          margin: 0 0 2rem 0;
          color: #666;
          text-align: center;
          font-size: 0.9rem;
        }

        .auth-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .google-btn {
          background: white;
          color: #333;
          border: 1px solid #dadce0;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .google-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #c1c7cd;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .anonymous-btn {
          background: #007aff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .anonymous-btn:hover:not(:disabled) {
          background: #0056cc;
        }

        .anonymous-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 0.5rem 0;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e5e7;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          color: #8e8e93;
          font-size: 0.9rem;
        }

        .email-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .email-form input {
          padding: 12px 16px;
          border: 1px solid #e5e5e7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .email-form input:focus {
          outline: none;
          border-color: #007aff;
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .auth-btn {
          background: #34c759;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .auth-btn:hover:not(:disabled) {
          background: #28a745;
        }

        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .toggle-mode-btn {
          background: none;
          border: none;
          color: #007aff;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
        }

        .toggle-mode-btn:hover {
          color: #0056cc;
        }

        .error-message {
          background: #ff3b30;
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-name {
          font-weight: 500;
          color: #333;
        }

        .sign-out-btn {
          background: #ff3b30;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .sign-out-btn:hover:not(:disabled) {
          background: #d70015;
        }

        .sign-out-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
