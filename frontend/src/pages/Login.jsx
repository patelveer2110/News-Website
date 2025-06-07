import { useState } from 'react';
import { backendURL } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [accountType, setAccountType] = useState('admin');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    return setError('Passwords do not match.');
                }

                const formData = new FormData();
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                if (profilePhoto) formData.append('image', profilePhoto);

                const response = await axios.post(`${backendURL}/api/${accountType}/register`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', accountType);
                navigate(`/${accountType}/dashboard`);
            } else {
                const response = await axios.post(`${backendURL}/api/${accountType}/login`, {
                    email,
                    password
                });

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', accountType);
                navigate(`/${accountType}/dashboard`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">

                    {/* Toggle Tabs */}
                    <div className="flex items-center justify-center mt-6">
                        <button type="button" onClick={() => setIsSignUp(false)}
                            className={`w-1/3 pb-4 font-medium text-center capitalize border-b ${!isSignUp ? 'text-gray-800 border-b-2 border-blue-500 dark:border-blue-400 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                            Sign In
                        </button>
                        <button type="button" onClick={() => setIsSignUp(true)}
                            className={`w-1/3 pb-4 font-medium text-center capitalize border-b ${isSignUp ? 'text-gray-800 border-b-2 border-blue-500 dark:border-blue-400 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                            Sign Up
                        </button>
                    </div>

                    {/* Account Type Buttons */}
                    <div className="mt-6">
                        <h1 className="text-sm text-gray-500 dark:text-gray-300">Select type of account</h1>
                        <div className="mt-3 flex items-center justify-center gap-2">
                            {['admin', 'user'].map((type) => (
                                <button key={type} type="button" onClick={() => setAccountType(type)}
                                    className={`flex items-center justify-center w-full px-4 py-2 rounded-lg transition-colors ${
                                        accountType === type
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'border border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-100'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={type === 'admin'
                                            ? 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                                            : 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'} />
                                    </svg>
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Username Field */}
                    {isSignUp && (
                        <div className="relative flex items-center mt-8">
                            <span className="absolute left-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                                className="block w-full py-3 pl-12 pr-4 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                placeholder="Username" />
                        </div>
                    )}

                    {/* Profile Photo Upload */}
                    {isSignUp && (
                        <label htmlFor="dropzone-file" className="flex items-center px-3 py-3 mx-auto mt-6 text-center bg-white border-2 border-dashed rounded-lg cursor-pointer dark:border-gray-600 dark:bg-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <h2 className="mx-3 text-gray-400">Profile Photo</h2>
                            <input id="dropzone-file" type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files[0])} className="hidden" />
                        </label>
                    )}

                    {/* Email Input */}
                    <div className="relative flex items-center mt-6">
                        <span className="absolute left-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="block w-full py-3 pl-12 pr-4 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            placeholder="Email address" />
                    </div>

                    {/* Password Input */}
                    <div className="relative flex items-center mt-4">
                        <span className="absolute left-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="block w-full py-3 pl-12 pr-4 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                            placeholder="Password" />
                    </div>

                    {/* Confirm Password */}
                    {isSignUp && (
                        <div className="relative flex items-center mt-4">
                            <span className="absolute left-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                className="block w-full py-3 pl-12 pr-4 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                                placeholder="Confirm Password" />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button type="submit"
                            className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;
