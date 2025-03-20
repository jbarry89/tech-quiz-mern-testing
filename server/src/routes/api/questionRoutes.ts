import express from 'express';
import {getRandomQuestions} from '../../controllers/questionController.js';

const router = express.Router();

router.route('/random').get(getRandomQuestions);

export default router;
