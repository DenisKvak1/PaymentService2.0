import express from 'express';
import { httpShopController } from '../../controllers/HTTPShopController';

export const shopRouter = express.Router()

shopRouter.post('/create', (req, res)=> httpShopController.create(req, res))
shopRouter.post('/setRequisites', (req, res)=> httpShopController.setRequisites(req, res))