import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Tag, Divider } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const defaultAccounts = [
  { username: 'admin', password: 'admin123', label: '系统管理员', color: 'red' },
  { username: 'zhangwei', password: '123456', label: '科室主任（骨科）', color: 'blue' },
  { username: 'liming', password: '123456', label: '主治医师（骨科）', color: 'green' },
  { username: 'wangjie', password: '123456', label: '住院医师（骨科）', color: 'orange' },
  { username: 'zhaomin', password: '123456', label: '护士长（骨科）', color: 'purple' },
  { username: 'liuna', password: '123456', label: '护士（骨科）', color: 'cyan' },
];

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    const result = await login(values.username, values.password);
    setLoading(false);
    if (result.success) {
      message.success('登录成功');
      navigate('/');
    } else {
      message.error(result.message || '登录失败');
    }
  };

  const quickLogin = (username: string, password: string) => {
    form.setFieldsValue({ username, password });
    form.submit();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{ width: 480, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        bodyStyle={{ padding: '40px 40px 24px' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>VTE 预防管理系统</Title>
          <Text type="secondary">静脉血栓栓塞症预防管理平台</Text>
        </Space>

        <Form
          form={form}
          onFinish={handleLogin}
          style={{ marginTop: 32 }}
          size="large"
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>快速登录（演示账号）</Text></Divider>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {defaultAccounts.map(acc => (
            <Tag
              key={acc.username}
              color={acc.color}
              style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 12 }}
              onClick={() => quickLogin(acc.username, acc.password)}
            >
              {acc.label}
            </Tag>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
