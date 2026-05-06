import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Statistic, Progress, Table, Tag, Typography, Divider } from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, MedicineBoxOutlined,
  ExperimentOutlined, HeartOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { statsApi } from '../services/api';

const { Title, Text } = Typography;

interface QualityReport {
  coreIndicators: {
    assessmentRate: number;
    timelyAssessmentRate: number;
    preventionRate: number;
    drugPreventionRate: number;
    physicalPreventionRate: number;
  };
  trendData: Array<{ date: string; assessmentRate: number; preventionRate: number; alertCount: number }>;
  departmentComparison: Array<{ name: string; assessmentRate: number; preventionRate: number; alertCount: number; avgScore: number }>;
  preventionMethodDistribution: { basic: number; physical: number; drug: number; combined: number };
  scaleUsageDistribution: { caprini: number; padua: number; wells: number; other: number };
  ageDistribution: Array<{ range: string; count: number; highRiskCount: number }>;
  topRiskFactors: Array<{ name: string; count: number }>;
}

const indicatorColor = (val: number, target: number) =>
  val >= target ? '#52c41a' : val >= target * 0.8 ? '#faad14' : '#ff4d4f';

const StatsPage: React.FC = () => {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getQualityReport().then(res => {
      setReport(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!report) return <div>暂无数据</div>;

  const { coreIndicators: ci } = report;

  // 趋势折线图
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['评估率(%)', '预防率(%)', '预警数'] },
    grid: { left: 40, right: 40, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: report.trendData.map(d => d.date.slice(5)) },
    yAxis: [
      { type: 'value' as const, name: '百分比', max: 100, axisLabel: { formatter: '{value}%' } },
      { type: 'value' as const, name: '预警数', min: 0 },
    ],
    series: [
      {
        name: '评估率(%)', type: 'line', smooth: true,
        data: report.trendData.map(d => d.assessmentRate),
        itemStyle: { color: '#1677ff' }, areaStyle: { color: 'rgba(22,119,255,0.1)' },
      },
      {
        name: '预防率(%)', type: 'line', smooth: true,
        data: report.trendData.map(d => d.preventionRate),
        itemStyle: { color: '#52c41a' }, areaStyle: { color: 'rgba(82,196,26,0.1)' },
      },
      {
        name: '预警数', type: 'bar', yAxisIndex: 1,
        data: report.trendData.map(d => d.alertCount),
        itemStyle: { color: '#faad14', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  // 科室对比雷达图
  const radarOption = {
    tooltip: {},
    legend: { data: report.departmentComparison.map(d => d.name), bottom: 0 },
    radar: {
      indicator: [
        { name: '评估率', max: 100 },
        { name: '预防率', max: 100 },
        { name: '平均分', max: 15 },
      ],
    },
    series: [{
      type: 'radar',
      data: report.departmentComparison.map(d => ({
        value: [d.assessmentRate, d.preventionRate, d.avgScore],
        name: d.name,
      })),
    }],
  };

  // 预防措施分布饼图
  const preventionPieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: report.preventionMethodDistribution.basic, name: '基础预防', itemStyle: { color: '#91caff' } },
        { value: report.preventionMethodDistribution.physical, name: '物理预防', itemStyle: { color: '#69b1ff' } },
        { value: report.preventionMethodDistribution.drug, name: '药物预防', itemStyle: { color: '#4096ff' } },
        { value: report.preventionMethodDistribution.combined, name: '联合预防', itemStyle: { color: '#0958d9' } },
      ],
    }],
  };

  // 评估量表使用分布
  const scalePieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['35%', '65%'], roseType: 'area',
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}次' },
      data: [
        { value: report.scaleUsageDistribution.caprini, name: 'Caprini', itemStyle: { color: '#ff7a45' } },
        { value: report.scaleUsageDistribution.padua, name: 'Padua', itemStyle: { color: '#ffa940' } },
        { value: report.scaleUsageDistribution.wells, name: 'Wells', itemStyle: { color: '#ffc53d' } },
      ].filter(d => d.value > 0),
    }],
  };

  // 年龄分布柱状图
  const ageBarOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总人数', '高危人数'] },
    grid: { left: 40, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: report.ageDistribution.map(d => d.range) },
    yAxis: { type: 'value' as const },
    series: [
      {
        name: '总人数', type: 'bar', stack: 'total',
        data: report.ageDistribution.map(d => d.count),
        itemStyle: { color: '#91caff', borderRadius: [0, 0, 0, 0] },
      },
      {
        name: '高危人数', type: 'bar', stack: 'risk',
        data: report.ageDistribution.map(d => d.highRiskCount),
        itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  // 高频风险因子横向条形图
  const riskFactorOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 160, right: 40, bottom: 10, top: 10 },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: [...report.topRiskFactors].reverse().map(f => f.name),
      axisLabel: { width: 140, overflow: 'truncate' as const },
    },
    series: [{
      type: 'bar',
      data: [...report.topRiskFactors].reverse().map(f => ({
        value: f.count,
        itemStyle: { color: '#ff7a45', borderRadius: [0, 4, 4, 0] },
      })),
      label: { show: true, position: 'right' as const },
    }],
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>质控统计报表</Title>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="VTE风险评估率"
              value={ci.assessmentRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: indicatorColor(ci.assessmentRate, 90) }}
            />
            <Progress percent={ci.assessmentRate} strokeColor={indicatorColor(ci.assessmentRate, 90)} size="small" showInfo={false} />
            <Text type="secondary" style={{ fontSize: 11 }}>目标: ≥90%</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="24h内评估及时率"
              value={ci.timelyAssessmentRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: indicatorColor(ci.timelyAssessmentRate, 85) }}
            />
            <Progress percent={ci.timelyAssessmentRate} strokeColor={indicatorColor(ci.timelyAssessmentRate, 85)} size="small" showInfo={false} />
            <Text type="secondary" style={{ fontSize: 11 }}>目标: ≥85%</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="预防措施实施率"
              value={ci.preventionRate}
              suffix="%"
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: indicatorColor(ci.preventionRate, 80) }}
            />
            <Progress percent={ci.preventionRate} strokeColor={indicatorColor(ci.preventionRate, 80)} size="small" showInfo={false} />
            <Text type="secondary" style={{ fontSize: 11 }}>目标: ≥80%</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="药物预防占比"
              value={ci.drugPreventionRate}
              suffix="%"
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
            <Progress percent={ci.drugPreventionRate} strokeColor="#1677ff" size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={6}>
          <Card>
            <Statistic
              title="物理预防占比"
              value={ci.physicalPreventionRate}
              suffix="%"
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={ci.physicalPreventionRate} strokeColor="#722ed1" size="small" showInfo={false} />
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
      <Card title="近7天质控指标趋势" style={{ marginTop: 16 }}>
        <ReactECharts option={trendOption} style={{ height: 350 }} />
      </Card>

      {/* 科室对比 + 预防方式分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="科室质控雷达图对比">
            <ReactECharts option={radarOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="预防措施类型分布">
            <ReactECharts option={preventionPieOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      {/* 量表使用 + 年龄分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="评估量表使用分布">
            <ReactECharts option={scalePieOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="年龄段分布与高危占比">
            <ReactECharts option={ageBarOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 高频风险因子 */}
      <Card title="高频VTE风险因子 TOP 10" style={{ marginTop: 16 }}>
        <ReactECharts option={riskFactorOption} style={{ height: Math.max(report.topRiskFactors.length * 40, 200) }} />
      </Card>

      {/* 科室详细数据表 */}
      <Card title="科室质控指标明细" style={{ marginTop: 16 }}>
        <Table
          dataSource={report.departmentComparison}
          rowKey="name"
          pagination={false}
          size="middle"
          columns={[
            { title: '科室', dataIndex: 'name' },
            {
              title: '评估率', dataIndex: 'assessmentRate', align: 'center' as const,
              render: (v: number) => (
                <span>
                  <Progress type="circle" percent={v} width={40} strokeColor={indicatorColor(v, 90)}
                    format={p => `${p}%`} />
                </span>
              ),
              sorter: (a: any, b: any) => a.assessmentRate - b.assessmentRate,
            },
            {
              title: '预防率', dataIndex: 'preventionRate', align: 'center' as const,
              render: (v: number) => (
                <Progress type="circle" percent={v} width={40} strokeColor={indicatorColor(v, 80)}
                  format={p => `${p}%`} />
              ),
              sorter: (a: any, b: any) => a.preventionRate - b.preventionRate,
            },
            {
              title: '平均评分', dataIndex: 'avgScore', align: 'center' as const,
              render: (v: number) => <Tag color={v >= 5 ? 'red' : v >= 3 ? 'orange' : 'green'}>{v}</Tag>,
              sorter: (a: any, b: any) => a.avgScore - b.avgScore,
            },
            {
              title: '待处理预警', dataIndex: 'alertCount', align: 'center' as const,
              render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <Tag color="green">0</Tag>,
              sorter: (a: any, b: any) => a.alertCount - b.alertCount,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default StatsPage;
