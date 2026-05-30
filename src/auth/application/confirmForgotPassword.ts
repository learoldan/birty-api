import { CognitoService } from '../infrastructure/cognitoService'

export interface ConfirmForgotPasswordDTO {
    email: string
    confirmationCode: string
    newPassword: string
}

export async function confirmForgotPassword(
    dto: ConfirmForgotPasswordDTO,
    cognitoService: CognitoService,
): Promise<void> {
    if (!dto.email || dto.email.trim().length === 0) {
        throw new Error('Email is required')
    }
    if (!dto.confirmationCode || dto.confirmationCode.trim().length === 0) {
        throw new Error('Confirmation code is required')
    }
    if (!dto.newPassword || dto.newPassword.trim().length === 0) {
        throw new Error('New password is required')
    }

    await cognitoService.confirmForgotPassword(
        dto.email.trim(),
        dto.confirmationCode.trim(),
        dto.newPassword,
    )
}
