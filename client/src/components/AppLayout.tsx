import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Tag } from 'antd';
import {
  DashboardOutlined, TeamOutlined, AlertOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, MedicineBoxOutlined, PhoneOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleColorMap: Record<string, string> = {
  admin: 'red',
  dept_director: 'blue',
  attending: 'green',
  resident: 'orange',
  head_nurse: 'purple',
  nurse: 'cyan',
};

const AppLayout: React.FC = () => {
  const { user, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '监控仪表盘' },
    { key: '/patients', icon: <TeamOutlined />, label: '患者管理' },
    { key: '/alerts', icon: <AlertOutlined />, label: '预警中心' },
  ];

  if (permissions?.canViewStats) {
    menuItems.push({ key: '/stats', icon: <BarChartOutlined />, label: '质控统计' });
  }
  menuItems.push({ key: '/followup', icon: <PhoneOutlined />, label: '随访管理' });
  if (permissions?.canManageUsers) {
    menuItems.push({ key: '/users', icon: <SettingOutlined />, label: '用户管理' });
  }

  const userMenu = {
    items: [
      { key: 'role', label: `角色: ${permissions?.label}`, disabled: true },
      { key: 'scope', label: `数据范围: ${getScopeLabel(permissions?.dataScope)}`, disabled: true },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        logout();
        navigate('/login');
      }
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark" style={{ overflow: 'auto', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <MedicineBoxOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Text strong style={{ color: '#fff', fontSize: 16 }}>VTE 预防管理</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Header style={{
          background: '#fff', padding: '0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Text strong style={{ fontSize: 16 }}>
            {menuItems.find(m => m.key === location.pathname)?.label || 'VTE 预防管理系统'}
          </Text>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: roleColorMap[user?.role || ''] }} />
              <Text>{user?.name}</Text>
              <Tag color={roleColorMap[user?.role || '']}>{permissions?.label}</Tag>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

function getScopeLabel(scope?: string): string {
  switch (scope) {
    case 'all': return '全院';
    case 'dept': return '本科室';
    case 'team': return '本医疗组';
    case 'self': return '本人负责';
    default: return '-';
  }
}

export default AppLayout;
