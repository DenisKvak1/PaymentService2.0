import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class DELETED_STATE extends TransactionSTATEClass {
	getName(): TransactionSTATE {
		return TransactionSTATE.DELETED_STATE
	}

	backToSelectBank(): void {
	}

	cancelTransaction(): void {
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean | void> {
	}

	confirmTransaction(): void {
	}

	destroy(): void {
	}

	goToRequisites(): void {
	}

	selectBank(connection: IConnection): void {
	}

}