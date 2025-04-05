import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, Mail, Lock, User, Calendar, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SplitPhoneInput from '../components/SplitPhoneInput';
import AvatarSelector from '../components/AvatarSelector';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatar, setAvatar] = useState('profile.png'); // Default avatar
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!email || !password || !firstName || !lastName) {
          throw new Error('Please fill in all required fields');
        }
        await signUp(email, password, firstName, lastName, mobileNumber, dateOfBirth, avatar);
        // Show more friendly message about email verification being disabled
        alert('Account created successfully! You can now sign in with your credentials.');
        setIsSignUp(false);
      } else {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setMobileNumber('');
    setDateOfBirth('');
    setAvatar('profile.png');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Brain className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-primary">SmartNotes</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Create an account' : 'Sign in to your account'}
          </h2>
          
          <p className="text-center text-gray-600 mb-8">
            {isSignUp 
              ? 'Fill in your details to get started'
              : 'Welcome back! Enter your credentials to continue'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                {/* Avatar Selection */}
                <div className="flex justify-center mb-6">
                  <button
                    type="button"
                    onClick={() => setShowAvatarSelector(true)}
                    className="relative group"
                  >
                    <img
                      src={`/${avatar}`}
                      alt="Selected avatar"
                      className="w-24 h-24 rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm">Change Avatar</span>
                    </div>
                  </button>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <SplitPhoneInput
                      value={mobileNumber}
                      onChange={setMobileNumber}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                />
              </div>
              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-primary hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        onSelect={(selectedAvatar) => {
          setAvatar(selectedAvatar);
          setShowAvatarSelector(false);
        }}
        currentAvatar={avatar}
      />
    </div>
  );
}

export default Login;