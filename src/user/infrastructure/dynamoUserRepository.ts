import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { User, UserId } from '../domain/user'
import { IUserRepository } from '../domain/user.repository'

export class DynamoUserRepository implements IUserRepository {
    private readonly tableName: string
    private readonly client: DynamoDBDocumentClient

    constructor() {
        this.tableName = process.env.USERS_TABLE || 'Users'

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

    async save(user: User): Promise<void> {
        const item = user.toPlainObject()

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(id)',
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('User already exists')
            }
            throw error
        }
    }

    async findById(id: UserId): Promise<User | null> {
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

        return User.fromPlainObject(response.Item)
    }

    async findByCognitoSub(cognitoSub: string): Promise<User | null> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'CognitoSubIndex',
            KeyConditionExpression: 'cognitoSub = :cognitoSub',
            ExpressionAttributeValues: {
                ':cognitoSub': cognitoSub,
            },
        })

        const response = await this.client.send(command)

        if (!response.Items || response.Items.length === 0) {
            return null
        }

        return User.fromPlainObject(response.Items[0])
    }

    async update(user: User): Promise<void> {
        const item = user.toPlainObject()

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_exists(id)',
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                throw new Error('User not found')
            }
            throw error
        }
    }

    async delete(id: UserId): Promise<void> {
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
                throw new Error('User not found')
            }
            throw error
        }
    }
}
