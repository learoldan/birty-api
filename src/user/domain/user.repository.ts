import { User, UserId } from './user'

export interface IUserRepository {
    save(user: User): Promise<void>
    findById(id: UserId): Promise<User | null>
    update(user: User): Promise<void>
    delete(id: UserId): Promise<void>
}
