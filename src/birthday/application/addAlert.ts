import { BirthdayId, MonthDay } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'

export interface AddAlertDTO {
    id: string
    userId: string
    date: string
}

export async function addAlert(
    dto: AddAlertDTO,
    repository: IBirthdayRepository,
): Promise<void> {
    if (!dto.id || dto.id.trim().length === 0) {
        throw new Error('Birthday ID is required')
    }
    if (!dto.userId || dto.userId.trim().length === 0) {
        throw new Error('User ID is required')
    }
    if (!dto.date) {
        throw new Error('Alert date is required')
    }

    const birthdayId = new BirthdayId(dto.id)
    const birthday = await repository.findById(birthdayId)

    if (!birthday) {
        throw new Error('Birthday not found')
    }

    if (birthday.getUserId() !== dto.userId) {
        throw new Error('Unauthorized: This birthday does not belong to you')
    }

    const monthDay = MonthDay.fromString(dto.date)
    birthday.addAlert(monthDay)

    await repository.update(birthday)
}
