import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserCards, getAllCards, activateCard, deactivateCard, deleteCard } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { Table, Tag, Space, Button, message, Popconfirm, Tabs, Card, Typography, Row, Col, Statistic, Input } from 'antd';
import { EyeOutlined, CheckCircleOutlined, StopOutlined, DeleteOutlined, CreditCardOutlined, AppstoreOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #f0f2f5;
    font-weight: 600;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: #e6f7ff;
  }
`;

const ActionButton = styled(Button)`
  width: 100px;
`;

const CardList = () => {
    const [allCards, setAllCards] = useState([]);
    const [assignedCards, setAssignedCards] = useState([]);
    const [unassignedCards, setUnassignedCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchCards();
    }, [user]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            let fetchedCards;
            if (user.role === 'admin') {
                fetchedCards = await getAllCards();
            } else {
                fetchedCards = await getUserCards();
            }

            if (user.role === 'admin') {
                setAllCards(fetchedCards);
                const assigned = fetchedCards.filter(card => card.assignedTo && card.assignedTo.role !== 'admin');
                const unassigned = fetchedCards.filter(card => !card.assignedTo || card.assignedTo.role === 'admin');
                setAssignedCards(assigned);
                setUnassignedCards(unassigned);
            } else {
                setAssignedCards(fetchedCards);
            }
        } catch (error) {
            message.error('Failed to fetch cards: ' + error.message);
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
            message.error('Failed to activate card: ' + error.message);
        }
    };

    const handleDeactivate = async (urlCode) => {
        try {
            await deactivateCard(urlCode);
            message.success('Card deactivated successfully');
            fetchCards();
        } catch (error) {
            message.error('Failed to deactivate card: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCard(id);
            message.success('Card deleted successfully');
            fetchCards();
        } catch (error) {
            message.error('Failed to delete card: ' + error.message);
        }
    };

    const columns = [
        {
            title: 'URL Code',
            dataIndex: 'urlCode',
            key: 'urlCode',
        },
        {
            title: 'Name',
            dataIndex: ['details', 'name'],
            key: 'name',
            render: (text) => text || 'N/A',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                (record.details?.name?.toLowerCase() || '').includes(value.toLowerCase()) ||
                record.urlCode.toLowerCase().includes(value.toLowerCase()),
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
            title: 'Assigned To',
            dataIndex: ['assignedTo', 'username'],
            key: 'assignedTo',
            render: (text, record) => text || 'Unassigned',
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        ...(user.role === 'admin' ? [{
            title: 'Booking ID',
            dataIndex: 'purchaseId',
            key: 'purchaseId',
        }] : []),
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Link to={`/card/${record.urlCode}`}>
                        <ActionButton type="primary" icon={<EyeOutlined />}>
                            View
                        </ActionButton>
                    </Link>
                    {(user.role === 'admin' || record.assignedTo?._id === user._id) && (
                        <>
                            {record.isActive ? (
                                <ActionButton
                                    onClick={() => handleDeactivate(record.urlCode)}
                                    icon={<StopOutlined />}
                                    danger
                                >
                                    Deactivate
                                </ActionButton>
                            ) : (
                                <ActionButton
                                    onClick={() => handleActivate(record.urlCode)}
                                    icon={<CheckCircleOutlined />}
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                                >
                                    Activate
                                </ActionButton>
                            )}
                        </>
                    )}
                    {user.role === 'admin' && (
                        <Popconfirm
                            title="Are you sure you want to delete this card?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <ActionButton icon={<DeleteOutlined />} danger>
                                Delete
                            </ActionButton>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    <AppstoreOutlined />
                    <span className="ml-2">All Cards</span>
                </span>
            ),
            children: (
                <StyledTable
                    columns={columns}
                    dataSource={allCards}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
        {
            key: '2',
            label: (
                <span>
                    <UserOutlined />
                    <span className="ml-2">Assigned Cards</span>
                </span>
            ),
            children: (
                <StyledTable
                    columns={columns}
                    dataSource={assignedCards}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
        {
            key: '3',
            label: (
                <span>
                    <CreditCardOutlined />
                    <span className="ml-2">Unassigned Cards</span>
                </span>
            ),
            children: (
                <StyledTable
                    columns={columns}
                    dataSource={unassignedCards}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="Total Cards"
                            value={allCards.length}
                            prefix={<CreditCardOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="Active Cards"
                            value={allCards.filter(card => card.isActive).length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="Inactive Cards"
                            value={allCards.filter(card => !card.isActive).length}
                            prefix={<StopOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </StyledCard>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StyledCard>
                        <Statistic
                            title="Assigned Cards"
                            value={assignedCards.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </StyledCard>
                </Col>
            </Row>
            <StyledCard className="mb-6">
                <Title level={2} className="mb-0">
                    <CreditCardOutlined className="mr-2" />
                    Business Cards
                </Title>
                <Text type="secondary">Manage and view your business cards</Text>
                <Row gutter={16} className="mt-4">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Search by name or URL code"
                            prefix={<SearchOutlined />}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                </Row>
            </StyledCard>
            <StyledCard>
                <Tabs
                    defaultActiveKey="1"
                    items={user.role === 'admin' ? tabItems : [tabItems[1]]}
                    tabBarGutter={24}
                />
            </StyledCard>
        </div>
    );
};

export default CardList;