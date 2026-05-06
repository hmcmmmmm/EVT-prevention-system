import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Avatar, Typography, Switch } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const { Text } = Typography;

const roleColorMap: Record<string, string> = {
  admin: 'red', dept_director: 'blue', attending: 'green',
  resident: 'orange', head_nurse: 'purple', nurse: 'cyan',
};

interface UserRecord {
  id: string; username: string; name: string; role: string; departmentId: string;
  departmentName: string; title: string; phone?: string; isActive: boolean;
  permissions: { label: string; dataScope: string; canAssess: boolean; canPrescribe: boolean; canViewStats: boolean };
}

const scopeLabels: Record<string, string> = {
  all: '全院', dept: '本科室', team: '本医疗组', self: '本人负责',
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    userApi.getList().then(res => {
      setUsers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (id: string) => {
    try {
      await userApi.toggleActive(id);
      message.success('状态已更新');
      fetchUsers();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    {
      title: '用户', key: 'user', width: 180,
      render: (_: any, r: UserRecord) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: roleColorMap[r.role] }} size="small" />
          <div>
            <Text strong>{r.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{r.username}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色', key: 'role', width: 120,
      render: (_: any, r: UserRecord) => (
        <Tag color={roleColorMap[r.role]}>{r.permissions.label}</Tag>
      ),
    },
    { title: '职称', dataIndex: 'title', width: 100 },
    { title: '科室', dataIndex: 'departmentName', width: 100 },
    {
      title: '数据范围', key: 'scope', width: 100,
      render: (_: any, r: UserRecord) => (
        <Tag>{scopeLabels[r.permissions.dataScope] || r.permissions.dataScope}</Tag>
      ),
    },
    {
      title: '权限', key: 'perms', width: 200,
      render: (_: any, r: UserRecord) => (
        <Space size={4} wrap>
          {r.permissions.canAssess && <Tag color="blue">评估</Tag>}
          {r.permissions.canPrescribe && <Tag color="green">开医嘱</Tag>}
          {r.permissions.canViewStats && <Tag color="purple">统计</Tag>}
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'isActive', width: 80, align: 'center' as const,
      render: (active: boolean, r: UserRecord) => (
        <Switch checked={active} size="small" onChange={() => toggleActive(r.id)} />
      ),
    },
  ];

  return (
    <Card title={`用户管理 (${users.length})`}>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={false}
        rowClassName={(r: UserRecord) => r.isActive ? '' : 'row-inactive'}
      />
    </Card>
  );
};

export default UserManagementPage;
