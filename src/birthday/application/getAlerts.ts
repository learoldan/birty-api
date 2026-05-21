import { BirthdayId } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'
import { Reminder } from '../domain/reminder'
import { IReminderRepository } from '../domain/reminder.repository'

export async function getAlerts(
    birthdayId: string,
    userId: string,
    birthdayRepository: IBirthdayRepository,
    reminderRepository: IReminderRepository,
): Promise<Reminder[]> {
    if (!birthdayId || birthdayId.trim().length === 0) {
        throw new Error('Birthday ID is required')
    }
    if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const birthday = await birthdayRepository.findById(
        new BirthdayId(birthdayId),
    )

    if (!birthday) {
        throw new Error('Birthday not found')
    }

    if (birthday.getUserId() !== userId) {
        throw new Error('Unauthorized: This birthday does not belong to you')
    }

    return reminderRepository.findByBirthdayId(birthdayId)
}
