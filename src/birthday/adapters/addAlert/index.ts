import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { addAlert } from '../../application/addAlert'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoBirthdayRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = await TokenService.getUserIdFromToken(event)

        const id = event.pathParameters?.id

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Birthday ID is required' }),
            }
        }

        const body = JSON.parse(event.body || '{}')
        const { date } = body

        await addAlert({ id, userId, date }, repository)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Alert added successfully' }),
        }
    } catch (error: any) {
        console.error('Error adding alert:', error)
        const statusCode = error.message.includes('not found')
            ? 404
            : error.message.includes('Unauthorized')
              ? 403
              : error.message.includes('required') ||
                  error.message.includes('Cannot add') ||
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
