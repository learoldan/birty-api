import { CognitoService } from '../infrastructure/cognitoService'

export interface LoginDTO {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    idToken: string
    refreshToken: string
    expiresIn: number
    email: string
}

export async function login(
    dto: LoginDTO,
    cognitoService: CognitoService,
): Promise<LoginResponse> {
    // Validate input
    if (!dto.email || dto.email.trim().length === 0) {
        throw new Error('Email is required')
    }
    if (!dto.password || dto.password.trim().length === 0) {
        throw new Error('Password is required')
    }

    // Authenticate with Cognito
    const result = await cognitoService.signIn(dto.email, dto.password)

    return {
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        email: dto.email,
    }
}
