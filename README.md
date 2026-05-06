# VTE 预防管理系统

静脉血栓栓塞症（VTE）预防管理平台 — 医疗信息化系统

## 快速启动

### 1. 安装依赖

```bash
cd server && npm install
cd ../client && npm install
```

### 2. 启动后端

```bash
cd server && npm run dev
# 后端运行在 http://localhost:3001
```

### 3. 启动前端

```bash
cd client && npm start
# 前端运行在 http://localhost:3000
```

## 默认登录账号

| 用户名 | 密码 | 角色 | 科室 | 数据权限范围 |
|---|---|---|---|---|
| `admin` | `admin123` | 系统管理员 | 全院 | 全院所有患者 |
| `zhangwei` | `123456` | 科室主任 | 骨科 | 本科室所有患者 |
| `liming` | `123456` | 主治医师 | 骨科 | 本医疗组患者 |
| `wangjie` | `123456` | 住院医师 | 骨科 | 仅自己负责的患者 |
| `zhaomin` | `123456` | 护士长 | 骨科 | 本科室所有患者 |
| `liuna` | `123456` | 护士 | 骨科 | 仅自己负责的患者 |

## 角色权限说明

| 角色 | 查看范围 | 可评估 | 可开医嘱 | 查看统计 | 管理用户 |
|---|---|---|---|---|---|
| 系统管理员 | 全院 | ✗ | ✗ | ✓ | ✓ |
| 科室主任 | 本科室 | ✓ | ✓ | ✓ | ✗ |
| 主治医师 | 本医疗组 | ✓ | ✓ | ✓ | ✗ |
| 住院医师 | 自己负责 | ✓ | ✗ | ✗ | ✗ |
| 护士长 | 本科室 | ✓ | ✗ | ✓ | ✗ |
| 护士 | 自己负责 | ✓ | ✗ | ✗ | ✗ |

## HIS 数据库对接

当前使用模拟数据，对接真实 HIS 系统时：

1. 实现 `server/src/types/index.ts` 中的 `IHisDataSource` 接口
2. 在 `server/src/services/his-datasource.ts` 中替换 `MockHisDataSource` 为真实实现
3. 配置环境变量：

```env
HIS_DB_HOST=your-his-server
HIS_DB_PORT=1521
HIS_DB_NAME=HIS
HIS_DB_USER=your-username
HIS_DB_PASS=your-password
```

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design 5 + ECharts
- **后端**: Node.js + Express + TypeScript
- **认证**: JWT Token
- **数据**: 模拟数据（预留 HIS 接口）

## 项目结构

```
├── server/                 # 后端
│   └── src/
│       ├── data/           # 模拟数据
│       ├── middleware/     # 认证中间件
│       ├── routes/         # API 路由
│       ├── services/       # 业务服务层
│       ├── types/          # 类型定义
│       └── index.ts        # 入口
├── client/                 # 前端
│   └── src/
│       ├── components/     # 组件
│       ├── contexts/       # React Context
│       ├── pages/          # 页面
│       ├── services/       # API 调用
│       └── types/          # 类型定义
└── README.md
```
