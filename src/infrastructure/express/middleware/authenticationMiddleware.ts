import * as express from 'express';
import { NextFunction } from 'express';
import { authorizationService } from '../../modules/authorizationService';

export function authenticationMiddleware(req: express.Request, res: express.Response, next: NextFunction) {
	const token = req.headers['authorization'] as string;
	const isAuth = authorizationService.verify(token);

	if (req.path === '/shop/create') return next();
	if (req.path === '/transaction/confirmPayment') return next();
	if (req.path.startsWith('/transaction') && req.path !== '/transaction/create') return next();

	if (isAuth) return next();
	res.json({ status: 'error', errorText: 'Не авторизован' });
}