import express from 'express';
import { config } from '../config';

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({
    ...config
  });
});

export default router;
