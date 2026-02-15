import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteUser } from '../../application/deleteUser'
import { DynamoUserRepository } from '../../infrastructure/dynamoUserRepository'

const repository = new DynamoUserRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event, null, 2))

    try {
        const userId = event.pathParameters?.id

        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    message: 'User ID is required',
                }),
            }
        }

        await deleteUser(userId, repository)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'User deleted successfully',
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        const statusCode = error.message.includes('not found') ? 404 : 500

        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: error.message || 'Internal server error',
            }),
        }
    }
}
