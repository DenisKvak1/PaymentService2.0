import { IShopService } from './interface/types';
import { CreateShopDTO } from '../repository/DTO/shopRepositoryDTO';
import { IShopRepository } from '../repository/IShopRepository';
import { IShop } from '../models/Shop';
import { shopInMemoryRepository } from '../../infrastructure/database/repository/ShopInMemoryRepository';

export class ShopService implements IShopService {
	private shopRepository: IShopRepository;

	constructor(shopRepository: IShopRepository) {
		this.shopRepository = shopRepository;
	}

	create(dto: CreateShopDTO): IShop {
		return this.shopRepository.create(dto);
	}

	delete(id: string): void {
		this.shopRepository.delete(id);
	}

	setName(id: string, name: string): void {
		this.shopRepository.update(id, { name });
	}

	setRequisites(id: string, bankType: string, requisites: string | number): void {
		const requisitesBlank: { [key: string]: string | number } = {};
		requisitesBlank[bankType] = requisites;
		this.shopRepository.update(id, { requisites: requisitesBlank });
	}

	async getByID(id: string): Promise<IShop | undefined> {
		return this.shopRepository.getByID(id)
	}
}
export const shopService = new ShopService(shopInMemoryRepository)