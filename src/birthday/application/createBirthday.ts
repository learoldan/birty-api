import { Birthday, BirthdayId, BirthDate } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'
import { v4 as uuidv4 } from 'uuid'

export interface CreateBirthdayDTO {
    userId: string
    userEmail: string
    userName: string
    name: string
    birthDate: string
    notes?: string
}

export async function createBirthday(
    dto: CreateBirthdayDTO,
    repository: IBirthdayRepository,
): Promise<Birthday> {
    // Validate input
    if (!dto.userId || dto.userId.trim().length === 0) {
        throw new Error('User ID is required')
    }
    if (!dto.userEmail || dto.userEmail.trim().length === 0) {
        throw new Error('User email is required')
    }
    if (!dto.userName || dto.userName.trim().length === 0) {
        throw new Error('User name is required')
    }
    if (!dto.name || dto.name.trim().length === 0) {
        throw new Error('Name is required')
    }
    if (!dto.birthDate) {
        throw new Error('Birth date is required')
    }

    // Create value objects
    const birthdayId = new BirthdayId(uuidv4())
    const birthDate = new BirthDate(dto.birthDate)

    // Create birthday entity
    const birthday = new Birthday({
        id: birthdayId,
        userId: dto.userId,
        userEmail: dto.userEmail,
        userName: dto.userName,
        name: dto.name.trim(),
        birthDate,
        notes: dto.notes?.trim(),
    })

    // Persist birthday
    await repository.save(birthday)

    return birthday
}
