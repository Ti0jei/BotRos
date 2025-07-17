import express from 'express';

import getTrainings from './getTrainings.mjs';
import getTrainingsByDate from './getTrainingsByDate.mjs';
import getLastTemplate from './getLastTemplate.mjs';
import createTraining from './createTraining.mjs';
import deleteTraining from './deleteTraining.mjs';
import updateStatus from './updateStatus.mjs';
import markAttendance from './markAttendance.mjs';
import getStats from './getStats.mjs';
import getVisited from './getVisited.mjs';
import getNextTraining from './getNextTraining.mjs';

const router = express.Router();

router.get('/', getTrainings);
router.get('/date/:date', getTrainingsByDate);
router.get('/last/:userId', getLastTemplate);
router.post('/', createTraining);
router.delete('/:id', deleteTraining);
router.patch('/:id', updateStatus); // ✅ исправлено
router.patch('/:id/attended', markAttendance);
router.get('/stats/:userId', getStats);
router.get('/visited/:userId', getVisited);
router.get('/next/:userId', getNextTraining);

export default router;
