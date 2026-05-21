import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { DynamoReminderRepository } from '../../infrastructure/dynamoReminderRepository'
import { deleteBirthday } from '../../application/deleteBirthday'
import { TokenService } from '../../../shared/services/tokenService'

const birthdayRepository = new DynamoBirthdayRepository()
const reminderRepository = new DynamoReminderRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Get userId from token
        const userId = await TokenService.getUserIdFromToken(event)

        // Get birthday ID from path
        const id = event.pathParameters?.id

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Birthday ID is required',
                }),
            }
        }

        // Delete birthday
        await deleteBirthday(id, userId, birthdayRepository, reminderRepository)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Birthday deleted successfully',
            }),
        }
    } catch (error: any) {
        console.error('Error deleting birthday:', error)
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
