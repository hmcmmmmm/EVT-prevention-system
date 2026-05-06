import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import assessmentRoutes from './routes/assessments';
import statsRoutes from './routes/stats';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`VTE 预防管理系统后端服务启动 → http://localhost:${PORT}`);
  console.log('默认账号: admin / admin123 (管理员)  |  zhangwei / 123456 (科室主任)');
});
