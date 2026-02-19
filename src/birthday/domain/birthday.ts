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

export class BirthDate {
    private readonly value: Date

    constructor(date: Date | string) {
        const parsedDate = typeof date === 'string' ? new Date(date) : date

        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid birth date')
        }

        this.value = parsedDate
    }

    getValue(): Date {
        return this.value
    }

    getAge(): number {
        const today = new Date()
        const birthDate = this.value
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--
        }

        return age
    }

    getNextBirthday(): Date {
        const today = new Date()
        const nextBirthday = new Date(
            today.getFullYear(),
            this.value.getMonth(),
            this.value.getDate(),
        )

        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1)
        }

        return nextBirthday
    }

    getDaysUntilBirthday(): number {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const nextBirthday = this.getNextBirthday()
        nextBirthday.setHours(0, 0, 0, 0)

        const diffTime = nextBirthday.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return diffDays
    }
}

// Birthday Entity
export interface BirthdayProps {
    id: BirthdayId
    userId: string
    name: string
    birthDate: BirthDate
    notes?: string
    reminderDays?: number
    createdAt?: Date
    updatedAt?: Date
}

export class Birthday {
    private readonly id: BirthdayId
    private readonly userId: string
    private name: string
    private birthDate: BirthDate
    private notes?: string
    private reminderDays?: number
    private readonly createdAt: Date
    private updatedAt: Date

    constructor(props: BirthdayProps) {
        this.id = props.id
        this.userId = props.userId
        this.name = props.name
        this.birthDate = props.birthDate
        this.notes = props.notes
        this.reminderDays = props.reminderDays
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

    getName(): string {
        return this.name
    }

    getBirthDate(): BirthDate {
        return this.birthDate
    }

    getNotes(): string | undefined {
        return this.notes
    }

    getReminderDays(): number | undefined {
        return this.reminderDays
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

    updateReminder(days: number): void {
        if (days < 0) {
            throw new Error('Reminder days must be positive')
        }
        this.reminderDays = days
        this.updatedAt = new Date()
    }

    // Convert to plain object for persistence
    toPlainObject(): any {
        return {
            id: this.id.getValue(),
            userId: this.userId,
            name: this.name,
            birthDate: this.birthDate.getValue().toISOString(),
            notes: this.notes,
            reminderDays: this.reminderDays,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        }
    }

    // Factory method to create from plain object
    static fromPlainObject(data: any): Birthday {
        return new Birthday({
            id: new BirthdayId(data.id),
            userId: data.userId,
            name: data.name,
            birthDate: new BirthDate(data.birthDate),
            notes: data.notes,
            reminderDays: data.reminderDays,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        })
    }
}
