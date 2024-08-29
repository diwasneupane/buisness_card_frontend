import React, { useState } from 'react';
import { createCard } from '../../services/api';
import Input from '../common/Input';
import Button from '../Common/Button';

const CardForm = ({ onCardCreated }) => {
    const [count, setCount] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCard({ count });
            setCount(1);
            if (onCardCreated) onCardCreated();
        } catch (error) {
            console.error('Failed to create cards:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold mb-4">Create New Cards</h2>
            <div className="mb-4">
                <label htmlFor="count" className="block text-gray-700 text-sm font-bold mb-2">
                    Number of cards to create
                </label>
                <Input
                    type="number"
                    id="count"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Create Cards
            </Button>
        </form>
    );
};

export default CardForm;