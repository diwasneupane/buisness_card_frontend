import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserCards, activateCard, deactivateCard } from '../../services/api';
import Button from '../Common/Button';

const CardList = () => {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const fetchedCards = await getUserCards();
            setCards(fetchedCards);
        } catch (error) {
            console.error('Failed to fetch cards:', error);
        }
    };

    const handleActivate = async (urlCode) => {
        try {
            await activateCard(urlCode);
            fetchCards(); // Refresh the list
        } catch (error) {
            console.error('Failed to activate card:', error);
        }
    };

    const handleDeactivate = async (urlCode) => {
        try {
            await deactivateCard(urlCode);
            fetchCards(); // Refresh the list
        } catch (error) {
            console.error('Failed to deactivate card:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Your Business Cards</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custom URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {cards.map((card) => (
                            <tr key={card._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{card.urlCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{card.customUrlCode || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {card.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {card.startDate ? new Date(card.startDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/card/${card.urlCode}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                                    {card.isActive ? (
                                        <button onClick={() => handleDeactivate(card.urlCode)} className="text-red-600 hover:text-red-900 mr-4">
                                            Deactivate
                                        </button>
                                    ) : (
                                        <button onClick={() => handleActivate(card.urlCode)} className="text-green-600 hover:text-green-900 mr-4">
                                            Activate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CardList;