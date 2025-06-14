import { useState, useEffect, useContext } from 'react';
import { backendURL } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useConfirmDialog } from '../context/ConfirmDialogContext';

const Login = ({ setToken, setRole }) => {
  const { toggleTheme, theme } = useContext(ThemeContext);
  const { showAlert } = useConfirmDialog();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(true);
  const [accountType, setAccountType] = useState('admin');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const resetFields = () => {
    setUsername('');
    setEmail('');
    setEmailOrUsername('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setProfileImage(null);
    setError('');
    setOtpSent(false);
  };

  const handleOtpRequest = async () => {
    setError('');
    if (!username || !email || !password || !confirmPassword) return setError('All fields are required.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (profileImage) {
        formData.append("image", profileImage);
      }

      await axios.post(`${backendURL}/api/${accountType}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpVerification = async () => {
    if (!otp) return setError('Enter the OTP sent to your email.');

    try {
      const response = await axios.post(`${backendURL}/api/${accountType}/verify-otp`, { email, otp });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", accountType);
      setToken(response.data.token);
      setRole(accountType);

      showAlert({
        title: "Registration Successful",
        description: "Welcome! Redirecting to dashboard...",
      });

      navigate(`/${accountType}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${backendURL}/api/${accountType}/login`, {
        emailOrUsername,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", accountType);
      setToken(response.data.token);
      setRole(accountType);
      navigate(`/${accountType}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleForgotPasswordOtp = async () => {
    setError('');
    if (!email) return setError('Enter your registered email.');

    try {
      await axios.post(`${backendURL}/api/${accountType}/forgot-password`, { email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!otp || !password || !confirmPassword) return setError('Fill all fields.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    try {
      await axios.post(`${backendURL}/api/${accountType}/reset-password`, {
        email, otp, newPassword: password
      });

      setForgotPasswordMode(false);
      resetFields();

      showAlert({
        title: "Password Reset Successfully",
        description: "Please login to continue.",
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    }
  };

  const continueWithoutLogin = () => {
    setToken(null);
    setRole(null);
    navigate('/user/dashboard');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (forgotPasswordMode) {
      otpSent ? handleResetPassword() : handleForgotPasswordOtp();
    } else if (isSignUp) {
      otpSent ? handleOtpVerification() : handleOtpRequest();
    } else {
      handleLogin(e);
    }
  };

  return (
    <section className="bg-base-200 min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6 space-y-5">
        <div className="flex justify-end">
          <label className="swap swap-rotate cursor-pointer">
            <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} className="hidden" />
            <Moon className="swap-on w-6 h-6 text-white" />
            <Sun className="swap-off w-6 h-6 text-gray-700" />
          </label>
        </div>

        <div className="flex border-b border-base-300">
          <button type="button" onClick={() => {
            setIsSignUp(false);
            setForgotPasswordMode(false);
            resetFields();
          }} className={`btn btn-ghost flex-1 rounded-none ${!isSignUp && !forgotPasswordMode ? 'border-b-2 border-primary text-primary' : 'text-base-content/60'}`}>
            Sign In
          </button>
          <button type="button" onClick={() => {
            setIsSignUp(true);
            setForgotPasswordMode(false);
            resetFields();
          }} className={`btn btn-ghost flex-1 rounded-none ${isSignUp ? 'border-b-2 border-primary text-primary' : 'text-base-content/60'}`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">

          <div>
            <h2 className="text-sm text-base-content/70 mb-2">Select Account Type</h2>
            <div className="flex gap-2">
              {['admin', 'user'].map((type) => (
                <button key={type} type="button" onClick={() => setAccountType(type)}
                  className={`btn flex-1 ${accountType === type ? 'btn-primary text-white' : 'btn-outline border-primary text-primary'}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          {forgotPasswordMode ? (
            <>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full" required />
              {otpSent && (
                <>
                  <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="input input-bordered w-full" required />
                  <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full" required />
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input input-bordered w-full" required />
                </>
              )}
            </>
          ) : isSignUp ? (
            otpSent ? (
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="input input-bordered w-full" required />
            ) : (
              <>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="input input-bordered w-full" required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full" required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input input-bordered w-full" required />
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="file-input file-input-bordered w-full" />
              </>
            )
          ) : (
            <>
              <input type="text" placeholder="Email or Username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} className="input input-bordered w-full" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full" required />
            </>
          )}

          {error && <div className="text-error text-sm">{error}</div>}
            {!isSignUp && !forgotPasswordMode && (
              <button type="button" className="text-sm text-primary underline"
                onClick={() => {
                  setForgotPasswordMode(true);
                  resetFields();
                }}>
                Forgot Password?
              </button>
            )}

          <button type="submit" className="btn btn-primary w-full">
            {forgotPasswordMode
              ? otpSent ? 'Reset Password' : 'Send OTP'
              : isSignUp ? otpSent ? 'Verify OTP' : 'Send OTP'
              : 'Login'}
          </button>


          <button type="button" onClick={continueWithoutLogin} className="btn btn-outline w-full">
            Continue as Guest
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
