import { Birthday, BirthdayId, BirthDate } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'

export interface UpdateBirthdayDTO {
    id: string
    userId: string
    name?: string
    birthDate?: string | Date
    notes?: string
    reminderDays?: number
}

export async function updateBirthday(
    dto: UpdateBirthdayDTO,
    repository: IBirthdayRepository,
): Promise<Birthday> {
    if (!dto.id || dto.id.trim().length === 0) {
        throw new Error('Birthday ID is required')
    }
    if (!dto.userId || dto.userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const birthdayId = new BirthdayId(dto.id)
    const birthday = await repository.findById(birthdayId)

    if (!birthday) {
        throw new Error('Birthday not found')
    }

    // Verify that the birthday belongs to the user
    if (birthday.getUserId() !== dto.userId) {
        throw new Error('Unauthorized: This birthday does not belong to you')
    }

    // Update birthday information if provided
    if (dto.name || dto.birthDate || dto.notes !== undefined) {
        const name = dto.name?.trim() || birthday.getName()
        const birthDate = dto.birthDate
            ? new BirthDate(dto.birthDate)
            : birthday.getBirthDate()
        const notes =
            dto.notes !== undefined ? dto.notes?.trim() : birthday.getNotes()

        birthday.updateInfo(name, birthDate, notes)
    }

    // Update reminder if provided
    if (dto.reminderDays !== undefined) {
        birthday.updateReminder(dto.reminderDays)
    }

    // Persist changes
    await repository.update(birthday)

    return birthday
}
