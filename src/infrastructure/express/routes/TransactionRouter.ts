import express from "express";
import { httpTransactionController } from '../../controllers/HTTPTransactionController';

export const transactionRouter = express.Router()

transactionRouter.post('/create', (req, res)=> httpTransactionController.create(req, res))
transactionRouter.get('/getInfo/:id', (req, res)=> httpTransactionController.getTransactionInfo(req, res))
transactionRouter.get('/getAvailableBanks/:id', (req, res)=> httpTransactionController.getAvailableBanks(req, res))
transactionRouter.post('/selectBank', (req, res)=> httpTransactionController.selectBank(req, res))
transactionRouter.post('/confirmPayment', (req, res)=> httpTransactionController.confirmPayment(req, res))
transactionRouter.post('/cancel', (req, res)=> httpTransactionController.cancel(req, res))
