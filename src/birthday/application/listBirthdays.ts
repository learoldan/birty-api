import { Birthday } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'

export async function listBirthdays(
    userId: string,
    repository: IBirthdayRepository,
): Promise<Birthday[]> {
    if (!userId || userId.trim().length === 0) {
        throw new Error('User ID is required')
    }

    const birthdays = await repository.findByUserId(userId)

    // Sort by next birthday (closest first)
    birthdays.sort((a, b) => {
        const daysA = a.getBirthDate().getDaysUntilBirthday()
        const daysB = b.getBirthDate().getDaysUntilBirthday()
        return daysA - daysB
    })

    return birthdays
}
