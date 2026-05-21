import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { createBirthday } from '../../application/createBirthday'
import { TokenService } from '../../../shared/services/tokenService'
import { DynamoUserRepository } from '../../../user/infrastructure/dynamoUserRepository'

const repository = new DynamoBirthdayRepository()
const userRepository = new DynamoUserRepository()

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Get userId from token
        const userId = await TokenService.getUserIdFromToken(event)

        // Look up user to get denormalized email and name
        const user = await userRepository.findByCognitoSub(userId)
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' }),
            }
        }

        const userEmail = user.getEmail().getValue()
        const userName = `${user.getFirstNames()} ${user.getLastNames()}`

        // Parse request body
        const body = JSON.parse(event.body || '{}')

        const { name, birthDate, notes } = body

        // Create birthday
        const birthday = await createBirthday(
            {
                userId,
                userEmail,
                userName,
                name,
                birthDate,
                notes,
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
