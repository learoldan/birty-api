import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { changePassword } from '../../application/changePassword'
import { CognitoService } from '../../infrastructure/cognitoService'
import { TokenService } from '../../../shared/services/tokenService'

const cognitoService = new CognitoService()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event, null, 2))

    try {
        const accessToken = TokenService.extractToken(event)

        if (!accessToken) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    message: 'Authorization token is required',
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
        await changePassword(
            {
                accessToken,
                currentPassword: body.currentPassword,
                newPassword: body.newPassword,
            },
            cognitoService,
        )

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Password changed successfully',
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        let statusCode = 400
        if (
            error.message.includes('token') ||
            error.message.includes('incorrect')
        ) {
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
