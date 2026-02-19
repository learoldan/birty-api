import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { updateBirthday } from '../../application/updateBirthday'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoBirthdayRepository()

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

        // Parse request body
        const body = JSON.parse(event.body || '{}')

        const { name, birthDate, notes, reminderDays } = body

        // Update birthday
        const birthday = await updateBirthday(
            {
                id,
                userId,
                name,
                birthDate,
                notes,
                reminderDays,
            },
            repository,
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Birthday updated successfully',
                birthday: birthday.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error updating birthday:', error)
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
