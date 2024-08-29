import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import CardList from '../components/Dashboard/CardList';
import CardForm from '../components/Dashboard/CardForm';


const Dashboard = () => {
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCardCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            {user.role === 'admin' && (
                <div className="mb-8">
                    <CardForm onCardCreated={handleCardCreated} />
                </div>
            )}
            <CardList key={refreshTrigger} />
        </div>
    );
};

export default Dashboard;
