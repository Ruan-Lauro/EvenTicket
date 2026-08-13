import { AppError } from "../errors/appError.ts";
import type { IShoppingCart, IShoppingCartCreate } from "../interfaces/shoppingCartInterface.ts";
import type { IShoppingCartRepository } from "../interfaces/shoppingCartRepositoryInterface.ts";


export class ShoppingCartService {

    private readonly ShoppingCartRepo: IShoppingCartRepository;
    
    constructor(ShoppingCartRepo: IShoppingCartRepository) {
        this.ShoppingCartRepo = ShoppingCartRepo;
    }

    async findById(id: number){
        const shoppingCart = await this.ShoppingCartRepo.findById(id);
        if(!shoppingCart) throw new AppError("Carrinho não encontrado", 404);
        return shoppingCart;
    }

    async findByUserId(userId: number){
        const shoppingCart = await this.ShoppingCartRepo.findByUserId(userId);
        if(!shoppingCart) throw new AppError("Carriinho de Usuário não encontrado", 404);
        return shoppingCart;
    }

    async update(id: number, shoppingCart: Partial<IShoppingCart>){
        const shopping = await this.ShoppingCartRepo.findById(id);
        if(!shopping) throw new AppError("Carrinho não encontrado", 404);
        return await this.ShoppingCartRepo.update(id, shoppingCart);    
    }

    async delete(id: number){
        const shopping = await this.ShoppingCartRepo.findById(id);
        if(!shopping) throw new AppError("Carrinho não encontrado", 404);
        return await this.ShoppingCartRepo.delete(id);
    }

    async create(shoppingCart: IShoppingCartCreate){
        const userShoppingCart = await this.ShoppingCartRepo.findByUserId(shoppingCart.userId);
        if(userShoppingCart) throw new AppError("Já tem um carrinho ativo", 409);
        const createShoppingCar = await this.ShoppingCartRepo.create(shoppingCart); 
        return createShoppingCar;
    }


}