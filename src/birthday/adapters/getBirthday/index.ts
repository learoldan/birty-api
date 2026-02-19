import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { getBirthday } from '../../application/getBirthday'
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

        // Get birthday
        const birthday = await getBirthday(id, userId, repository)

        if (!birthday) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Birthday not found',
                }),
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                birthday: birthday.toPlainObject(),
            }),
        }
    } catch (error: any) {
        console.error('Error getting birthday:', error)
        const statusCode = error.message.includes('Unauthorized') ? 403 : 500
        return {
            statusCode,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
            }),
        }
    }
}
