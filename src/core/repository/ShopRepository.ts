import { IShop } from '../models/Shop';
import { CreateShopDTO, UpdateShopDTO } from './DTO/shopRepositoryDTO';

export type ShopRepository = {
	create(dto: CreateShopDTO): IShop
	getByID(id: string): undefined | IShop
	getAll(): IShop[]
	delete(id: string): void
	update(id: string, dto: UpdateShopDTO): void
}