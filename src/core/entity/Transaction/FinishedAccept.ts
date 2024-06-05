import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class FINISHED_SUCCESS_STATE extends TransactionSTATEClass {
	destroy(): void {
		this.transaction.state = new DELETED_STATE(this.transaction);
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.FINISHED_SUCCESS_STATE;
	}

	backToSelectBank(): void {
	}

	cancelTransaction(): void {
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean> {
		return false;
	}

	confirmTransaction(): void {
	}


	goToRequisites(): void {
	}

	async selectBank(connection: IConnection): Promise<boolean> {
		return false;
	}
}