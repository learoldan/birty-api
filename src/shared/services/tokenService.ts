import { APIGatewayProxyEvent } from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

export interface DecodedToken {
    sub: string
    email: string
    email_verified?: boolean
    token_use: string
}

export class TokenService {
    private static accessVerifier: any = null
    private static idVerifier: any = null

    private static getAccessVerifier() {
        if (!this.accessVerifier) {
            const userPoolId = process.env.COGNITO_USER_POOL_ID || ''

            if (!userPoolId) {
                throw new Error('COGNITO_USER_POOL_ID is required')
            }

            this.accessVerifier = CognitoJwtVerifier.create({
                userPoolId,
                tokenUse: 'access',
                clientId: null, // Access tokens don't validate against clientId
            })
        }
        return this.accessVerifier
    }

    private static getIdVerifier() {
        if (!this.idVerifier) {
            const userPoolId = process.env.COGNITO_USER_POOL_ID || ''
            const clientId = process.env.COGNITO_CLIENT_ID || ''

            if (!userPoolId || !clientId) {
                throw new Error(
                    'COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required',
                )
            }

            this.idVerifier = CognitoJwtVerifier.create({
                userPoolId,
                clientId,
                tokenUse: 'id',
            })
        }
        return this.idVerifier
    }

    static extractToken(event: APIGatewayProxyEvent): string | null {
        const authHeader =
            event.headers?.Authorization || event.headers?.authorization

        if (!authHeader) {
            return null
        }

        // Extract token from "Bearer <token>"
        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null
        }

        return parts[1]
    }

    static async verifyAndDecodeToken(token: string): Promise<DecodedToken> {
        // Try to verify as access token first
        try {
            const verifier = this.getAccessVerifier()
            const payload = await verifier.verify(token)

            return {
                sub: payload.sub,
                email: payload.email as string,
                email_verified: payload.email_verified as boolean,
                token_use: payload.token_use as string,
            }
        } catch (accessError: any) {
            console.log(
                'Access token verification failed, trying ID token...',
                accessError.message,
            )

            // If access token fails, try ID token
            try {
                const idVerifier = this.getIdVerifier()
                const payload = await idVerifier.verify(token)

                return {
                    sub: payload.sub,
                    email: payload.email as string,
                    email_verified: payload.email_verified as boolean,
                    token_use: 'id',
                }
            } catch (idError: any) {
                console.error(
                    'Token verification failed for both token types:',
                    {
                        accessError: {
                            name: accessError.name,
                            message: accessError.message,
                        },
                        idError: {
                            name: idError.name,
                            message: idError.message,
                        },
                    },
                )

                if (
                    accessError.name === 'JwtExpiredError' ||
                    idError.name === 'JwtExpiredError'
                ) {
                    throw new Error('Token has expired')
                }
                if (
                    accessError.name === 'JwtInvalidSignatureError' ||
                    idError.name === 'JwtInvalidSignatureError'
                ) {
                    throw new Error('Invalid token signature')
                }

                throw new Error(
                    `Token verification failed: ${accessError.message}`,
                )
            }
        }
    }

    static async getUserIdFromToken(
        event: APIGatewayProxyEvent,
    ): Promise<string> {
        const token = this.extractToken(event)

        if (!token) {
            throw new Error('Authorization token is required')
        }

        const decoded = await this.verifyAndDecodeToken(token)
        return decoded.sub // This is the Cognito User Sub
    }
}
