import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../data/mock-data';
import { LoginRequest, LoginResponse, JwtPayload, ROLE_PERMISSIONS } from '../types';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../middleware/auth';

export class AuthService {
  async login(req: LoginRequest): Promise<LoginResponse | null> {
    const user = users.find(u => u.username === req.username && u.isActive);
    if (!user) return null;

    const valid = await bcrypt.compare(req.password, user.passwordHash);
    if (!valid) return null;

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
      teamId: user.teamId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { passwordHash: _, ...safeUser } = user;
    return {
      token,
      user: safeUser,
      permissions: ROLE_PERMISSIONS[user.role],
    };
  }
}
