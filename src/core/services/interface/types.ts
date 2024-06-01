import { CreateShopDTO } from '../../repository/DTO/shopRepositoryDTO';
import { IShop } from '../../models/Shop';

export type IShopService = {
	create(dto: CreateShopDTO): IShop
	setName(id: string, name: string): void
	getByToken(token: string): Promise<IShop | undefined>
	getByID(id: string): Promise<IShop | undefined>
	setRequisites(id: string, bankType: string, requisites: number | string): void
	delete(id: string): void
}