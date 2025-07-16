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

router.use(getTrainings);
router.use(getTrainingsByDate);
router.use(getLastTemplate);
router.use(createTraining);
router.use(deleteTraining);
router.use(updateStatus);
router.use(markAttendance);
router.use(getStats);
router.use(getVisited);
router.use(getNextTraining);

export default router;
