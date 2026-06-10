import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, Mail, Key, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from './data';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

type AuthMode = 'signin' | 'signup' | 'forgot';

export const isUserAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmails = [
    'karanph@tuljaigroup.com',
    'admin@tuljaigroup.com',
    'admin@test.com',
    'admin@nest.com',
    'admin@nestbahaeti.com'
  ];
  return adminEmails.includes(email.toLowerCase());
};


export default function Login({ onLogin, onBack }: { onLogin: (u: User) => void, onBack: () => void }) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let userData: User;
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        userData = {
          id: user.uid,
          name: data.displayName || user.displayName || 'User',
          email: user.email || '',
          roleId: data.role === 'admin' ? 'r_admin' : 
                  data.role === 'director' ? 'r_dir' : 
                  data.role === 'advisor' ? 'r_adv' : 
                  data.role === 'developer' ? 'r_developer' : 'r_buyer',
          status: 'active'
        };
      } else {
        const isAdmin = isUserAdmin(user.email);
        const role = isAdmin ? 'admin' : 'buyer';
        
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role,
          createdAt: serverTimestamp()
        });
        
        userData = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          roleId: isAdmin ? 'r_admin' : 'r_buyer',
          status: 'active'
        };
      }
      
      onLogin(userData);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        setErrorMsg("Failed to log in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const finalPassword = password.length < 6 ? password.padEnd(6, '0') : password;
    const isAdminEmail = isUserAdmin(email);

    try {
      if (authMode === 'signin') {
        try {
          const result = await signInWithEmailAndPassword(auth, email, finalPassword);
          const user = result.user;

          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let userData: User;

          if (userSnap.exists()) {
            const data = userSnap.data();
            userData = {
              id: user.uid,
              name: data.displayName || user.displayName || 'User',
              email: user.email || '',
              roleId: data.role === 'admin' ? 'r_admin' : 
                      data.role === 'director' ? 'r_dir' : 
                      data.role === 'advisor' ? 'r_adv' : 
                      data.role === 'developer' ? 'r_developer' : 'r_buyer',
              status: 'active'
            };
          } else {
            // Fallback provisioning if document was missed
            const isAdmin = isAdminEmail;
            const role = isAdmin ? 'admin' : 'buyer';

            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              role: role,
              createdAt: serverTimestamp()
            });

            userData = {
              id: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              roleId: isAdmin ? 'r_admin' : 'r_buyer',
              status: 'active'
            };
          }

          onLogin(userData);
        } catch (error: any) {
          // Auto-provision admin user if they don't exist yet!
          if (isAdminEmail && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials')) {
            try {
              const result = await createUserWithEmailAndPassword(auth, email, finalPassword);
              const user = result.user;

              await updateProfile(user, { displayName: 'Admin User' });

              const userRef = doc(db, 'users', user.uid);
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: 'Admin User',
                role: 'admin',
                createdAt: serverTimestamp()
              });

              const userData: User = {
                id: user.uid,
                name: 'Admin User',
                email: user.email || '',
                roleId: 'r_admin',
                status: 'active'
              };

              onLogin(userData);
              return;
            } catch (signupError: any) {
              if (signupError.code === 'auth/email-already-in-use') {
                throw new Error("Incorrect password for admin account.");
              }
              throw signupError;
            }
          }
          throw error;
        }
      } else if (authMode === 'signup') {
        if (!displayName.trim()) {
          throw new Error("Display Name is required.");
        }

        const result = await createUserWithEmailAndPassword(auth, email, finalPassword);
        const user = result.user;

        await updateProfile(user, { displayName });

        const userRef = doc(db, 'users', user.uid);
        const isAdmin = isAdminEmail;
        const role = isAdmin ? 'admin' : 'buyer';

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: role,
          createdAt: serverTimestamp()
        });

        const userData: User = {
          id: user.uid,
          name: displayName,
          email: user.email || '',
          roleId: isAdmin ? 'r_admin' : 'r_buyer',
          status: 'active'
        };

        onLogin(userData);
      } else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("Password reset email sent! Please check your inbox.");
        setEmail('');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let friendlyMessage = error.message || "An authentication error occurred.";
      
      if (error.code === 'auth/user-not-found') {
        friendlyMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        friendlyMessage = "Incorrect password.";
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "An account already exists with this email.";
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Invalid email format.";
      }
      
      setErrorMsg(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (authMode === 'signin') return "Private Access";
    if (authMode === 'signup') return "Create Account";
    return "Reset Password";
  };

  const getDescription = () => {
    if (authMode === 'signin') return "Authenticate to access your personalized dashboard and exclusive member benefits.";
    if (authMode === 'signup') return "Sign up as a Buyer to view specifications, stack plans, and upload contract documents.";
    return "Enter your email address and we'll send you a link to reset your account password.";
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink flex selection:bg-brand-accent selection:text-brand-ink">
      {/* Left Side: Cinematic Visual */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-bg/20 z-10 mix-blend-multiply"></div>
        <motion.img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Luxury Real Estate" 
          className="w-full h-full object-cover grayscale"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h2 className="font-serif text-5xl text-white mb-4">My Nest</h2>
          <p className="text-white/70 text-sm uppercase tracking-widest font-medium">By Baheti Housing</p>
        </div>
      </div>

      {/* Right Side: Authentication Panel */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-brand-bg overflow-y-auto">
        <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-ink/60 hover:text-brand-accent transition-colors z-10">
          <ArrowLeft size={16} /> Back to Portal
        </button>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 my-12">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm space-y-8"
          >
            <div>
              <ShieldCheck size={40} className="text-brand-accent mb-6" />
              <h1 className="font-serif text-4xl mb-3 text-brand-ink">{getTitle()}</h1>
              <p className="text-brand-ink/50 text-sm font-light leading-relaxed">{getDescription()}</p>
            </div>

            {errorMsg && (
              <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-950/20 border border-green-900/50 p-4 rounded-lg flex items-start gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs">{successMsg}</p>
              </div>
            )}

            {/* Email and Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-ink/40">
                      <UserIcon size={16} />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-brand-ink placeholder:text-brand-ink/30"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-ink/40">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-brand-ink placeholder:text-brand-ink/30"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold">Password</label>
                    {authMode === 'signin' && (
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                        className="text-[10px] uppercase tracking-widest text-brand-ink/40 hover:text-brand-accent transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-ink/40">
                      <Key size={16} />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-brand-ink placeholder:text-brand-ink/30"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-ink text-brand-bg py-4 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            {/* Social Separator */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-brand-border/20"></div>
              <span className="text-[10px] uppercase tracking-widest text-brand-ink/30 font-medium">Or</span>
              <div className="flex-1 h-px bg-brand-border/20"></div>
            </div>

            {/* Google Authentication Button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-brand-surface border border-brand-border text-brand-ink py-4 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-brand-secondary/50 hover:border-brand-accent/50 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <svg className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            {/* Auth Mode Toggle Links */}
            <div className="flex flex-col items-center gap-3 pt-4 text-xs">
              {authMode === 'signin' ? (
                <p className="text-brand-ink/50">
                  New client?{' '}
                  <button 
                    onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-brand-ink/80 hover:text-brand-accent font-semibold transition-colors underline"
                  >
                    Create a buyer account
                  </button>
                </p>
              ) : (
                <button 
                  onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-brand-ink/60 hover:text-brand-accent font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-brand-border text-center">
              <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Secure & Encrypted Connection</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
