import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserCards, activateCard, deactivateCard, deleteCard } from '../../services/api';
import { Table, Tag, Space, Button, message, Popconfirm } from 'antd';
import { EyeOutlined, CheckCircleOutlined, StopOutlined, DeleteOutlined } from '@ant-design/icons';

const CardList = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const fetchedCards = await getUserCards();
            setCards(fetchedCards);
        } catch (error) {
            message.error('Failed to fetch cards');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (urlCode) => {
        try {
            await activateCard(urlCode);
            message.success('Card activated successfully');
            fetchCards();
        } catch (error) {
            message.error('Failed to activate card');
        }
    };

    const handleDeactivate = async (urlCode) => {
        try {
            await deactivateCard(urlCode);
            message.success('Card deactivated successfully');
            fetchCards();
        } catch (error) {
            message.error('Failed to deactivate card');
        }
    };

    const handleDelete = async (record) => {
        if (!record || !record._id) {
            message.error('Invalid card data');
            return;
        }

        try {
            await deleteCard(record._id);
            message.success('Card deleted successfully');
            fetchCards(); // Refresh the list after deletion
        } catch (error) {
            message.error('Failed to delete card: ' + (error.response?.data?.message || error.message));
        }
    };
    const columns = [
        {
            title: 'URL Code',
            dataIndex: 'urlCode',
            key: 'urlCode',
        },
        {
            title: 'Custom URL',
            dataIndex: 'customUrlCode',
            key: 'customUrlCode',
            render: (text) => text || '-',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/card/${record.urlCode}`}>
                        <Button type="primary" icon={<EyeOutlined />}>
                            View
                        </Button>
                    </Link>
                    {record.isActive ? (
                        <Button
                            onClick={() => handleDeactivate(record.urlCode)}
                            icon={<StopOutlined />}
                            danger
                        >
                            Deactivate
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleActivate(record.urlCode)}
                            icon={<CheckCircleOutlined />}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                        >
                            Activate
                        </Button>
                    )}
                    <Popconfirm
                        title="Are you sure you want to delete this card?"
                        onConfirm={() => handleDelete(record.urlCode)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Business Cards</h2>
            <Table
                columns={columns}
                dataSource={cards}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="shadow-lg rounded-lg overflow-hidden"
            />
        </div>
    );
};

export default CardList;