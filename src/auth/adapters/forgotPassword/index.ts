import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { forgotPassword } from '../../application/forgotPassword'
import { CognitoService } from '../../infrastructure/cognitoService'

const cognitoService = new CognitoService()

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
        await forgotPassword({ email: body.email }, cognitoService)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message:
                    'If the email exists, a password reset link has been sent',
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        const statusCode = error.message === 'Email is required' ? 400 : 500

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
