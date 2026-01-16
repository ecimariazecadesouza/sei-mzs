import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export class AuthController {
    async setupStatus(req: Request, res: Response) {
        try {
            const userCount = await prisma.user.count();
            return res.json({ needsSetup: userCount === 0 });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to check setup status' });
        }
    }

    async setupAdmin(req: Request, res: Response) {
        const { email, password, name } = req.body;

        try {
            const userCount = await prisma.user.count();
            if (userCount > 0) {
                return res.status(403).json({ error: 'Setup already completed' });
            }

            const hashedPassword = await bcrypt.hash(password, 8);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'admin_ti',
                },
            });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );

            const { password: _, ...userWithoutPassword } = user;
            console.log('Setup completed successfully for:', email);
            return res.json({ user: userWithoutPassword, token });
        } catch (error: any) {
            console.error('Setup Error Detail:', error);
            return res.status(500).json({
                error: 'Setup failed',
                detail: error.message,
                code: error.code
            });
        }
    }

    async register(req: Request, res: Response) {
        const { email, password, name, role } = req.body;

        try {
            const userExists = await prisma.user.findUnique({
                where: { email },
            });

            if (userExists) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 8);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: role || 'guest',
                },
            });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );

            // Don't send password back
            const { password: _, ...userWithoutPassword } = user;

            return res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );

            const { password: _, ...userWithoutPassword } = user;

            return res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Login failed' });
        }
    }

    async me(req: Request, res: Response) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: (req as any).userId },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { password: _, ...userWithoutPassword } = user;
            return res.json({ user: userWithoutPassword });

        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
    }
}
