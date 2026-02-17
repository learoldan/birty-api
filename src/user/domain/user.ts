// Value Objects
export class Email {
    private readonly value: string

    constructor(email: string) {
        if (!this.isValid(email)) {
            throw new Error('Invalid email format')
        }
        this.value = email.toLowerCase()
    }

    private isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    getValue(): string {
        return this.value
    }

    equals(other: Email): boolean {
        return this.value === other.value
    }
}

export class UserId {
    private readonly value: string

    constructor(id: string) {
        if (!id || id.trim().length === 0) {
            throw new Error('User ID cannot be empty')
        }
        this.value = id
    }

    getValue(): string {
        return this.value
    }

    equals(other: UserId): boolean {
        return this.value === other.value
    }
}

// User Entity
export interface UserProps {
    id: UserId
    cognitoSub: string
    firstNames: string
    lastNames: string
    email: Email
    createdAt?: Date
    updatedAt?: Date
}

export class User {
    private readonly id: UserId
    private readonly cognitoSub: string
    private firstNames: string
    private lastNames: string
    private email: Email
    private readonly createdAt: Date
    private updatedAt: Date

    constructor(props: UserProps) {
        this.id = props.id
        this.cognitoSub = props.cognitoSub
        this.firstNames = props.firstNames
        this.lastNames = props.lastNames
        this.email = props.email
        this.createdAt = props.createdAt || new Date()
        this.updatedAt = props.updatedAt || new Date()
    }

    // Getters
    getId(): UserId {
        return this.id
    }

    getCognitoSub(): string {
        return this.cognitoSub
    }

    getFirstNames(): string {
        return this.firstNames
    }

    getLastNames(): string {
        return this.lastNames
    }

    getEmail(): Email {
        return this.email
    }

    getCreatedAt(): Date {
        return this.createdAt
    }

    getUpdatedAt(): Date {
        return this.updatedAt
    }

    // Business methods
    updatePersonalInfo(firstNames: string, lastNames: string): void {
        this.firstNames = firstNames
        this.lastNames = lastNames
        this.updatedAt = new Date()
    }

    updateEmail(email: Email): void {
        this.email = email
        this.updatedAt = new Date()
    }

    // Convert to plain object for persistence
    toPlainObject(): any {
        return {
            id: this.id.getValue(),
            cognitoSub: this.cognitoSub,
            firstNames: this.firstNames,
            lastNames: this.lastNames,
            email: this.email.getValue(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        }
    }

    // Factory method to create from plain object
    static fromPlainObject(data: any): User {
        return new User({
            id: new UserId(data.id),
            cognitoSub: data.cognitoSub,
            firstNames: data.firstNames,
            lastNames: data.lastNames,
            email: new Email(data.email),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        })
    }
}
