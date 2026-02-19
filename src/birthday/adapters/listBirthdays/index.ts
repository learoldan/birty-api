import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { listBirthdays } from '../../application/listBirthdays'
import { TokenService } from '../../../shared/services/tokenService'

const repository = new DynamoBirthdayRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Get userId from token
        const userId = await TokenService.getUserIdFromToken(event)

        // List user's birthdays
        const birthdays = await listBirthdays(userId, repository)

        return {
            statusCode: 200,
            body: JSON.stringify({
                birthdays: birthdays.map((b) => b.toPlainObject()),
            }),
        }
    } catch (error: any) {
        console.error('Error listing birthdays:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        }
    }
}
