import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Login onLogin={handleLogin} />
            <p className="mt-4 text-center">
                Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;