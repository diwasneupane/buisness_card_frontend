import React from 'react';
import Register from '../components/Auth/Register';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Register</h1>
            <Register />
            <p className="mt-4 text-center">
                Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;