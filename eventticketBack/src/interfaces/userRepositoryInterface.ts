import type { IUser, IUserCreate, IUserCreateWithRole, IUserGet } from "./userInterface.ts";

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>;
    getUsers(): Promise<IUserGet[]>;
    findById(id: number): Promise<IUserGet | null>;
    create(data: IUserCreate): Promise<IUser>;
    createWithRole(data: IUserCreateWithRole): Promise<IUser>;
    update(id: number, data: Partial<IUser>): Promise<IUser>;
    delete(id: number): Promise<void>;
}
