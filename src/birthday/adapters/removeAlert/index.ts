import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { removeAlert } from '../../application/removeAlert'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoBirthdayRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = await TokenService.getUserIdFromToken(event)

        const id = event.pathParameters?.id
        const date = event.pathParameters?.date

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Birthday ID is required' }),
            }
        }

        if (!date) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Alert date is required' }),
            }
        }

        await removeAlert({ id, userId, date }, repository)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Alert removed successfully' }),
        }
    } catch (error: any) {
        console.error('Error removing alert:', error)
        const statusCode = error.message.includes('not found')
            ? 404
            : error.message.includes('Unauthorized')
              ? 403
              : error.message.includes('required') ||
                  error.message.includes('Invalid') ||
                  error.message.includes('must be')
                ? 400
                : 500
        return {
            statusCode,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        }
    }
}
