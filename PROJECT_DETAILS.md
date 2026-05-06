# VTE 预防管理系统 — 详细项目构建文档

## 目录

1. [项目背景与调研](#1-项目背景与调研)
2. [系统架构设计](#2-系统架构设计)
3. [核心业务模块与流程](#3-核心业务模块与流程)
4. [数据库与数据模型设计](#4-数据库与数据模型设计)
5. [权限与安全机制](#5-权限与安全机制)
6. [后端服务实现 (Node.js + Express)](#6-后端服务实现)
7. [前端应用实现 (React + Ant Design)](#7-前端应用实现)
8. [系统部署与 HIS 对接方案](#8-系统部署与-his-对接方案)

---

## 1. 项目背景与调研

静脉血栓栓塞症（VTE）包括深静脉血栓形成（DVT）和肺血栓栓塞症（PE），是医院内非预期死亡的重要原因。本项目旨在打造一个医疗级别的 VTE 预防管理系统，全面提升医院对住院患者的 VTE 风险管理能力。

### 1.1 调研结论参考
在项目启动前，我们对比了全球领先系统（如英国 NHS 的 ORBIS U EPR，美国的 Epic BPA，以及中国市场的惠每 AI、讯飞医疗系统），提炼出以下必须要具备的核心能力：
1. **基于电子病历 (EMR/HIS) 的临床决策支持 (CDS)**
2. **多量表支持 (Caprini, Padua)**
3. **闭环管理 (评估 -> 推荐 -> 预防执行 -> 随访)**
4. **实时预警与监控**
5. **符合国家质控标准的数据报表**

---

## 2. 系统架构设计

系统采用主流的 **B/S (Browser/Server) 架构**，前后端分离。这种架构在医疗信息系统中最被推崇，因为它**无需在医护端安装任何客户端软件**，支持 PC、平板和手机跨端访问，维护和升级均集中在服务器端完成。

### 2.1 技术栈选型
*   **前端**：React 18, TypeScript, Ant Design 5 (UI 库), React Router 6, ECharts (数据可视化), Axios
*   **后端**：Node.js, Express, TypeScript, JWT (认证), bcryptjs (加密)
*   **数据存储**：当前使用内存模拟数据（Mock Data），架构层已抽象出 `IHisDataSource` 接口，随时可无缝对接 Oracle / SQL Server / MySQL 等真实的 HIS 数据库。

### 2.2 目录结构
```text
c:\Data\Computer\cursor_output\EVT 预防管理系统
├── client/                     # 前端工程
│   ├── public/                 # 静态资源 (index.html)
│   ├── src/
│   │   ├── components/         # 公共组件 (AppLayout.tsx 等)
│   │   ├── contexts/           # React Context (AuthContext.tsx - 全局状态)
│   │   ├── pages/              # 业务页面 (Login, Dashboard, Stats 等)
│   │   ├── services/           # API 请求封装 (api.ts)
│   │   ├── types/              # 前端 TypeScript 类型定义
│   │   ├── App.tsx             # 路由配置
│   │   ├── index.css           # 全局样式 (行高亮等定制样式)
│   │   └── index.tsx           # React 入口文件
│   ├── package.json            # 前端依赖配置 (配置了 proxy 解决跨域)
│   └── tsconfig.json
├── server/                     # 后端工程
│   ├── src/
│   │   ├── data/               # 模拟数据库 (mock-data.ts)
│   │   ├── middleware/         # Express 中间件 (auth.ts - JWT 校验与角色拦截)
│   │   ├── routes/             # API 路由 (auth, patients, assessments, stats, followup, users)
│   │   ├── services/           # 业务逻辑层 (处理评估、统计、权限过滤等)
│   │   ├── types/              # 后端 TypeScript 类型定义
│   │   └── index.ts            # Express 启动文件
│   ├── package.json
│   └── tsconfig.json
└── README.md                   # 快速启动文档
```

---

## 3. 核心业务模块与流程

系统包含 6 个核心业务模块：

### 3.1 登录与权限管理
*   **登录机制**：账号密码校验，返回 JWT Token。
*   **6 大角色定义**：系统管理员、科室主任、主治医师、住院医师、护士长、护士。
*   **数据范围隔离**：全院可见、本科室可见、本医疗组可见、仅自己负责的患者可见。
*   **功能权限**：控制谁可以发起评估、开立医嘱、查看统计报表等。

### 3.2 首页监控仪表盘
*   展示核心运营数据：在院人数、已评估人数、预防率、预警数量。
*   可视化图表：VTE 风险分级饼图，科室评估完成率柱状图。
*   提供全院科室数据的横向对比。

### 3.3 患者管理与详情
*   **患者列表**：支持多条件搜索，直观展示每个患者当前的风险等级（颜色标签标识）和评估状态。未评估的患者行会标黄，极高危患者行会标红。
*   **患者详情（360度视图）**：
    *   **病历摘要**：基本信息与主要诊断。
    *   **风险雷达**：突出显示当前风险分数和等级。
    *   **时间轴**：按时间顺序记录每一次的风险评估历史。
    *   **预防方案**：追踪为患者制定的干预措施状态。
    *   **检验异常**：自动高亮展示异常的凝血或血小板指标（如 D-二聚体升高）。

### 3.4 VTE 风险交互评估表单
*   **核心算法**：支持 Caprini（外科）和 Padua（内科）量表。
*   **自动+手动因子**：系统自动从 HIS 提取客观指标（如年龄、恶性肿瘤、特定手术史），医生手动补充临床主观指标（如卧床时间、病史）。
*   **出血风险联动**：同步使用 IMPROVE 出血量表评估患者出血风险。
*   **智能决策支持 (CDS)**：基于 VTE 风险 + 出血风险，自动推导预防方案（基础、物理、药物或联合预防），并在有出血高危时弹出抗凝禁忌警告。

### 3.5 预警中心
*   **主动安全网**：扫描并标记所有异常情况。
*   **预警类型**：入院 24h 超时未评估、高危未采取预防措施、D-二聚体等关键检验指标异常、病情变化需复评。
*   **闭环处理**：预警必须被人工"处理"并记录。

### 3.6 质控统计与报表
*   严格对照国家 VTE 防治中心认证标准。
*   **核心指标计算**：评估率（目标≥90%）、24h评估及时率（目标≥85%）、预防率（目标≥80%）。
*   **丰富图表**：7天趋势折线图、科室对比雷达图、年龄段风险分布柱状图、高频风险因子横向条形图。

### 3.7 出院随访管理 (扩展增强模块)
*   记录患者出院后的随访信息。
*   追踪核心结局：用药依从性、VTE 事件发生情况、出血事件发生情况。

---

## 4. 数据库与数据模型设计

系统通过 TypeScript 接口严格定义了数据模型。在当前的演练环境中，这些模型以 JSON 数组形式驻留在 `server/src/data/mock-data.ts` 中。

### 4.1 用户与组织架构
*   `User`: id, username, passwordHash, role, departmentId, teamId, title.
*   `Department`: id, name, code, type (外科/内科/ICU等), bedCount.
*   `MedicalTeam`: 医疗小组，包含组长和成员（用于主治医师查看本组患者）。

### 4.2 临床数据 (对接 HIS 的标的)
*   `Patient`: 包含病历号、床号、主治医生 ID、责任护士 ID、诊断列表、入院时间等。
*   `LabResult`: 检验结果记录（项目、值、参考范围、是否异常）。

### 4.3 评估与预防核心数据
*   `RiskAssessment` (评估记录):
    *   `scaleType`: 使用的量表类型。
    *   `totalScore`, `riskLevel`: 总分与 VTE 风险等级。
    *   `bleedingScore`, `bleedingRisk`: 出血评估结果。
    *   `factors`: 包含此次评估选中的所有具体因子及分值。
    *   `triggerEvent`: 触发此次评估的原因（入院、手术、转科等）。
*   `AssessmentFactor` (因子字典): 预定义的因子库，区分 `auto`（系统提取）和 `manual`（人工勾选）。
*   `PreventionPlan` (预防方案): 关联评估记录，包含具体的措施列表（如弹力袜、低分子肝素）及执行状态。

---

## 5. 权限与安全机制

我们实现了极其细粒度的权限控制矩阵。核心逻辑在后端的 `auth.ts` 中。

### 5.1 角色定义 (Role Enum)
```typescript
export enum Role {
  ADMIN = 'admin',               // 系统管理员
  DEPT_DIRECTOR = 'dept_director', // 科室主任
  ATTENDING = 'attending',        // 主治医师
  RESIDENT = 'resident',          // 住院医师
  HEAD_NURSE = 'head_nurse',      // 护士长
  NURSE = 'nurse',                // 护士
}
```

### 5.2 数据行级权限 (DataScope)
这是医疗系统的关键，不同人员能看到哪部分患者的数据是受限的：
*   **ALL (全院)**: `ADMIN`。
*   **DEPARTMENT (本科室)**: `DEPT_DIRECTOR` (科室主任), `HEAD_NURSE` (护士长)。只能看到本人所在 `departmentId` 的患者。
*   **TEAM (本医疗组)**: `ATTENDING` (主治医师)。能看到 `teamId` 相同的小组内所有医生负责的患者。
*   **SELF (本人负责)**: `RESIDENT` (住院医师), `NURSE` (护士)。只能看到 `attendingDoctorId` 或 `primaryNurseId` 是本人的患者。

### 5.3 功能级权限
通过 `ROLE_PERMISSIONS` 常量映射控制按钮的显示和接口的调用：
*   `canAssess`: 医生和护士可以评估，管理员不行。
*   `canPrescribe`: 只有具有处方权的医生（主任、主治）可以生成预防医嘱。
*   `canViewStats`: 管理员、科室主任、主治、护士长可以看报表。
*   `canManageUsers`: 仅管理员。

---

## 6. 后端服务实现

后端基于 Express 框架，使用 TypeScript 编写，保证类型安全。

### 6.1 HIS 接口适配器模式
为了方便未来实际部署，系统设计了 `IHisDataSource` 接口（位于 `his-datasource.ts`）。
目前系统使用的是 `MockHisDataSource`。未来实施人员只需编写一个 `RealHisDataSource` 类（连接医院 Oracle/MySQL），实现 `getPatients`, `getLabResults` 等方法，系统业务逻辑层完全不需要改动。

### 6.2 核心 API 设计
*   `POST /api/auth/login`: 验证并签发 JWT (有效期 24h)。
*   `GET /api/patients`: 核心列表接口，在 `PatientService` 中**会根据解析出的 JWT payload 进行 DataScope 数据过滤**，确保越权访问不可能发生。
*   `POST /api/assessments`: 接收前端的因子勾选结果，在服务器端**重新核算分数和风险等级**（防止前端数据篡改），保存并持久化。
*   `GET /api/stats/dashboard` & `GET /api/stats/quality-report`: 复杂的聚合计算服务，实时扫表计算当天的各项质控达成率。

---

## 7. 前端应用实现

前端通过 React 18 和 Ant Design 5 构建了现代化、高响应性的单页应用（SPA）。

### 7.1 上下文与状态管理
使用 `AuthContext` 统一管理登录状态、Token 持久化（保存在 localStorage）和全局权限对象。结合 `ProtectedRoute` 路由守卫拦截未登录访问。

### 7.2 关键页面交互实现
*   **动态评估表单 (`AssessmentFormPage`)**:
    *   页面采用分步式（Steps）设计，降低医生认知负荷。
    *   使用 `useMemo` 监听因子勾选的变化，**实时响应式计算分数**并更新右侧吸顶的（Sticky）风险等级卡片。
    *   通过预设配置对自动提取的因子进行深色高亮显示，与人工补充因子区隔。
*   **图表可视化 (`StatsPage`, `DashboardPage`)**:
    *   使用 `echarts-for-react`。
    *   实现了雷达图（展示科室综合水平评估）、复合折线柱状图（展示趋势及预警数量关系）、横向条形图（展示高发风险因素排行）。
*   **UX 细节提升 (`index.css`)**:
    *   通过注入 CSS 类 (`row-unassessed`, `row-very-high`) 对 Table 中的高危患者行进行全行底色染色，产生强烈的视觉提醒效果，符合医疗急救软件的惯例。

---

## 8. 系统部署与 HIS 对接方案

由于采用纯粹的 B/S 架构，客户端无需安装，所有部署动作都在服务器端完成。

### 8.1 实施对接步骤
1.  **网络互通**：申请医院内网一台物理机或虚拟机。
2.  **对接 HIS/LIS 视图**：请医院信息科提供只读的数据库视图，包含：在院患者基础信息表、医护人员表、检验结果表（重点关注 D-二聚体、血小板、凝血常规）。
3.  **实现适配器**：开发人员在 `server/src/services/his-datasource.ts` 中写入真实的 SQL 查询语句。

### 8.2 部署方式建议
*   **开发测试环境**：
    `npm run build` 打包前端，然后通过 `npm start` 启动 Node.js 服务器。
*   **生产环境 (推荐方案)**：
    1.  使用 PM2 守护进程运行后端的 `dist/index.js`，保证崩溃自启。
    2.  使用 Nginx 反向代理，将前端静态文件挂载到 80/443 端口，并将 `/api` 的请求代理转发到后端的 3001 端口。
    3.  （可选）使用 Docker Compose 将 Node.js 环境、代码和 Nginx 封为镜像，实现一键启动。

---

## 9. 源码级复刻指南（Developer Guide）

如果你希望从零开始，100% 完美复现出本项目的代码结构和交互效果，请严格遵循以下技术规范与核心代码骨架。

### 9.1 确切的项目依赖 (package.json 摘录)

**前端 (client):**
```json
"dependencies": {
  "@ant-design/icons": "^5.5.0",
  "antd": "^5.22.0",
  "axios": "^1.7.0",
  "dayjs": "^1.11.0",
  "echarts": "^5.5.0",
  "echarts-for-react": "^3.0.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.28.0",
  "react-scripts": "5.0.1",
  "typescript": "^4.9.5"
}
```

**后端 (server):**
```json
"dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "express": "^4.21.0",
  "jsonwebtoken": "^9.0.2",
  "uuid": "^10.0.0"
}
```

### 9.2 前端组件树与路由映射

路由由 `react-router-dom` v6 管理，必须采用嵌套路由结构以复用侧边栏菜单：

```text
<BrowserRouter>
  <Routes>
    <!-- 公共路由：如果带有 Token，自动 Navigate 到 '/' -->
    <Route path="/login" element={<LoginPage />} />

    <!-- 私有路由：检查 AuthContext 中的 isAuthenticated 状态，无 Token 踢回 /login -->
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/patients" element={<PatientListPage />} />
      <Route path="/patients/:id" element={<PatientDetailPage />} />
      <Route path="/patients/:id/assess" element={<AssessmentFormPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/followup" element={<FollowupPage />} />
      <Route path="/users" element={<UserManagementPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### 9.3 核心数据结构与通信协议 (API Contract)

前端 Axios 配置需要拦截器，将 `localStorage.getItem('vte_token')` 注入 Header：`Authorization: Bearer <token>`。

#### 1. 登录协议
*   **Request**: `POST /api/auth/login` | Body: `{ username, password }`
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbG...",
        "user": { "id": "...", "name": "...", "role": "dept_director", "departmentId": "..." },
        "permissions": { "dataScope": "dept", "canAssess": true, "canViewStats": true }
      }
    }
    ```

#### 2. VTE 风险算法实现要求
后端必须在 `AssessmentService.calculateRiskLevel` 方法中硬编码算分逻辑，不允许前端提交等级：
*   **Caprini 量表**: `score <= 1` (低危), `2` (中危), `3-4` (高危), `>=5` (极高危)。
*   **Padua 量表**: `<4` (低危), `>=4` (高危)。
*   **IMPROVE 出血风险**: `<4` (低危), `4-6` (中危), `>=7` (高危)。

#### 3. 实时预警数据结构
*   **Response**: `GET /api/assessments/alerts`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "alert-001",
          "patientId": "pat-003",
          "type": "unassessed", // 或 high_risk, lab_abnormal
          "severity": "red",    // 或 yellow
          "message": "患者XXX入院超过24h未完成VTE风险评估",
          "status": "pending"
        }
      ]
    }
    ```

### 9.4 样式定制规范 (CSS)
为了实现医疗软件的警示感，必须在前端全局注入以下 CSS 类，并在 `<Table>` 的 `rowClassName` 中绑定：
```css
/* 未评估患者行：淡黄色提醒 */
.row-unassessed { background-color: #fff7e6 !important; }
/* 高危行：浅红色 */
.row-high { background-color: #fff1f0 !important; }
/* 极高危/紧急预警行：深粉红色 */
.row-very-high, .row-red-alert { background-color: #ffccc7 !important; }
/* 检验异常行：橙色 */
.row-abnormal { background-color: #fff2e8 !important; }
/* 停用用户行：半透明 */
.row-inactive { opacity: 0.5; background-color: #fafafa !important; }
```

### 9.5 权限验证核心中间件 (Express Middleware)
复现后端时，必须实现高阶函数工厂来保护特定路由：
```typescript
export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 假设 req.user 已经由 verifyToken 中间件挂载
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: '权限不足' });
      return;
    }
    next();
  };
}

// 示例用法：仅限主任和医生开预防医嘱
router.post('/prevention', requireRoles(Role.DEPT_DIRECTOR, Role.ATTENDING), ...);
```

### 9.6 真实数据库落地指南 (SQL Schema)

当从 Mock 切换到真实数据库（如 PostgreSQL / MySQL）时，请参考以下核心建表语句创建底层数据结构：

```sql
-- 1. 患者风险评估主表
CREATE TABLE vte_assessments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    scale_type VARCHAR(20) NOT NULL, -- 'caprini', 'padua'
    total_score INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'moderate', 'high', 'very_high'
    bleeding_score INT,
    bleeding_risk VARCHAR(20),
    trigger_event VARCHAR(50) NOT NULL,
    assessor_id VARCHAR(36) NOT NULL,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 2. 评估因子明细表 (1对多)
CREATE TABLE vte_assessment_factors (
    id SERIAL PRIMARY KEY,
    assessment_id VARCHAR(36) REFERENCES vte_assessments(id) ON DELETE CASCADE,
    factor_code VARCHAR(50) NOT NULL,
    factor_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    source VARCHAR(10) NOT NULL -- 'auto' or 'manual'
);

-- 3. 预防方案表
CREATE TABLE vte_prevention_plans (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(36) REFERENCES vte_assessments(id),
    patient_id VARCHAR(50) NOT NULL,
    plan_type VARCHAR(20) NOT NULL, -- 'basic', 'physical', 'drug', 'combined'
    status VARCHAR(20) DEFAULT 'recommended',
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 预警事件表
CREATE TABLE vte_alerts (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'unassessed', 'lab_abnormal', etc.
    severity VARCHAR(10) NOT NULL,   -- 'red', 'yellow'
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handled_by VARCHAR(36),
    handled_at TIMESTAMP
);

-- 5. 出院随访记录表
CREATE TABLE vte_followups (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    discharge_date DATE NOT NULL,
    followup_date DATE NOT NULL,
    followup_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    days_after_discharge INT NOT NULL,
    anticoagulant_compliance VARCHAR(20),
    vte_occurred BOOLEAN DEFAULT FALSE,
    bleeding_occurred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    followed_by VARCHAR(36),
    completed_at TIMESTAMP
);

-- 建立必要的索引加速报表统计
CREATE INDEX idx_assessments_patient_id ON vte_assessments(patient_id);
CREATE INDEX idx_assessments_created_at ON vte_assessments(assessed_at);
CREATE INDEX idx_alerts_status ON vte_alerts(status);
```
