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
		this.setupStaticFiles(); // Добавляем установку статики
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
		this.app.use('/transaction', transactionRouter);
	}

	private setupStaticFiles() {
		this.app.use(express.static('static'));
	}

	start(port: number) {
		this.app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	}
}
export const expressApp = new ExpressApp()