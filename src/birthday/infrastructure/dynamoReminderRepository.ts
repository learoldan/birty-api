import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
    DeleteCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { MonthDay } from '../domain/birthday'
import { Reminder } from '../domain/reminder'
import { IReminderRepository } from '../domain/reminder.repository'

export class DynamoReminderRepository implements IReminderRepository {
    private readonly tableName: string
    private readonly client: DynamoDBDocumentClient

    constructor() {
        this.tableName = process.env.REMINDERS_TABLE || 'Reminders'

        const dynamoClient = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1',
        })

        this.client = DynamoDBDocumentClient.from(dynamoClient, {
            marshallOptions: {
                removeUndefinedValues: true,
                convertEmptyValues: false,
            },
        })
    }

    async save(reminder: Reminder): Promise<void> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: reminder.toPlainObject(),
        })
        await this.client.send(command)
    }

    async findByBirthdayId(birthdayId: string): Promise<Reminder[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'BirthdayIdIndex',
            KeyConditionExpression: 'birthdayId = :birthdayId',
            ExpressionAttributeValues: {
                ':birthdayId': birthdayId,
            },
        })

        const response = await this.client.send(command)

        if (!response.Items || response.Items.length === 0) return []

        return response.Items.map((item) =>
            Reminder.fromPlainObject(item as Record<string, unknown>),
        )
    }

    async findByAlertDate(alertDate: MonthDay): Promise<Reminder[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'alertDate = :alertDate',
            ExpressionAttributeValues: {
                ':alertDate': alertDate.toString(),
            },
        })

        const response = await this.client.send(command)

        if (!response.Items || response.Items.length === 0) return []

        return response.Items.map((item) =>
            Reminder.fromPlainObject(item as Record<string, unknown>),
        )
    }

    async delete(alertDate: MonthDay, birthdayId: string): Promise<void> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                alertDate: alertDate.toString(),
                birthdayId,
            },
        })
        await this.client.send(command)
    }

    async deleteByBirthdayId(birthdayId: string): Promise<void> {
        const reminders = await this.findByBirthdayId(birthdayId)
        await Promise.all(
            reminders.map((r) => this.delete(r.getAlertDate(), birthdayId)),
        )
    }
}
