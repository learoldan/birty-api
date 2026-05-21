import { BirthdayId, MonthDay } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'
import { Reminder } from '../domain/reminder'
import { IReminderRepository } from '../domain/reminder.repository'

export interface AddAlertDTO {
    id: string
    userId: string
    date: string
}

export async function addAlert(
    dto: AddAlertDTO,
    birthdayRepository: IBirthdayRepository,
    reminderRepository: IReminderRepository,
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
    const birthday = await birthdayRepository.findById(birthdayId)

    if (!birthday) {
        throw new Error('Birthday not found')
    }

    if (birthday.getUserId() !== dto.userId) {
        throw new Error('Unauthorized: This birthday does not belong to you')
    }

    const existing = await reminderRepository.findByBirthdayId(dto.id)
    if (existing.length >= 2) {
        throw new Error('Cannot add more than 2 alerts')
    }

    const monthDay = MonthDay.fromString(dto.date)
    const isDuplicate = existing.some((r) => r.getAlertDate().equals(monthDay))
    if (isDuplicate) {
        throw new Error('An alert for this date already exists')
    }

    const reminder = new Reminder({
        alertDate: monthDay,
        birthdayId: dto.id,
        userId: birthday.getUserId(),
        userEmail: birthday.getUserEmail(),
        userName: birthday.getUserName(),
        birthdayName: birthday.getName(),
    })

    await reminderRepository.save(reminder)
}
