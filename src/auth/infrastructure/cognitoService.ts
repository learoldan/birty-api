import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    AuthFlowType,
    AdminConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'

export interface CognitoConfig {
    userPoolId: string
    clientId: string
    region: string
}

export interface SignUpResult {
    userSub: string
    userConfirmed: boolean
}

export interface SignInResult {
    accessToken: string
    idToken: string
    refreshToken: string
    expiresIn: number
}

export class CognitoService {
    private readonly client: CognitoIdentityProviderClient
    private readonly userPoolId: string
    private readonly clientId: string

    constructor(config?: CognitoConfig) {
        this.userPoolId =
            config?.userPoolId || process.env.COGNITO_USER_POOL_ID || ''
        this.clientId = config?.clientId || process.env.COGNITO_CLIENT_ID || ''
        const region = config?.region || process.env.AWS_REGION || 'eu-west-3'

        this.client = new CognitoIdentityProviderClient({ region })

        if (!this.userPoolId || !this.clientId) {
            throw new Error('Cognito User Pool ID and Client ID are required')
        }
    }

    async signUp(email: string, password: string): Promise<SignUpResult> {
        const command = new SignUpCommand({
            ClientId: this.clientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
            ],
        })

        try {
            const response = await this.client.send(command)

            return {
                userSub: response.UserSub || '',
                userConfirmed: response.UserConfirmed || false,
            }
        } catch (error: any) {
            if (error.name === 'UsernameExistsException') {
                throw new Error('User already exists')
            }
            if (error.name === 'InvalidPasswordException') {
                throw new Error('Password does not meet requirements')
            }
            if (error.name === 'InvalidParameterException') {
                throw new Error('Invalid email or password format')
            }
            throw new Error(error.message || 'Registration failed')
        }
    }

    async signIn(email: string, password: string): Promise<SignInResult> {
        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: this.clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        })

        try {
            const response = await this.client.send(command)

            if (!response.AuthenticationResult) {
                throw new Error('Authentication failed')
            }

            return {
                accessToken: response.AuthenticationResult.AccessToken || '',
                idToken: response.AuthenticationResult.IdToken || '',
                refreshToken: response.AuthenticationResult.RefreshToken || '',
                expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
            }
        } catch (error: any) {
            if (
                error.name === 'NotAuthorizedException' ||
                error.name === 'UserNotFoundException'
            ) {
                throw new Error('Invalid credentials')
            }
            if (error.name === 'UserNotConfirmedException') {
                throw new Error('User email not confirmed')
            }
            throw new Error(error.message || 'Login failed')
        }
    }

    async adminConfirmUser(username: string): Promise<void> {
        const command = new AdminConfirmSignUpCommand({
            UserPoolId: this.userPoolId,
            Username: username,
        })

        try {
            await this.client.send(command)
        } catch (error: any) {
            throw new Error(error.message || 'Failed to confirm user')
        }
    }
}
