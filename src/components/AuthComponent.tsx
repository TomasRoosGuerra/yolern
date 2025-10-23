import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';

export function AuthComponent() {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnonymousSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await authService.signInAnonymously();
    } catch (err) {
      setError('Failed to sign in anonymously');
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
      setError('');
      
      if (isSignUp) {
        await authService.signUpWithEmail(email, password);
      } else {
        await authService.signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (state.isAuthenticated) {
    return (
      <div className="auth-component">
        <div className="user-info">
          <span className="user-name">
            {authService.getUserDisplayName()}
            {authService.isAnonymous() && ' (Guest)'}
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
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            className="anonymous-btn"
          >
            {isLoading ? 'Signing in...' : 'Continue as Guest'}
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
                {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
              
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="toggle-mode-btn"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
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
        
        .anonymous-btn {
          background: #007AFF;
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
          background: #0056CC;
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
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #E5E5E7;
        }
        
        .divider span {
          background: white;
          padding: 0 1rem;
          color: #8E8E93;
          font-size: 0.9rem;
        }
        
        .email-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .email-form input {
          padding: 12px 16px;
          border: 1px solid #E5E5E7;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .email-form input:focus {
          outline: none;
          border-color: #007AFF;
        }
        
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .auth-btn {
          background: #34C759;
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
          background: #28A745;
        }
        
        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .toggle-mode-btn {
          background: none;
          border: none;
          color: #007AFF;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
        }
        
        .toggle-mode-btn:hover {
          color: #0056CC;
        }
        
        .error-message {
          background: #FF3B30;
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
          background: #FF3B30;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .sign-out-btn:hover:not(:disabled) {
          background: #D70015;
        }
        
        .sign-out-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
