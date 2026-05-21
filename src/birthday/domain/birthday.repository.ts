import { Birthday, BirthdayId, MonthDay } from './birthday'

export interface IBirthdayRepository {
    save(birthday: Birthday): Promise<void>
    findById(id: BirthdayId): Promise<Birthday | null>
    findByUserId(userId: string): Promise<Birthday[]>
    findByBirthDate(date: MonthDay): Promise<Birthday[]>
    update(birthday: Birthday): Promise<void>
    delete(id: BirthdayId): Promise<void>
}
