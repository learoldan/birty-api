import { CognitoService } from '../infrastructure/cognitoService'
import { createUser, CreateUserDTO } from '../../user/application/createUser'
import { IUserRepository } from '../../user/domain/user.repository'
import { User } from '../../user/domain/user'

export interface RegisterDTO {
    email: string
    password: string
    firstNames: string
    lastNames: string
}

export interface RegisterResponse {
    userId: string
    email: string
    firstNames: string
    lastNames: string
    userConfirmed: boolean
    message?: string
}

export async function register(
    dto: RegisterDTO,
    cognitoService: CognitoService,
    userRepository: IUserRepository,
): Promise<RegisterResponse> {
    // Validate input
    if (!dto.email || dto.email.trim().length === 0) {
        throw new Error('Email is required')
    }
    if (!dto.password || dto.password.trim().length === 0) {
        throw new Error('Password is required')
    }
    if (!dto.firstNames || dto.firstNames.trim().length === 0) {
        throw new Error('First names are required')
    }
    if (!dto.lastNames || dto.lastNames.trim().length === 0) {
        throw new Error('Last names are required')
    }

    // Register user in Cognito
    const cognitoResult = await cognitoService.signUp(dto.email, dto.password)

    // Create user in database
    const createUserDTO: CreateUserDTO = {
        email: dto.email,
        firstNames: dto.firstNames,
        lastNames: dto.lastNames,
    }

    let user: User
    try {
        user = await createUser(createUserDTO, userRepository)
    } catch (error) {
        // If user creation fails, we should ideally rollback the Cognito registration
        // For now, we'll just throw the error
        throw new Error(
            `User registered in Cognito but failed to create in database: ${error}`,
        )
    }

    return {
        userId: user.getId().getValue(),
        email: user.getEmail().getValue(),
        firstNames: user.getFirstNames(),
        lastNames: user.getLastNames(),
        userConfirmed: cognitoResult.userConfirmed,
        message: cognitoResult.userConfirmed
            ? 'User registered successfully'
            : 'User registered. Please check your email to confirm your account.',
    }
}
