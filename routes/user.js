import { Router } from 'express';
import User from '../models/user';

const router = Router();

router.get('/users', (req, res) => {
  console.log('all users');
});

export default router;
