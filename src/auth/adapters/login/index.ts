import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { login } from '../../application/login'
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
        const result = await login(body, cognitoService)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Login successful',
                data: result,
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        return {
            statusCode: error.message.includes('Invalid credentials')
                ? 401
                : 400,
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
