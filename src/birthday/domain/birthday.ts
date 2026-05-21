// Value Objects
export class BirthdayId {
    private readonly value: string

    constructor(id: string) {
        if (!id || id.trim().length === 0) {
            throw new Error('Birthday ID cannot be empty')
        }
        this.value = id
    }

    getValue(): string {
        return this.value
    }

    equals(other: BirthdayId): boolean {
        return this.value === other.value
    }
}

export class MonthDay {
    private readonly month: number
    private readonly day: number

    private static readonly DAYS_IN_MONTH = [
        0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ]

    constructor(month: number, day: number) {
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12')
        }
        const maxDay = MonthDay.DAYS_IN_MONTH[month]
        if (!Number.isInteger(day) || day < 1 || day > maxDay) {
            throw new Error(
                `Day must be between 1 and ${maxDay} for month ${month}`,
            )
        }
        this.month = month
        this.day = day
    }

    getMonth(): number {
        return this.month
    }

    getDay(): number {
        return this.day
    }

    toString(): string {
        return `${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
    }

    static fromString(value: string): MonthDay {
        const match = /^(\d{1,2})-(\d{1,2})$/.exec(value)
        if (!match) {
            throw new Error('Invalid MonthDay format, expected MM-DD')
        }
        return new MonthDay(parseInt(match[1], 10), parseInt(match[2], 10))
    }

    equals(other: MonthDay): boolean {
        return this.month === other.month && this.day === other.day
    }

    getDaysUntil(): number {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const next = new Date(today.getFullYear(), this.month - 1, this.day)
        next.setHours(0, 0, 0, 0)
        if (next < today) {
            next.setFullYear(today.getFullYear() + 1)
        }
        return Math.ceil(
            (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        )
    }
}

export class BirthDate {
    private readonly value: MonthDay

    constructor(date: MonthDay | string) {
        if (typeof date === 'string') {
            this.value = MonthDay.fromString(date)
        } else {
            this.value = date
        }
    }

    getValue(): MonthDay {
        return this.value
    }

    getNextBirthday(): Date {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const nextBirthday = new Date(
            today.getFullYear(),
            this.value.getMonth() - 1,
            this.value.getDay(),
        )
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1)
        }
        return nextBirthday
    }

    getDaysUntilBirthday(): number {
        return this.value.getDaysUntil()
    }
}

// Birthday Entity
export interface BirthdayProps {
    id: BirthdayId
    userId: string
    userEmail: string
    userName: string
    name: string
    birthDate: BirthDate
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export class Birthday {
    private readonly id: BirthdayId
    private readonly userId: string
    private readonly userEmail: string
    private readonly userName: string
    private name: string
    private birthDate: BirthDate
    private notes?: string
    private readonly createdAt: Date
    private updatedAt: Date

    constructor(props: BirthdayProps) {
        this.id = props.id
        this.userId = props.userId
        this.userEmail = props.userEmail
        this.userName = props.userName
        this.name = props.name
        this.birthDate = props.birthDate
        this.notes = props.notes
        this.createdAt = props.createdAt || new Date()
        this.updatedAt = props.updatedAt || new Date()
    }

    // Getters
    getId(): BirthdayId {
        return this.id
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

    getName(): string {
        return this.name
    }

    getBirthDate(): BirthDate {
        return this.birthDate
    }

    getNotes(): string | undefined {
        return this.notes
    }

    getCreatedAt(): Date {
        return this.createdAt
    }

    getUpdatedAt(): Date {
        return this.updatedAt
    }

    // Business methods
    updateInfo(name: string, birthDate: BirthDate, notes?: string): void {
        this.name = name
        this.birthDate = birthDate
        this.notes = notes
        this.updatedAt = new Date()
    }

    // Convert to plain object for persistence
    toPlainObject(): any {
        return {
            id: this.id.getValue(),
            userId: this.userId,
            userEmail: this.userEmail,
            userName: this.userName,
            name: this.name,
            birthDate: this.birthDate.getValue().toString(),
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        }
    }

    // Factory method to create from plain object
    static fromPlainObject(data: any): Birthday {
        return new Birthday({
            id: new BirthdayId(data.id),
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            name: data.name,
            birthDate: new BirthDate(data.birthDate),
            notes: data.notes,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        })
    }
}
