import { IShopRepository } from '../../../core/repository/IShopRepository';
import { CreateShopDTO, UpdateShopDTO } from '../../../core/repository/DTO/shopRepositoryDTO';
import { IShop } from '../../../core/models/Shop';
import { IJSONController, JSONControllerImpl } from '../../modules/JSONController';
import { v4 as uuidv4 } from 'uuid';

export class ShopInMemoryRepository implements IShopRepository {
	constructor(private JSONController: IJSONController) {
	}

	create(dto: CreateShopDTO): IShop {
		const shops: IShop[] = this.JSONController.loadJSON();
		const createShop = { id: uuidv4(), name: dto.name, requisites: dto.requisites || {}} as IShop;
		shops.push(createShop);
		this.JSONController.saveJSON(shops);
		return createShop;
	}

	delete(id: string): void {
		const shops: IShop[] = this.JSONController.loadJSON();
		const index = shops.findIndex((item) => item.id === id);
		shops.splice(index, 1);
		this.JSONController.saveJSON(shops);
	}

	getAll(): IShop[] {
		return this.JSONController.loadJSON();
	}

	getByID(id: string): IShop | undefined {
		const shops: IShop[] = this.JSONController.loadJSON();
		const shop = shops.find((item) => item.id === id);
		return shop;
	}

	update(id: string, dto: UpdateShopDTO): void {
		const shops: IShop[] = this.JSONController.loadJSON();
		const index = shops.findIndex((shop) => shop.id === id);
		if (index !== -1) {
			const shop = shops[index];
			if (dto.name !== undefined) {
				shop.name = dto.name;
			}
			if (dto.requisites !== undefined) {
				shop.requisites = { ...shop.requisites, ...dto.requisites };
			}
			this.JSONController.saveJSON(shops);
		}
	}
}
export const shopInMemoryRepository = new ShopInMemoryRepository(JSONControllerImpl)