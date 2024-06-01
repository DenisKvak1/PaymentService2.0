import { IShopService } from './interface/types';
import { CreateShopDTO } from '../repository/DTO/shopRepositoryDTO';
import { ShopRepository } from '../repository/ShopRepository';
import { IShop } from '../models/Shop';

export class ShopService implements IShopService {
	private shopRepository: ShopRepository;

	constructor(shopRepository: ShopRepository) {
		this.shopRepository = shopRepository;
	}

	create(dto: CreateShopDTO): IShop {
		return this.shopRepository.create(dto);
	}

	delete(id: string): void {
		this.shopRepository.delete(id);
	}

	async getByToken(id: string): Promise<IShop | undefined>{
		return this.shopRepository.getByID(id)
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