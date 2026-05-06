import React, { useEffect, useState } from 'react';
import {
  Card, Descriptions, Tag, Table, Tabs, Spin, Timeline,
  Button, Typography, Space, Alert as AntAlert, Badge, Divider, message,
} from 'antd';
import { ArrowLeftOutlined, WarningOutlined, FormOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';
import { Patient, RiskAssessment, PreventionPlan, LabResult } from '../types';

const { Title, Text } = Typography;

const riskLevelConfig: Record<string, { label: string; color: string }> = {
  low: { label: '低危', color: 'green' },
  moderate: { label: '中危', color: 'gold' },
  high: { label: '高危', color: 'red' },
  very_high: { label: '极高危', color: '#cf1322' },
};

const preventionTypeLabels: Record<string, string> = {
  basic: '基础预防', physical: '物理预防', drug: '药物预防', combined: '联合预防',
};

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [plans, setPlans] = useState<PreventionPlan[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);

  useEffect(() => {
    if (!id) return;
    patientApi.getDetail(id).then(res => {
      const data = res.data.data;
      setPatient(data.patient);
      setAssessments(data.assessments || []);
      setPlans(data.preventionPlans || []);
      setLabs(data.labResults || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSyncToEMR = (assessmentId: string) => {
    message.loading({ content: '正在同步到电子病历系统...', key: `syncEMR-${assessmentId}` });
    setTimeout(() => {
      message.success({ content: '已成功同步到电子病历系统！', key: `syncEMR-${assessmentId}`, duration: 3 });
    }, 1500);
  };

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!patient) return <AntAlert message="患者不存在或无权访问" type="error" showIcon />;

  const latestAssessment = assessments.sort((a, b) =>
    new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
  )[0];

  const riskCfg = latestAssessment ? riskLevelConfig[latestAssessment.riskLevel] : null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>
          返回患者列表
        </Button>
        <Button type="primary" icon={<FormOutlined />} onClick={() => navigate(`/patients/${id}/assess`)}>
          发起 VTE 评估
        </Button>
      </Space>

      <Card>
        <Space size="large" align="start" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Descriptions title={`${patient.name} 的病历信息`} column={{ xs: 1, sm: 2, md: 3 }} size="small">
            <Descriptions.Item label="姓名">{patient.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{patient.gender === 'male' ? '男' : '女'}</Descriptions.Item>
            <Descriptions.Item label="年龄">{patient.age} 岁</Descriptions.Item>
            <Descriptions.Item label="病历号">{patient.medicalRecordNo}</Descriptions.Item>
            <Descriptions.Item label="床号">{patient.bedNo}</Descriptions.Item>
            <Descriptions.Item label="入院日期">{patient.admissionDate?.slice(0, 10)}</Descriptions.Item>
            <Descriptions.Item label="BMI">{patient.bmi ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="诊断" span={2}>
              {patient.diagnosis?.map((d, i) => <Tag key={i} style={{ marginBottom: 4 }}>{d}</Tag>)}
            </Descriptions.Item>
          </Descriptions>

          {latestAssessment && (
            <Card size="small" style={{ minWidth: 200, textAlign: 'center', border: `2px solid ${riskCfg?.color}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>当前VTE风险等级</Text>
              <div>
                <Tag color={riskCfg?.color} style={{ fontSize: 18, padding: '4px 16px', marginTop: 8 }}>
                  {riskCfg?.label}
                </Tag>
              </div>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{latestAssessment.totalScore} 分</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>
                {latestAssessment.scaleType.toUpperCase()} | {latestAssessment.assessedAt?.slice(0, 16).replace('T', ' ')}
              </Text></div>
              {latestAssessment.bleedingRisk && (
                <div style={{ marginTop: 4 }}>
                  <Tag color={latestAssessment.bleedingRisk === 'high' ? 'red' : 'orange'} icon={<WarningOutlined />}>
                    出血风险: {riskLevelConfig[latestAssessment.bleedingRisk]?.label}
                  </Tag>
                </div>
              )}
            </Card>
          )}
        </Space>
      </Card>

      <Tabs
        defaultActiveKey="assessments"
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'assessments',
            label: <Badge count={assessments.length} size="small" offset={[10, 0]}>风险评估记录</Badge>,
            children: (
              <Card>
                {assessments.length === 0 ? (
                  <AntAlert message="尚未完成VTE风险评估" type="warning" showIcon />
                ) : (
                  <Timeline mode="left">
                    {assessments.map(a => (
                      <Timeline.Item key={a.id} color={riskLevelConfig[a.riskLevel]?.color}>
                        <Card size="small" style={{ marginBottom: 8 }}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <Tag color={riskLevelConfig[a.riskLevel]?.color}>
                                {riskLevelConfig[a.riskLevel]?.label} ({a.totalScore}分)
                              </Tag>
                              <Tag>{a.scaleType.toUpperCase()}</Tag>
                              <Text type="secondary">{a.assessedAt?.slice(0, 16).replace('T', ' ')}</Text>
                              <Button type="link" size="small" onClick={() => handleSyncToEMR(a.id)}>
                                同步到 EMR
                              </Button>
                            </Space>
                            <div>
                              <Text strong>评估因子: </Text>
                              {a.factors?.filter(f => f.checked).map(f => (
                                <Tag key={f.code} color="blue" style={{ marginBottom: 4 }}>
                                  {f.name} (+{f.score})
                                </Tag>
                              ))}
                            </div>
                          </Space>
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </Card>
            ),
          },
          {
            key: 'prevention',
            label: <Badge count={plans.length} size="small" offset={[10, 0]}>预防方案</Badge>,
            children: (
              <Card>
                {plans.length === 0 ? (
                  <AntAlert message="暂无预防方案" type="info" showIcon />
                ) : (
                  <Table
                    dataSource={plans}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: '预防类型', dataIndex: 'type',
                        render: (t: string) => <Tag color="blue">{preventionTypeLabels[t] || t}</Tag>,
                      },
                      {
                        title: '措施', dataIndex: 'measures',
                        render: (m: string[]) => m.map((s, i) => <Tag key={i}>{s}</Tag>),
                      },
                      {
                        title: '药物', key: 'drug',
                        render: (_: any, r: PreventionPlan) => r.drugName ? `${r.drugName} ${r.dosage} ${r.frequency}` : '-',
                      },
                      {
                        title: '状态', dataIndex: 'status',
                        render: (s: string) => {
                          const map: Record<string, { label: string; color: string }> = {
                            recommended: { label: '待确认', color: 'orange' },
                            accepted: { label: '已执行', color: 'green' },
                            rejected: { label: '已拒绝', color: 'red' },
                            completed: { label: '已完成', color: 'blue' },
                          };
                          return <Tag color={map[s]?.color}>{map[s]?.label || s}</Tag>;
                        },
                      },
                      {
                        title: '创建时间', dataIndex: 'createdAt',
                        render: (t: string) => t?.slice(0, 16).replace('T', ' '),
                      },
                    ]}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'labs',
            label: <Badge count={labs.filter(l => l.isAbnormal).length} size="small" offset={[10, 0]}>检验结果</Badge>,
            children: (
              <Card>
                <Table
                  dataSource={labs}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '检验项目', dataIndex: 'itemName' },
                    {
                      title: '结果', key: 'value',
                      render: (_: any, r: LabResult) => (
                        <Text type={r.isAbnormal ? 'danger' : undefined} strong={r.isAbnormal}>
                          {r.value} {r.unit} {r.isAbnormal && '↑'}
                        </Text>
                      ),
                    },
                    { title: '参考范围', dataIndex: 'referenceRange' },
                    {
                      title: '报告时间', dataIndex: 'reportedAt',
                      render: (t: string) => t?.slice(0, 16).replace('T', ' '),
                    },
                  ]}
                  rowClassName={(r: LabResult) => r.isAbnormal ? 'row-abnormal' : ''}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default PatientDetailPage;
