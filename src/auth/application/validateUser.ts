import { CognitoService } from '../infrastructure/cognitoService'

export interface ValidateUserDTO {
    email: string
    confirmationCode: string
}

export interface ValidateUserResponse {
    message: string
    email: string
}

export async function validateUser(
    dto: ValidateUserDTO,
    cognitoService: CognitoService,
): Promise<ValidateUserResponse> {
    // Validate input
    if (!dto.email || dto.email.trim().length === 0) {
        throw new Error('Email is required')
    }
    if (!dto.confirmationCode || dto.confirmationCode.trim().length === 0) {
        throw new Error('Confirmation code is required')
    }

    // Confirm user in Cognito
    await cognitoService.confirmSignUp(dto.email, dto.confirmationCode)

    return {
        message: 'User confirmed successfully',
        email: dto.email,
    }
}
