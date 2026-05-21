import { MonthDay } from './birthday'
import { Reminder } from './reminder'

export interface IReminderRepository {
    save(reminder: Reminder): Promise<void>
    findByBirthdayId(birthdayId: string): Promise<Reminder[]>
    findByAlertDate(alertDate: MonthDay): Promise<Reminder[]>
    delete(alertDate: MonthDay, birthdayId: string): Promise<void>
    deleteByBirthdayId(birthdayId: string): Promise<void>
}
