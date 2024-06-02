import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class FINISHED_STATE extends TransactionSTATEClass {
	destroy(): void {
		this.transaction.state = new DELETED_STATE(this.transaction);
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.FINISHED_STATE;
	}

	backToSelectBank(): void {
	}

	cancelTransaction(): void {
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean | void> {
	}

	confirmTransaction(): void {
	}


	goToRequisites(): void {
	}

	selectBank(connection: IConnection): void {
	}

}