import { IShopService } from '../services/interface/types';
import { CreateShopDTO } from '../repository/DTO/shopRepositoryDTO';
import { DoInfo } from '../../../env/types';
import { shopValidator } from '../validators/ShopValidator';
import { bankHelper } from '../../infrastructure/modules/bankHelper';
import { luhnCheck } from '../../../env/helpers/luhnCheck';
import { shopService } from '../services/ShopService';
import { IShopUseCases } from './interfaces/shop';

export class ShopUseCases implements IShopUseCases{
	constructor(
		private readonly shopService: IShopService,
	) {}

	create(dto: CreateShopDTO): DoInfo {
		const validResult = shopValidator.nameValidate(dto.name)
		if (!validResult.valid) {
			return {
				success: false,
				error: validResult.errors.join(" "),
			};
		}
		return {
			success: true,
			error: '',
			data: this.shopService.create(dto)
		};
	}

	async delete(id: string): Promise<DoInfo> {
		if (!await this.shopService.getByID(id)) {
			return {
				success: false,
				error: 'Магазин не найден',
			};
		}
		this.shopService.delete(id)
		return {
			success: true,
			error: '',
		};
	}

	async getByID(id: string): Promise<DoInfo> {
		const shop = await this.shopService.getByID(id);
		if (!shop) {
			return {
				success: false,
				error: 'Магазин не найден',
			};
		}
		return {
			success: true,
			error: '',
			data: shop,
		};
	}

	async setName(id: string, name: string): Promise<DoInfo> {
		const shop = await this.shopService.getByID(id);
		if (!shop) {
			return {
				success: false,
				error: 'Магазин не найден',
			};
		}
		this.shopService.setName(id, name)
		return {
			success: true,
			error: '',
		};
	}

	async setRequisites(id: string, bankType: string, requisites: number | string): Promise<DoInfo> {
		const shop = await this.shopService.getByID(id);
		const banks = {
			myBank: async (requisite: number) => {
				const connection = bankHelper.getBankConnectionByName('myBank');
				if (!luhnCheck(requisite.toString())) return false;
				if (!await connection.checkExistingRequisites(requisites.toString())) return false;
				return true;
			},
		};

		const bankFunction = banks[bankType];

		if (typeof bankFunction !== 'function') {
			return {
				success: false,
				error: 'Некорректный тип банка',
			};
		}

		const isValid = await bankFunction(requisites);

		if (!shop) {
			return {
				success: false,
				error: 'Магазин не найден',
			};
		}

		if (!isValid) {
			return {
				success: false,
				error: 'Реквизиты некорректны или недостаточный баланс',
			};
		}

		this.shopService.setRequisites(id, bankType, requisites);

		return {
			success: true,
			error: '',
		};
	}
}
export const shopUseCases = new ShopUseCases(shopService)