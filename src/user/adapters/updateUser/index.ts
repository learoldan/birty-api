import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { updateUser } from '../../application/updateUser'
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

        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    message: 'Request body is required',
                }),
            }
        }

        const body = JSON.parse(event.body)
        const user = await updateUser(
            {
                id: userId,
                ...body,
            },
            repository,
        )

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'User updated successfully',
                data: user.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        const statusCode = error.message.includes('not found') ? 404 : 400

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
