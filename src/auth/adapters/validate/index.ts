import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { validateUser } from '../../application/validateUser'
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
        const result = await validateUser(body, cognitoService)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: result.message,
                data: {
                    email: result.email,
                },
            }),
        }
    } catch (error: any) {
        console.error('Error:', error)

        let statusCode = 400
        if (error.message.includes('Invalid verification code')) {
            statusCode = 400
        } else if (error.message.includes('expired')) {
            statusCode = 410
        } else if (error.message.includes('not found')) {
            statusCode = 404
        } else if (error.message.includes('already confirmed')) {
            statusCode = 409
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
