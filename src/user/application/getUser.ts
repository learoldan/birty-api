import { User, UserId } from '../domain/user'
import { IUserRepository } from '../domain/user.repository'

export async function getUser(
    userId: string,
    repository: IUserRepository,
): Promise<User | null> {
    if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const id = new UserId(userId)
    const user = await repository.findById(id)

    return user
}
