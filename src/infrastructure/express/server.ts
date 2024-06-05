import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors"
import { authenticationMiddleware } from './middleware/authenticationMiddleware';
import { transactionRouter } from './routes/TransactionRouter';
import { shopRouter } from './routes/ShopRouter';

export class ExpressApp {
	private app: express.Express;

	constructor() {
		this.initApp();
	}

	private initApp() {
		this.app = express();
		this.setupMiddleware();
		this.setupRoutes();
	}

	private setupMiddleware() {
		this.app.use(cors({
			origin: "*",
			methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
			allowedHeaders: ['Content-Type', 'Authorization'],
		}));
		this.app.use(bodyParser.json());
		this.app.use(authenticationMiddleware);
	}

	private setupRoutes() {
		this.app.use('/shop', shopRouter);
		this.app.use('/transaction', transactionRouter, );
	}

	start(port: number) {
		this.app.listen(port, () => {
			console.log('Server is running on port 3000');
		});
	}
}
export const expressApp = new ExpressApp()