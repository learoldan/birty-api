import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoUserRepository } from '../../infrastructure/dynamoUserRepository'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoUserRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event, null, 2))

    try {
        // Extract and verify token to get cognitoSub
        const cognitoSub = await TokenService.getUserIdFromToken(event)

        // Find user by cognitoSub
        const user = await repository.findByCognitoSub(cognitoSub)

        if (!user) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    message: 'User not found',
                }),
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                data: user.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        let statusCode = 500
        if (error.message.includes('token')) {
            statusCode = 401
        }

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
