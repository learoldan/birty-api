import { CognitoService } from '../infrastructure/cognitoService'

export interface ChangePasswordDTO {
    accessToken: string
    currentPassword: string
    newPassword: string
}

export async function changePassword(
    dto: ChangePasswordDTO,
    cognitoService: CognitoService,
): Promise<void> {
    if (!dto.currentPassword || dto.currentPassword.trim().length === 0) {
        throw new Error('Current password is required')
    }
    if (!dto.newPassword || dto.newPassword.trim().length === 0) {
        throw new Error('New password is required')
    }
    if (dto.currentPassword === dto.newPassword) {
        throw new Error('New password must be different from current password')
    }

    await cognitoService.changePassword(
        dto.accessToken,
        dto.currentPassword,
        dto.newPassword,
    )
}
