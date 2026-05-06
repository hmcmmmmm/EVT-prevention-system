import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Checkbox, Button, Select, Radio, Tag, Space, Typography, Row, Col,
  Descriptions, Spin, message, InputNumber, Input, Divider, Alert, Steps, Result,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, WarningOutlined,
  MedicineBoxOutlined, SaveOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi, assessmentApi } from '../services/api';
import { Patient, AssessmentFactor } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const riskLevelConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: '低危', color: '#52c41a', bg: '#f6ffed' },
  moderate: { label: '中危', color: '#faad14', bg: '#fffbe6' },
  high: { label: '高危', color: '#ff4d4f', bg: '#fff2f0' },
  very_high: { label: '极高危', color: '#cf1322', bg: '#fff1f0' },
};

const triggerEvents = [
  { value: 'admission', label: '入院评估' },
  { value: 'transfer', label: '转科评估' },
  { value: 'pre_surgery', label: '术前评估' },
  { value: 'post_surgery', label: '术后评估' },
  { value: 'condition_change', label: '病情变化' },
  { value: 'discharge', label: '出院评估' },
  { value: 'manual', label: '手动评估' },
];

function calculateRiskLevel(scaleType: string, score: number): string {
  if (scaleType === 'caprini') {
    if (score <= 1) return 'low';
    if (score <= 2) return 'moderate';
    if (score <= 4) return 'high';
    return 'very_high';
  }
  return score < 4 ? 'low' : 'high';
}

function getPreventionRecommendation(riskLevel: string, bleedingRisk: string): {
  type: string; measures: string[]; note: string;
} {
  if (riskLevel === 'low') {
    return { type: '基础预防', measures: ['鼓励早期活动', '健康教育'], note: '低危患者以基础预防为主' };
  }
  if (riskLevel === 'moderate') {
    if (bleedingRisk === 'high') {
      return { type: '基础预防', measures: ['鼓励早期活动', '密切观察'], note: '出血风险高，暂不予药物/物理预防，定期复评' };
    }
    return { type: '物理预防', measures: ['弹力袜', '间歇充气加压装置(IPC)'], note: '中危建议物理预防，可酌情考虑药物预防' };
  }
  if (bleedingRisk === 'high') {
    return { type: '物理预防', measures: ['间歇充气加压装置(IPC)', '被动活动'], note: '高危但出血风险高，禁用药物预防，仅物理预防' };
  }
  if (bleedingRisk === 'moderate') {
    return { type: '物理+药物', measures: ['弹力袜', 'IPC', '低分子肝素(谨慎)', '密切监测凝血'], note: '高/极高危，出血中危，需谨慎使用抗凝药' };
  }
  return {
    type: '联合预防',
    measures: ['低分子肝素皮下注射', '间歇充气加压装置(IPC)', '弹力袜', '鼓励早期活动'],
    note: '高/极高危且出血风险低，建议药物+物理联合预防',
  };
}

const AssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [scaleType, setScaleType] = useState<string>('caprini');
  const [factors, setFactors] = useState<AssessmentFactor[]>([]);
  const [factorsLoading, setFactorsLoading] = useState(false);
  const [triggerEvent, setTriggerEvent] = useState<string>('admission');
  const [bleedingScore, setBleedingScore] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!id) return;
    patientApi.getDetail(id).then(res => {
      setPatient(res.data.data.patient);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setFactorsLoading(true);
    assessmentApi.getScaleFactors(scaleType).then(res => {
      const rawFactors = res.data.data as Omit<AssessmentFactor, 'checked'>[];
      setFactors(rawFactors.map(f => ({ ...f, checked: false })));
      setFactorsLoading(false);
    }).catch(() => setFactorsLoading(false));
  }, [scaleType]);

  const totalScore = useMemo(() =>
    factors.filter(f => f.checked).reduce((sum, f) => sum + f.score, 0),
    [factors]
  );

  const riskLevel = useMemo(() =>
    calculateRiskLevel(scaleType, totalScore),
    [scaleType, totalScore]
  );

  const bleedingRiskLevel = useMemo(() => {
    if (bleedingScore >= 7) return 'high';
    if (bleedingScore >= 4) return 'moderate';
    return 'low';
  }, [bleedingScore]);

  const recommendation = useMemo(() =>
    getPreventionRecommendation(riskLevel, bleedingRiskLevel),
    [riskLevel, bleedingRiskLevel]
  );

  const riskCfg = riskLevelConfig[riskLevel];

  const toggleFactor = (code: string) => {
    setFactors(prev => prev.map(f =>
      f.code === code ? { ...f, checked: !f.checked } : f
    ));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await assessmentApi.create({
        patientId: id,
        scaleType,
        factors,
        triggerEvent,
        bleedingScore,
        notes,
      });
      message.success('评估提交成功！');
      setSubmitted(true);
    } catch (err) {
      message.error('评估提交失败');
    }
    setSubmitting(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!patient) return <Alert message="患者不存在或无权访问" type="error" showIcon />;

  if (submitted) {
    return (
      <Result
        status="success"
        title="VTE 风险评估已提交"
        subTitle={`${patient.name} 的评估结果: ${riskCfg.label} (${totalScore}分)`}
        extra={[
          <Button type="primary" key="detail" onClick={() => navigate(`/patients/${id}`)}>
            查看患者详情
          </Button>,
          <Button key="list" onClick={() => navigate('/patients')}>
            返回患者列表
          </Button>,
        ]}
      />
    );
  }

  const autoFactorCodes = factors.filter(f => f.source === 'auto').map(f => f.code);
  const manualFactorCodes = factors.filter(f => f.source === 'manual').map(f => f.code);

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/patients/${id}`)} style={{ marginBottom: 16 }}>
        返回患者详情
      </Button>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label="姓名">{patient.name}</Descriptions.Item>
          <Descriptions.Item label="性别/年龄">{patient.gender === 'male' ? '男' : '女'} / {patient.age}岁</Descriptions.Item>
          <Descriptions.Item label="床号">{patient.bedNo}</Descriptions.Item>
          <Descriptions.Item label="诊断">
            {patient.diagnosis?.slice(0, 2).map((d, i) => <Tag key={i} style={{ fontSize: 11 }}>{d}</Tag>)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[
          { title: '选择量表 & 评估因子' },
          { title: '出血风险评估' },
          { title: '确认 & 提交' },
        ]}
      />

      {currentStep === 0 && (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Card
                title="VTE 风险评估"
                extra={
                  <Space>
                    <Text>评估量表:</Text>
                    <Select
                      value={scaleType}
                      onChange={setScaleType}
                      style={{ width: 140 }}
                      options={[
                        { value: 'caprini', label: 'Caprini (外科)' },
                        { value: 'padua', label: 'Padua (内科)' },
                      ]}
                    />
                    <Text>触发事件:</Text>
                    <Select
                      value={triggerEvent}
                      onChange={setTriggerEvent}
                      style={{ width: 120 }}
                      options={triggerEvents}
                    />
                  </Space>
                }
              >
                {factorsLoading ? <Spin /> : (
                  <>
                    <Text strong style={{ display: 'block', marginBottom: 8, color: '#1677ff' }}>
                      自动识别因子 (来自病历/检验数据)
                    </Text>
                    <Row gutter={[8, 8]}>
                      {factors.filter(f => f.source === 'auto').map(f => (
                        <Col xs={24} sm={12} key={f.code}>
                          <Checkbox
                            checked={f.checked}
                            onChange={() => toggleFactor(f.code)}
                            style={{
                              padding: '8px 12px', width: '100%', borderRadius: 6,
                              background: f.checked ? '#e6f4ff' : '#fafafa',
                              border: f.checked ? '1px solid #91caff' : '1px solid #f0f0f0',
                            }}
                          >
                            <Space>
                              <Text>{f.name}</Text>
                              <Tag color={f.score >= 3 ? 'red' : f.score >= 2 ? 'orange' : 'blue'}>
                                +{f.score}
                              </Tag>
                            </Space>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>

                    <Divider />

                    <Text strong style={{ display: 'block', marginBottom: 8, color: '#722ed1' }}>
                      手动评估因子 (需医护判断)
                    </Text>
                    <Row gutter={[8, 8]}>
                      {factors.filter(f => f.source === 'manual').map(f => (
                        <Col xs={24} sm={12} key={f.code}>
                          <Checkbox
                            checked={f.checked}
                            onChange={() => toggleFactor(f.code)}
                            style={{
                              padding: '8px 12px', width: '100%', borderRadius: 6,
                              background: f.checked ? '#f9f0ff' : '#fafafa',
                              border: f.checked ? '1px solid #d3adf7' : '1px solid #f0f0f0',
                            }}
                          >
                            <Space>
                              <Text>{f.name}</Text>
                              <Tag color={f.score >= 3 ? 'red' : f.score >= 2 ? 'orange' : 'blue'}>
                                +{f.score}
                              </Tag>
                            </Space>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                style={{
                  border: `2px solid ${riskCfg.color}`,
                  background: riskCfg.bg,
                  position: 'sticky',
                  top: 80,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">VTE 风险等级</Text>
                  <div style={{ margin: '12px 0' }}>
                    <Tag color={riskCfg.color} style={{ fontSize: 22, padding: '6px 24px' }}>
                      {riskCfg.label}
                    </Tag>
                  </div>
                  <Text style={{ fontSize: 48, fontWeight: 'bold', color: riskCfg.color }}>
                    {totalScore}
                  </Text>
                  <Text style={{ fontSize: 18, color: '#8c8c8c' }}> 分</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {scaleType.toUpperCase()} 量表 | 已选 {factors.filter(f => f.checked).length} 项因子
                    </Text>
                  </div>
                </div>

                <Divider />

                <div>
                  <Text strong>已选因子:</Text>
                  <div style={{ marginTop: 8 }}>
                    {factors.filter(f => f.checked).length === 0 ? (
                      <Text type="secondary">请勾选左侧评估因子</Text>
                    ) : (
                      factors.filter(f => f.checked).map(f => (
                        <Tag key={f.code} color="blue" style={{ marginBottom: 4 }}>
                          {f.name} (+{f.score})
                        </Tag>
                      ))
                    )}
                  </div>
                </div>

                <Divider />

                <Text type="secondary" style={{ fontSize: 12 }}>
                  {scaleType === 'caprini'
                    ? '0-1分: 低危 | 2分: 中危 | 3-4分: 高危 | ≥5分: 极高危'
                    : '<4分: 低危 | ≥4分: 高危'
                  }
                </Text>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
              下一步: 出血风险评估 →
            </Button>
          </div>
        </>
      )}

      {currentStep === 1 && (
        <Card title="出血风险评估">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>
                IMPROVE 出血风险评分
              </Text>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text>出血评分 (0-14分):</Text>
                  <InputNumber
                    min={0} max={14}
                    value={bleedingScore}
                    onChange={v => setBleedingScore(v || 0)}
                    style={{ marginLeft: 8, width: 80 }}
                    size="large"
                  />
                </div>
                <Alert
                  message={
                    bleedingRiskLevel === 'high' ? '出血高危 — 禁用药物抗凝' :
                    bleedingRiskLevel === 'moderate' ? '出血中危 — 谨慎使用抗凝药' :
                    '出血低危 — 可安全使用抗凝药'
                  }
                  type={bleedingRiskLevel === 'high' ? 'error' : bleedingRiskLevel === 'moderate' ? 'warning' : 'success'}
                  showIcon
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  评分标准: 活动性消化道溃疡(+4.5), 入院前3个月内出血(+4), 血小板&lt;50×10⁹/L(+4),
                  肝功能不全(INR&gt;1.5)(+2.5), 中心静脉置管(+2), ICU住院(+2.5), 肾功能不全(GFR&lt;30)(+1)
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Card
                style={{
                  border: `2px solid ${riskCfg.color}`,
                  background: riskCfg.bg,
                  textAlign: 'center',
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">VTE风险</Text>
                    <div>
                      <Tag color={riskCfg.color} style={{ fontSize: 16, padding: '4px 16px', marginTop: 4 }}>
                        {riskCfg.label} ({totalScore}分)
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">出血风险</Text>
                    <div>
                      <Tag
                        color={bleedingRiskLevel === 'high' ? 'red' : bleedingRiskLevel === 'moderate' ? 'orange' : 'green'}
                        style={{ fontSize: 16, padding: '4px 16px', marginTop: 4 }}
                      >
                        {riskLevelConfig[bleedingRiskLevel]?.label || '低危'} ({bleedingScore}分)
                      </Tag>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div style={{ textAlign: 'left' }}>
                  <Text strong><MedicineBoxOutlined /> 推荐预防方案: </Text>
                  <Tag color="blue" style={{ fontSize: 14 }}>{recommendation.type}</Tag>
                  <div style={{ marginTop: 8 }}>
                    {recommendation.measures.map((m, i) => (
                      <Tag key={i} style={{ marginBottom: 4 }}>{m}</Tag>
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <WarningOutlined /> {recommendation.note}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Space size="large">
              <Button size="large" onClick={() => setCurrentStep(0)}>
                ← 返回修改因子
              </Button>
              <Button type="primary" size="large" onClick={() => setCurrentStep(2)}>
                下一步: 确认提交 →
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="确认评估结果">
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="患者">{patient.name}</Descriptions.Item>
                <Descriptions.Item label="床号">{patient.bedNo}</Descriptions.Item>
                <Descriptions.Item label="评估量表">{scaleType.toUpperCase()}</Descriptions.Item>
                <Descriptions.Item label="触发事件">
                  {triggerEvents.find(e => e.value === triggerEvent)?.label}
                </Descriptions.Item>
                <Descriptions.Item label="VTE评分">
                  <Text strong style={{ color: riskCfg.color, fontSize: 18 }}>{totalScore} 分</Text>
                </Descriptions.Item>
                <Descriptions.Item label="VTE风险等级">
                  <Tag color={riskCfg.color} style={{ fontSize: 14 }}>{riskCfg.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="出血评分">{bleedingScore} 分</Descriptions.Item>
                <Descriptions.Item label="出血风险">
                  <Tag color={bleedingRiskLevel === 'high' ? 'red' : bleedingRiskLevel === 'moderate' ? 'orange' : 'green'}>
                    {riskLevelConfig[bleedingRiskLevel]?.label || '低危'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="评估因子" span={2}>
                  {factors.filter(f => f.checked).map(f => (
                    <Tag key={f.code} color="blue" style={{ marginBottom: 4 }}>{f.name} (+{f.score})</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="推荐预防方案" span={2}>
                  <Tag color="geekblue" style={{ fontSize: 13 }}>{recommendation.type}</Tag>
                  {recommendation.measures.map((m, i) => <Tag key={i}>{m}</Tag>)}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 16 }}>
                <Text strong>备注:</Text>
                <TextArea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="可填写补充说明..."
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>

            <Col xs={24} md={8}>
              <Card style={{ border: `2px solid ${riskCfg.color}`, background: riskCfg.bg, textAlign: 'center' }}>
                <Tag color={riskCfg.color} style={{ fontSize: 24, padding: '8px 32px' }}>
                  {riskCfg.label}
                </Tag>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 56, fontWeight: 'bold', color: riskCfg.color }}>{totalScore}</Text>
                  <Text style={{ fontSize: 20, color: '#8c8c8c' }}> 分</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Space size="large">
              <Button size="large" onClick={() => setCurrentStep(1)}>
                ← 返回修改
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                提交评估
              </Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssessmentFormPage;
