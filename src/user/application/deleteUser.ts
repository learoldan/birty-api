import { UserId } from '../domain/user'
import { IUserRepository } from '../domain/user.repository'

export async function deleteUser(
    userId: string,
    repository: IUserRepository,
): Promise<void> {
    if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const id = new UserId(userId)

    // Verify user exists
    const user = await repository.findById(id)
    if (!user) {
        throw new Error('User not found')
    }

    // Delete user
    await repository.delete(id)
}
