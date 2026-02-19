import { BirthdayId } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'

export async function deleteBirthday(
    id: string,
    userId: string,
    repository: IBirthdayRepository,
): Promise<void> {
    if (!id || id.trim().length === 0) {
        throw new Error('Birthday ID is required')
    }
    if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const birthdayId = new BirthdayId(id)
    const birthday = await repository.findById(birthdayId)

    if (!birthday) {
        throw new Error('Birthday not found')
    }

    // Verify that the birthday belongs to the user
    if (birthday.getUserId() !== userId) {
        throw new Error('Unauthorized: This birthday does not belong to you')
    }

    await repository.delete(birthdayId)
}
