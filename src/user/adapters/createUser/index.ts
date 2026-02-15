import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createUser } from '../../application/createUser'
import { DynamoUserRepository } from '../../infrastructure/dynamoUserRepository'

const repository = new DynamoUserRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event, null, 2))

    try {
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
        const user = await createUser(body, repository)

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'User created successfully',
                data: user.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        return {
            statusCode: error.message.includes('already exists') ? 409 : 400,
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
