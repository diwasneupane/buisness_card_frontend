import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, updateCard, activateCard, deactivateCard, setCustomUrlCode, reAssignCard, getNonAdminUsers } from '../services/api';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/Common/Button';
import { Select } from "antd"
const CardDetailPage = () => {
    const { urlCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [card, setCard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [customUrlCode, setCustomUrlCode] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [nonAdminUsers, setNonAdminUsers] = useState([]);

    useEffect(() => {
        fetchCardDetails();
        if (user.role === 'admin') {
            fetchNonAdminUsers();
        }
    }, [urlCode, user.role]);

    const fetchCardDetails = async () => {
        try {
            const cardData = await getCard(urlCode);
            setCard(cardData);
            setEditedDetails(cardData.details || {});
        } catch (error) {
            console.error('Error fetching card details:', error);
        }
    };

    const fetchNonAdminUsers = async () => {
        try {
            const users = await getNonAdminUsers();
            setNonAdminUsers(users);
        } catch (error) {
            console.error('Error fetching non-admin users:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await updateCard(urlCode, { details: editedDetails });
            setIsEditing(false);
            fetchCardDetails();
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const handleActivate = async () => {
        try {
            await activateCard(urlCode);
            fetchCardDetails();
        } catch (error) {
            console.error('Error activating card:', error);
        }
    };

    const handleDeactivate = async () => {
        try {
            await deactivateCard(urlCode);
            fetchCardDetails();
        } catch (error) {
            console.error('Error deactivating card:', error);
        }
    };

    const handleCustomUrlSubmit = async (e) => {
        e.preventDefault();
        try {
            await setCustomUrlCode(urlCode, customUrlCode);
            fetchCardDetails();
            setCustomUrlCode('');
        } catch (error) {
            console.error('Error setting custom URL:', error);
        }
    };

    const handleReassign = async () => {
        if (window.confirm('Are you sure you want to reassign this card?')) {
            try {
                await reAssignCard(urlCode, newUserId);
                fetchCardDetails();
                setNewUserId('');
            } catch (error) {
                console.error('Error reassigning card:', error);
            }
        }
    };

    if (!card) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Business Card Details</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <strong>Card Code:</strong> {card.urlCode}
                </div>
                <div className="mb-4">
                    <strong>Custom URL:</strong> {card.customUrlCode || 'Not set'}
                </div>
                <div className="mb-4">
                    <strong>Status:</strong> {card.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="mb-4">
                    <strong>Assigned To:</strong> {card.assignedTo?.username || 'Unassigned'}
                </div>
                <div className="mb-4">
                    <strong>Start Date:</strong> {card.startDate ? new Date(card.startDate).toLocaleString() : 'Not started'}
                </div>
                <div className="mb-4">
                    <strong>Created At:</strong> {new Date(card.createdAt).toLocaleString()}
                </div>
                <div className="mb-4">
                    <strong>Updated At:</strong> {new Date(card.updatedAt).toLocaleString()}
                </div>

                <h2 className="text-xl font-semibold mb-2">Card Details</h2>
                {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <Input
                            label="Name"
                            value={editedDetails.name || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })}
                        />
                        <Input
                            label="Title"
                            value={editedDetails.title || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, title: e.target.value })}
                        />
                        <Input
                            label="Company"
                            value={editedDetails.company || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, company: e.target.value })}
                        />
                        <Input
                            label="Email"
                            value={editedDetails.email || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            value={editedDetails.phone || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, phone: e.target.value })}
                        />
                        <Input
                            label="Website"
                            value={editedDetails.website || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, website: e.target.value })}
                        />
                        <Input
                            label="Address"
                            value={editedDetails.address || ''}
                            onChange={(e) => setEditedDetails({ ...editedDetails, address: e.target.value })}
                        />
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </form>
                ) : (
                    <div>
                        <p><strong>Name:</strong> {card.details?.name}</p>
                        <p><strong>Title:</strong> {card.details?.title}</p>
                        <p><strong>Company:</strong> {card.details?.company}</p>
                        <p><strong>Email:</strong> {card.details?.email}</p>
                        <p><strong>Phone:</strong> {card.details?.phone}</p>
                        <p><strong>Website:</strong> {card.details?.website}</p>
                        <p><strong>Address:</strong> {card.details?.address}</p>
                        {(user.role === 'admin' || user._id === card.assignedTo?._id) && (
                            <Button onClick={handleEdit} className="mt-4">Edit Details</Button>
                        )}
                    </div>
                )}

                {(user.role === 'admin' || user._id === card.assignedTo?._id) && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Set Custom URL</h3>
                        <form onSubmit={handleCustomUrlSubmit} className="flex items-center space-x-2">
                            <Input
                                value={customUrlCode}
                                onChange={(e) => setCustomUrlCode(e.target.value)}
                                placeholder="Enter custom URL code"
                            />
                            <Button type="submit">Set Custom URL</Button>
                        </form>
                    </div>
                )}

                {user.role === 'admin' && (
                    <>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-2">Reassign Card</h3>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={newUserId}
                                    onChange={(e) => setNewUserId(e.target.value)}
                                    options={nonAdminUsers.map(user => ({ value: user._id, label: user.username }))}
                                    placeholder="Select user"
                                />
                                <Button onClick={handleReassign}>Reassign</Button>
                            </div>
                        </div>
                        <div className="mt-8">
                            {card.isActive ? (
                                <Button onClick={handleDeactivate} className="bg-red-500 hover:bg-red-700">
                                    Deactivate Card
                                </Button>
                            ) : (
                                <Button onClick={handleActivate} className="bg-green-500 hover:bg-green-700">
                                    Activate Card
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CardDetailPage;