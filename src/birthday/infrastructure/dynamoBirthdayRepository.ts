import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { Birthday, BirthdayId } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'

export class DynamoBirthdayRepository implements IBirthdayRepository {
    private readonly tableName: string
    private readonly client: DynamoDBDocumentClient

    constructor() {
        this.tableName = process.env.BIRTHDAYS_TABLE || 'Birthdays'

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

    async save(birthday: Birthday): Promise<void> {
        const item = birthday.toPlainObject()

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(id)',
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('Birthday already exists')
            }
            throw error
        }
    }

    async findById(id: BirthdayId): Promise<Birthday | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                id: id.getValue(),
            },
        })

        const response = await this.client.send(command)

        if (!response.Item) {
            return null
        }

        return Birthday.fromPlainObject(response.Item)
    }

    async findByUserId(userId: string): Promise<Birthday[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        })

        const response = await this.client.send(command)

        if (!response.Items || response.Items.length === 0) {
            return []
        }

        return response.Items.map((item) => Birthday.fromPlainObject(item))
    }

    async update(birthday: Birthday): Promise<void> {
        const item = birthday.toPlainObject()

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_exists(id)',
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('Birthday not found')
            }
            throw error
        }
    }

    async delete(id: BirthdayId): Promise<void> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                id: id.getValue(),
            },
            ConditionExpression: 'attribute_exists(id)',
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('Birthday not found')
            }
            throw error
        }
    }
}
