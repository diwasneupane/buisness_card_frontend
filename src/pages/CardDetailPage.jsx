import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, updateCard, activateCard, deactivateCard, setUrlCode, deleteCard } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Form, Input, Button, Typography, message, Switch, Popconfirm, Space, Divider, Avatar, Tooltip, Tag, Skeleton, Row, Col, Modal } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, CloseOutlined, LinkOutlined, UserOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, HomeOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderBackground = styled.div`
  background: linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: relative;
`;

const ActionButton = styled(Button)`
  margin: 0 5px;
  border-radius: 8px;
`;

const ContentWrapper = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
`;

const CompactForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 12px;
  }
`;

const CardDetailPage = () => {
    const { urlCode: initialUrlCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [card, setCard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUrlCode, setNewUrlCode] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [urlModalVisible, setUrlModalVisible] = useState(false);

    const fetchCardDetails = useCallback(async () => {
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
    }, [initialUrlCode, form]);

    useEffect(() => {
        fetchCardDetails();
    }, [fetchCardDetails]);

    const handleSave = async (values) => {
        try {
            setLoading(true);
            const updatedCard = await updateCard(card.urlCode, { details: values });
            setCard(prevCard => ({ ...prevCard, details: updatedCard.details }));
            setIsEditing(false);
            message.success('Card details updated successfully');
        } catch (error) {
            message.error('Error updating card');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        try {
            setLoading(true);
            await activateCard(card.urlCode);
            setCard(prevCard => ({ ...prevCard, isActive: true }));
            message.success('Card activated successfully');
        } catch (error) {
            message.error('Error activating card');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            setLoading(true);
            await deactivateCard(card.urlCode);
            setCard(prevCard => ({ ...prevCard, isActive: false }));
            message.success('Card deactivated successfully');
        } catch (error) {
            message.error('Error deactivating card');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlCodeSubmit = async () => {
        if (!newUrlCode.trim()) {
            message.error('URL code cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const updatedCard = await setUrlCode(card._id, newUrlCode);
            setCard(updatedCard);
            setUrlModalVisible(false);
            navigate(`/card/${updatedCard.urlCode}`, { replace: true });
            message.success('URL code updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 409) {
                message.error('This URL code is already in use. Please choose another.');
            } else {
                message.error('Error updating URL code: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!card || !card._id) {
            message.error('Invalid card data');
            return;
        }

        try {
            setLoading(true);
            await deleteCard(card._id);
            message.success('Card deleted successfully');
            navigate('/cards');
        } catch (error) {
            message.error('Failed to delete card: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Copied to clipboard');
        }, (err) => {
            message.error('Failed to copy');
        });
    };

    if (!card) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Skeleton active avatar paragraph={{ rows: 4 }} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="py-4"
        >
            <StyledCard>
                <HeaderBackground>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center"
                    >
                        <Avatar size={100} icon={<UserOutlined />} src={card.details?.avatarUrl} />
                        <div className="ml-8 text-white">
                            <Title level={2} style={{ color: 'white', margin: 0 }}>{card.details?.name || 'Unnamed Card'}</Title>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>{card.details?.title || 'No Title'}</Text>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Space size="small">
                            <ActionButton icon={<EditOutlined />} onClick={() => setIsEditing(true)} size="large">
                                Edit
                            </ActionButton>
                            <Switch
                                checked={card.isActive}
                                onChange={card.isActive ? handleDeactivate : handleActivate}
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                size="large"
                                loading={loading}
                            />
                            {(user.role === 'admin' || user._id === card.assignedTo?._id) && (
                                <Popconfirm
                                    title="Are you sure you want to delete this card?"
                                    onConfirm={handleDelete}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <ActionButton icon={<DeleteOutlined />} danger size="large">
                                        Delete
                                    </ActionButton>
                                </Popconfirm>
                            )}
                        </Space>
                    </motion.div>
                </HeaderBackground>
                <ContentWrapper>
                    <Row gutter={24}>
                        <Col span={16}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Title level={4}>Card Details</Title>
                                <CompactForm
                                    form={form}
                                    onFinish={handleSave}
                                    layout="vertical"
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item name="name" label="Name">
                                                <Input prefix={<UserOutlined />} disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="title" label="Title">
                                                <Input disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="company" label="Company">
                                                <Input disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="email" label="Email">
                                                <Input prefix={<MailOutlined />} disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="phone" label="Phone">
                                                <Input prefix={<PhoneOutlined />} disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="website" label="Website">
                                                <Input prefix={<GlobalOutlined />} disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item name="address" label="Address">
                                                <Input.TextArea rows={2} disabled={!isEditing} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <AnimatePresence>
                                        {isEditing && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Space size="small" className="mt-4">
                                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={loading}>
                                                        Save Changes
                                                    </Button>
                                                    <Button onClick={() => setIsEditing(false)} icon={<CloseOutlined />} size="large">
                                                        Cancel
                                                    </Button>
                                                </Space>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CompactForm>
                            </motion.div>
                        </Col>
                        <Col span={8}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Title level={4}>Card Info</Title>
                                <StyledCard>
                                    <Space direction="vertical" size="small" style={{ width: '100%', padding: '16px' }}>
                                        <div>
                                            <Text strong>URL Code: </Text>
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
                                        </div>
                                        <div>
                                            <Text strong>Status: </Text>
                                            <Tag color={card.isActive ? 'success' : 'error'}>
                                                {card.isActive ? 'Active' : 'Inactive'}
                                            </Tag>
                                        </div>
                                        <div>
                                            <Text strong>Assigned To: </Text>
                                            <Text>{card.assignedTo?.username || 'Unassigned'}</Text>
                                        </div>
                                        <div>
                                            <Text strong>Start Date: </Text>
                                            <Text>{card.startDate ? new Date(card.startDate).toLocaleString() : 'Not started'}</Text>
                                        </div>
                                        <div>
                                            <Text strong>Created At: </Text>
                                            <Text>{new Date(card.createdAt).toLocaleString()}</Text>
                                        </div>
                                        <div>
                                            <Text strong>Updated At: </Text>
                                            <Text>{new Date(card.updatedAt).toLocaleString()}</Text>
                                        </div>
                                    </Space>
                                </StyledCard>
                            </motion.div>
                        </Col>
                    </Row>
                </ContentWrapper>
            </StyledCard>

            <Modal
                title="Change URL Code"
                visible={urlModalVisible}
                onOk={handleUrlCodeSubmit}
                onCancel={() => setUrlModalVisible(false)}
                confirmLoading={loading}
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