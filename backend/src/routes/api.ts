import express from 'express';
import { config } from '../config';

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({
    gameRestartDelaySeconds: config.gameRestartDelaySeconds,
    timeLimitSeconds: config.timeLimitSeconds,
    winScore: config.winScore,
    playerLimit: config.playerLimit,
    maxRounds: config.maxRounds
  });
});

export default router;