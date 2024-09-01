import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, updateCard, activateCard, deactivateCard, setUrlCode, reAssignCard, getNonAdminUsers, deleteCard } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Form, Input, Button, Card, Typography, message, Switch, Select, Popconfirm, Space, Divider, Avatar, Tooltip, Tag, Skeleton, Row, Col, Modal, Descriptions } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, CloseOutlined, LinkOutlined, UserOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, HomeOutlined, CopyOutlined, QrcodeOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CardDetailPage = () => {
    const { urlCode: initialUrlCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [card, setCard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUrlCode, setNewUrlCode] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [nonAdminUsers, setNonAdminUsers] = useState([]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [urlModalVisible, setUrlModalVisible] = useState(false);

    useEffect(() => {
        fetchCardDetails();
        if (user?.role === 'admin') {
            fetchNonAdminUsers();
        }
    }, [initialUrlCode, user?.role]);

    const fetchCardDetails = async () => {
        try {
            setLoading(true);
            const cardData = await getCard(initialUrlCode);
            setCard(cardData);
            form.setFieldsValue(cardData.details);
            setNewUrlCode(cardData.urlCode);
        } catch (error) {
            message.error('Error fetching card details');
        } finally {
            setLoading(false);
        }
    };

    const fetchNonAdminUsers = async () => {
        try {
            const users = await getNonAdminUsers();
            setNonAdminUsers(users);
        } catch (error) {
            message.error('Error fetching non-admin users');
        }
    };

    const handleSave = async (values) => {
        try {
            await updateCard(card.urlCode, { details: values });
            setIsEditing(false);
            message.success('Card details updated successfully');
            fetchCardDetails();
        } catch (error) {
            message.error('Error updating card');
        }
    };

    const handleActivate = async () => {
        try {
            await activateCard(card.urlCode);
            message.success('Card activated successfully');
            fetchCardDetails();
        } catch (error) {
            message.error('Error activating card');
        }
    };

    const handleDeactivate = async () => {
        try {
            await deactivateCard(card.urlCode);
            message.success('Card deactivated successfully');
            fetchCardDetails();
        } catch (error) {
            message.error('Error deactivating card');
        }
    };

    const handleUrlCodeSubmit = async () => {
        if (!newUrlCode.trim()) {
            message.error('URL code cannot be empty');
            return;
        }

        try {
            const updatedCard = await setUrlCode(card._id, newUrlCode);
            message.success('URL code updated successfully');
            setCard(updatedCard);
            setUrlModalVisible(false);
            navigate(`/card/${updatedCard.urlCode}`, { replace: true });
        } catch (error) {
            if (error.response && error.response.status === 409) {
                message.error('This URL code is already in use. Please choose another.');
            } else {
                message.error('Error updating URL code: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleReassign = async () => {
        try {
            await reAssignCard(card.urlCode, newUserId);
            message.success('Card reassigned successfully');
            fetchCardDetails();
            setNewUserId('');
        } catch (error) {
            message.error('Error reassigning card');
        }
    };

    const handleDelete = async () => {
        if (!card || !card._id) {
            message.error('Invalid card data');
            return;
        }

        try {
            await deleteCard(card._id);
            message.success('Card deleted successfully');
            navigate('/cards');
        } catch (error) {
            message.error('Failed to delete card: ' + (error.response?.data?.message || error.message));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Copied to clipboard');
        }, (err) => {
            message.error('Failed to copy');
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingOutlined style={{ fontSize: 48 }} spin />
            </div>
        );
    }

    if (!card) {
        return <div className="text-center py-16 text-2xl">Card not found</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-8 py-12"
        >
            <Card
                className="shadow-2xl rounded-lg overflow-hidden"
                cover={
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-between px-12 py-8"
                    >
                        <div className="flex items-center">
                            <Avatar size={120} icon={<UserOutlined />} src={card.details?.avatarUrl} />
                            <div className="ml-8 text-white">
                                <Title level={2} style={{ color: 'white', margin: 0 }}>{card.details?.name || 'Unnamed Card'}</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px' }}>{card.details?.title || 'No Title'}</Text>
                            </div>
                        </div>
                        <Space size="large">
                            <Tooltip title="Edit">
                                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)} size="large" shape="circle" />
                            </Tooltip>
                            <Tooltip title={card.isActive ? "Deactivate" : "Activate"}>
                                <Switch
                                    checked={card.isActive}
                                    onChange={card.isActive ? handleDeactivate : handleActivate}
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                    size="large"
                                />
                            </Tooltip>
                            {user.role === 'admin' && (
                                <Popconfirm
                                    title="Are you sure you want to delete this card?"
                                    onConfirm={handleDelete}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Tooltip title="Delete">
                                        <Button icon={<DeleteOutlined />} danger size="large" shape="circle" />
                                    </Tooltip>
                                </Popconfirm>
                            )}
                        </Space>
                    </motion.div>
                }
            >
                <Row gutter={24}>
                    <Col span={16}>
                        <Title level={3}>Card Details</Title>
                        <Form
                            form={form}
                            onFinish={handleSave}
                            layout="vertical"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="name" label="Name">
                                        <Input prefix={<UserOutlined />} disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="title" label="Title">
                                        <Input disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="company" label="Company">
                                        <Input disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email">
                                        <Input prefix={<MailOutlined />} disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Phone">
                                        <Input prefix={<PhoneOutlined />} disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="website" label="Website">
                                        <Input prefix={<GlobalOutlined />} disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="address" label="Address">
                                        <Input.TextArea rows={4} disabled={!isEditing} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Space size="large" className="mt-4">
                                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                                            Save Changes
                                        </Button>
                                        <Button onClick={() => setIsEditing(false)} icon={<CloseOutlined />} size="large">
                                            Cancel
                                        </Button>
                                    </Space>
                                </motion.div>
                            )}
                        </Form>
                    </Col>
                    <Col span={8}>
                        <Title level={3}>Card Info</Title>
                        <Card className="shadow-md">
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="URL Code">
                                    <Space>
                                        <Tag color="blue">{card.urlCode}</Tag>
                                        <Tooltip title="Copy to clipboard">
                                            <Button
                                                icon={<CopyOutlined />}
                                                onClick={() => copyToClipboard(card.urlCode)}
                                                size="small"
                                            />
                                        </Tooltip>
                                        <Button
                                            type="link"
                                            onClick={() => setUrlModalVisible(true)}
                                            size="small"
                                        >
                                            Change
                                        </Button>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={card.isActive ? 'success' : 'error'}>
                                        {card.isActive ? 'Active' : 'Inactive'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Assigned To">
                                    {card.assignedTo?.username || 'Unassigned'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Start Date">
                                    {card.startDate ? new Date(card.startDate).toLocaleString() : 'Not started'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {new Date(card.createdAt).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Updated At">
                                    {new Date(card.updatedAt).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                        <Divider />
                        <Title level={3}>QR Code</Title>
                        <Card className="shadow-md text-center">
                            <QrcodeOutlined style={{ fontSize: '120px', color: '#1890ff' }} />
                            <Text type="secondary" className="block mt-4">QR Code will be generated here</Text>
                        </Card>
                        {user.role === 'admin' && (
                            <>
                                <Divider />
                                <Title level={3}>Admin Actions</Title>
                                <Card className="shadow-md">
                                    <Form layout="vertical" onFinish={handleReassign}>
                                        <Form.Item name="newUserId" label="Reassign Card">
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder="Select user"
                                                onChange={(value) => setNewUserId(value)}
                                            >
                                                {nonAdminUsers.map(user => (
                                                    <Option key={user._id} value={user._id}>{user.username}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" block>
                                            Reassign
                                        </Button>
                                    </Form>
                                </Card>
                            </>
                        )}
                    </Col>
                </Row>
            </Card>

            <Modal
                title="Change URL Code"
                visible={urlModalVisible}
                onOk={handleUrlCodeSubmit}
                onCancel={() => setUrlModalVisible(false)}
            >
                <Paragraph>
                    Current URL code: <Text strong>{card.urlCode}</Text>
                </Paragraph>
                <Form layout="vertical">
                    <Form.Item
                        label="New URL Code"
                        required
                        tooltip="The new URL code must be unique"
                    >
                        <Input
                            value={newUrlCode}
                            onChange={(e) => setNewUrlCode(e.target.value)}
                            prefix={<LinkOutlined />}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </motion.div>
    );
};

export default CardDetailPage;