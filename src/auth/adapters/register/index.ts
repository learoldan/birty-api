import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { register } from '../../application/register'
import { CognitoService } from '../../infrastructure/cognitoService'
import { DynamoUserRepository } from '../../../user/infrastructure/dynamoUserRepository'

const cognitoService = new CognitoService()
const userRepository = new DynamoUserRepository()

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
        const result = await register(body, cognitoService, userRepository)

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: result.message || 'User registered successfully',
                data: {
                    userId: result.userId,
                    email: result.email,
                    firstNames: result.firstNames,
                    lastNames: result.lastNames,
                    userConfirmed: result.userConfirmed,
                },
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
