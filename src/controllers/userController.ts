import { Request, Response } from 'express';
import User from '@/models/user';
import { generateToken } from '@/config/jwt';
import type { ILoginRequest, IRegisterRequest, IResponseAuth } from './types/authRoutes';

export const register = async (req: Request<{}, {}, IRegisterRequest>, res: Response<IResponseAuth>): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).send({ message: 'Username, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).send({ message: 'Username already exists' });
      return;
    }

    await User.create({ username, email, password });
    res.status(201).send({ message: 'User created' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error.message });
    } else {
      res.status(400).send({ message: 'An unknown error occurred' });
    }
  }
};

export const login = async (req: Request<{}, {}, ILoginRequest>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).send('Invalid credentials');
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).send('Invalid credentials');
      return;
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.json({ token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send('An unknown error occurred');
    }
  }
};
