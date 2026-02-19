import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { createBirthday } from '../../application/createBirthday'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoBirthdayRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Get userId from token
        const userId = await TokenService.getUserIdFromToken(event)

        // Parse request body
        const body = JSON.parse(event.body || '{}')

        const { name, birthDate, notes, reminderDays } = body

        // Create birthday
        const birthday = await createBirthday(
            {
                userId,
                name,
                birthDate,
                notes,
                reminderDays,
            },
            repository,
        )

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Birthday created successfully',
                birthday: birthday.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error creating birthday:', error)
        return {
            statusCode: error.message.includes('required') ? 400 : 500,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        }
    }
}
