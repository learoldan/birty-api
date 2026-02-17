import { User, UserId, Email } from '../domain/user'
import { IUserRepository } from '../domain/user.repository'
import { v4 as uuidv4 } from 'uuid'

export interface CreateUserDTO {
    cognitoSub: string
    firstNames: string
    lastNames: string
    email: string
}

export async function createUser(
    dto: CreateUserDTO,
    repository: IUserRepository,
): Promise<User> {
    // Validate input
    if (!dto.cognitoSub || dto.cognitoSub.trim().length === 0) {
        throw new Error('Cognito Sub is required')
    }
    if (!dto.firstNames || dto.firstNames.trim().length === 0) {
        throw new Error('First names are required')
    }
    if (!dto.lastNames || dto.lastNames.trim().length === 0) {
        throw new Error('Last names are required')
    }

    // Create value objects
    const userId = new UserId(uuidv4())
    const email = new Email(dto.email)

    // Create user entity
    const user = new User({
        id: userId,
        cognitoSub: dto.cognitoSub,
        firstNames: dto.firstNames.trim(),
        lastNames: dto.lastNames.trim(),
        email,
    })

    // Persist user
    await repository.save(user)

    return user
}
