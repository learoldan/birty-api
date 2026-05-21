import { MonthDay } from './birthday'

export interface ReminderProps {
    alertDate: MonthDay
    birthdayId: string
    userId: string
    userEmail: string
    userName: string
    birthdayName: string
}

export class Reminder {
    private readonly alertDate: MonthDay
    private readonly birthdayId: string
    private readonly userId: string
    private readonly userEmail: string
    private readonly userName: string
    private readonly birthdayName: string

    constructor(props: ReminderProps) {
        this.alertDate = props.alertDate
        this.birthdayId = props.birthdayId
        this.userId = props.userId
        this.userEmail = props.userEmail
        this.userName = props.userName
        this.birthdayName = props.birthdayName
    }

    getAlertDate(): MonthDay {
        return this.alertDate
    }

    getBirthdayId(): string {
        return this.birthdayId
    }

    getUserId(): string {
        return this.userId
    }

    getUserEmail(): string {
        return this.userEmail
    }

    getUserName(): string {
        return this.userName
    }

    getBirthdayName(): string {
        return this.birthdayName
    }

    toPlainObject(): Record<string, unknown> {
        return {
            alertDate: this.alertDate.toString(),
            birthdayId: this.birthdayId,
            userId: this.userId,
            userEmail: this.userEmail,
            userName: this.userName,
            birthdayName: this.birthdayName,
        }
    }

    static fromPlainObject(data: Record<string, unknown>): Reminder {
        return new Reminder({
            alertDate: MonthDay.fromString(data.alertDate as string),
            birthdayId: data.birthdayId as string,
            userId: data.userId as string,
            userEmail: data.userEmail as string,
            userName: data.userName as string,
            birthdayName: data.birthdayName as string,
        })
    }
}
