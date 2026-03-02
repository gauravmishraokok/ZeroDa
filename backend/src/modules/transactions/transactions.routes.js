import express from "express";
import { addTransaction, fetchTransaction, removeTransaction } from "./transaction.controller.js";

import { authenticate } from './../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, addTransaction);
router.get('/', authenticate, fetchTransaction);
router.delete('/:id', authenticate, removeTransaction);

export default router;
