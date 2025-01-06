import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  res.status(200).json({ message: 'Logout successful' });
}