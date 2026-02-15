import { User, UserId, Email } from '../domain/user'
import { IUserRepository } from '../domain/user.repository'

export interface UpdateUserDTO {
    id: string
    firstNames?: string
    lastNames?: string
    email?: string
}

export async function updateUser(
    dto: UpdateUserDTO,
    repository: IUserRepository,
): Promise<User> {
    if (!dto.id || dto.id.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const userId = new UserId(dto.id)
    const user = await repository.findById(userId)

    if (!user) {
        throw new Error('User not found')
    }

    // Update personal information if provided
    if (dto.firstNames || dto.lastNames) {
        const firstNames = dto.firstNames?.trim() || user.getFirstNames()
        const lastNames = dto.lastNames?.trim() || user.getLastNames()
        user.updatePersonalInfo(firstNames, lastNames)
    }

    // Update email if provided
    if (dto.email) {
        const newEmail = new Email(dto.email)
        user.updateEmail(newEmail)
    }

    // Persist changes
    await repository.update(user)

    return user
}
