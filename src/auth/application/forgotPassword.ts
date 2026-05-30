import { CognitoService } from '../infrastructure/cognitoService'

export interface ForgotPasswordDTO {
    email: string
}

export async function forgotPassword(
    dto: ForgotPasswordDTO,
    cognitoService: CognitoService,
): Promise<void> {
    if (!dto.email || dto.email.trim().length === 0) {
        throw new Error('Email is required')
    }

    await cognitoService.forgotPassword(dto.email.trim())
}
