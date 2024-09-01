import React, { useState } from 'react';
import { createCard } from '../../services/api';
import { Form, InputNumber, Button, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const CardForm = ({ onCardCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await createCard(values);
            message.success(`Successfully created ${values.count} card(s)`);
            form.resetFields();
            if (onCardCreated) onCardCreated();
        } catch (error) {
            message.error('Failed to create cards');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-md rounded-lg mb-8">
            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                initialValues={{ count: 1 }}
            >
                <Form.Item
                    name="count"
                    label="Number of cards to create"
                    rules={[
                        { required: true, message: 'Please input the number of cards' },
                        { type: 'number', min: 1, message: 'Please enter a number greater than 0' }
                    ]}
                >
                    <InputNumber min={1} className="w-full" />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={loading}
                        className="w-full"
                    >
                        Create Cards
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CardForm;