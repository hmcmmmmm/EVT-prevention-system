import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Tag, Table, Typography, Spin, Progress } from 'antd';
import {
  AlertOutlined, CheckCircleOutlined, TeamOutlined,
  WarningOutlined, MedicineBoxOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { statsApi } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const riskColors: Record<string, string> = {
  low: '#52c41a', moderate: '#faad14', high: '#ff4d4f', veryHigh: '#cf1322', unassessed: '#d9d9d9',
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { permissions } = useAuth();

  useEffect(() => {
    statsApi.getDashboard().then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!stats) return <div>暂无数据</div>;

  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}人' },
      data: [
        { value: stats.riskDistribution.low, name: '低危', itemStyle: { color: riskColors.low } },
        { value: stats.riskDistribution.moderate, name: '中危', itemStyle: { color: riskColors.moderate } },
        { value: stats.riskDistribution.high, name: '高危', itemStyle: { color: riskColors.high } },
        { value: stats.riskDistribution.veryHigh, name: '极高危', itemStyle: { color: riskColors.veryHigh } },
        { value: stats.riskDistribution.unassessed, name: '未评估', itemStyle: { color: riskColors.unassessed } },
      ].filter(d => d.value > 0),
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category' as const, data: stats.departmentStats.map(d => d.departmentName), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar', data: stats.departmentStats.map(d => ({
        value: d.rate,
        itemStyle: { color: d.rate >= 90 ? '#52c41a' : d.rate >= 75 ? '#faad14' : '#ff4d4f' },
      })),
      label: { show: true, position: 'top' as const, formatter: '{c}%' },
    }],
    grid: { bottom: 60 },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="在院患者" value={stats.totalAdmitted} prefix={<TeamOutlined />} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已评估 / 评估率"
              value={stats.assessed}
              suffix={<span>人 <Tag color={stats.assessmentRate >= 90 ? 'green' : 'orange'}>{stats.assessmentRate}%</Tag></span>}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已预防 / 预防率"
              value={stats.withPrevention}
              suffix={<span>人 <Tag color={stats.preventionRate >= 80 ? 'green' : 'orange'}>{stats.preventionRate}%</Tag></span>}
              prefix={<MedicineBoxOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理预警"
              value={stats.pendingAlerts}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              suffix={
                <span>
                  <Tag color="red">{stats.redAlerts} 紧急</Tag>
                  <Tag color="orange">{stats.yellowAlerts} 警告</Tag>
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="VTE 风险分布">
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="科室评估完成率">
            <ReactECharts option={barOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="科室概况" style={{ marginTop: 16 }}>
        <Table
          dataSource={stats.departmentStats}
          rowKey="departmentId"
          pagination={false}
          size="middle"
          columns={[
            { title: '科室', dataIndex: 'departmentName' },
            { title: '在院人数', dataIndex: 'total', align: 'center' as const },
            { title: '已评估', dataIndex: 'assessed', align: 'center' as const },
            {
              title: '评估率', dataIndex: 'rate', align: 'center' as const,
              render: (rate: number) => (
                <Progress
                  percent={rate} size="small" strokeColor={rate >= 90 ? '#52c41a' : rate >= 75 ? '#faad14' : '#ff4d4f'}
                  format={p => `${p}%`}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
