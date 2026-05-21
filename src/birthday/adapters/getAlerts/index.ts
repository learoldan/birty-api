import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { DynamoReminderRepository } from '../../infrastructure/dynamoReminderRepository'
import { getAlerts } from '../../application/getAlerts'
import { TokenService } from '../../../shared/services/tokenService'

const birthdayRepository = new DynamoBirthdayRepository()
const reminderRepository = new DynamoReminderRepository()

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

        const reminders = await getAlerts(
            id,
            userId,
            birthdayRepository,
            reminderRepository,
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                alerts: reminders.map((r) => r.toPlainObject()),
            }),
        }
    } catch (error: any) {
        console.error('Error getting alerts:', error)
        const statusCode = error.message.includes('not found')
            ? 404
            : error.message.includes('Unauthorized')
              ? 403
              : 500
        return {
            statusCode,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        }
    }
}
