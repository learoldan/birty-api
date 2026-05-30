import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { confirmForgotPassword } from '../../application/confirmForgotPassword'
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
        await confirmForgotPassword(
            {
                email: body.email,
                confirmationCode: body.confirmationCode,
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
                message: 'Password reset successfully',
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        const clientErrors = [
            'Email is required',
            'Confirmation code is required',
            'New password is required',
            'Invalid confirmation code',
            'Confirmation code has expired',
            'User not found',
            'New password does not meet requirements',
        ]

        const statusCode = clientErrors.includes(error.message) ? 400 : 500

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
