# Birty API

Serverless API built with AWS Lambda, DynamoDB, API Gateway, and Cognito, following Hexagonal Architecture principles.

## Architecture

The project follows a modular hexagonal architecture with clear separation of concerns:

```
src/
├── auth/                           # Authentication module
│   ├── domain/                     # Domain layer (business logic)
│   │   └── auth.ts                 # Auth entity
│   ├── application/                # Application layer (use cases)
│   │   ├── register.ts             # User registration
│   │   ├── login.ts                # User login
│   │   └── validateUser.ts         # Email verification
│   ├── infrastructure/             # Infrastructure layer
│   │   └── cognitoService.ts       # Cognito integration
│   └── adapters/                   # Adapters layer (Lambda handlers)
│       ├── register/
│       ├── login/
│       └── validate/
├── user/                           # User module
│   ├── domain/                     # Domain layer
│   │   ├── user.ts                 # User entity + Value Objects
│   │   └── user.repository.ts      # Repository interface
│   ├── application/                # Application layer
│   │   ├── createUser.ts
│   │   ├── getUser.ts
│   │   ├── updateUser.ts
│   │   └── deleteUser.ts
│   ├── infrastructure/             # Infrastructure layer
│   │   └── dynamoUserRepository.ts # DynamoDB implementation
│   └── adapters/                   # Adapters layer
│       ├── createUser/
│       ├── getUser/
│       ├── updateUser/
│       └── deleteUser/
├── birthday/                       # Birthday module
│   ├── domain/                     # Domain layer
│   │   ├── birthday.ts             # Birthday entity + Value Objects
│   │   └── birthday.repository.ts  # Repository interface
│   ├── application/                # Application layer
│   │   ├── createBirthday.ts
│   │   ├── getBirthday.ts
│   │   ├── listBirthdays.ts
│   │   ├── updateBirthday.ts
│   │   └── deleteBirthday.ts
│   ├── infrastructure/             # Infrastructure layer
│   │   └── dynamoBirthdayRepository.ts # DynamoDB implementation
│   └── adapters/                   # Adapters layer
│       ├── createBirthday/
│       ├── getBirthday/
│       ├── listBirthdays/
│       ├── updateBirthday/
│       └── deleteBirthday/
└── shared/                         # Shared utilities
    └── services/
        └── tokenService.ts         # JWT token verification

serverless.yml                      # Central configuration
```

## Features

- ✅ **Hexagonal Architecture**: Clear separation of domain, application, infrastructure, and adapters
- ✅ **TypeScript**: Static typing for enhanced safety
- ✅ **AWS Lambda**: Scalable serverless functions
- ✅ **DynamoDB**: NoSQL database with GSI support
- ✅ **Cognito**: Authentication and authorization with JWT tokens
- ✅ **API Gateway HTTP API**: REST API with JWT authorizer
- ✅ **Token-Based Security**: All protected endpoints use access tokens
- ✅ **pnpm**: Efficient package manager

## Prerequisites

- Node.js >= 20
- pnpm
- AWS CLI configured
- Serverless Framework v3

## Installation

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build
```

## Deployment

```bash
# Deploy complete project
pnpm run deploy

# Deploy to specific stage
pnpm run deploy -- --stage dev
pnpm run deploy -- --stage prod
```

This will deploy:
- DynamoDB Tables: `birty-api-users-{stage}`, `birty-api-birthdays-{stage}`
- Cognito User Pool with email verification
- All Lambda functions for auth, user, and birthday modules
- HTTP API Gateway with Cognito JWT authorizer

## API Endpoints

### Authentication Endpoints (Public)

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstNames": "John",
  "lastNames": "Doe"
}

Response:
{
  "message": "User registered successfully",
  "userId": "uuid",
  "userSub": "cognito-sub"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "message": "Login successful",
  "accessToken": "...",
  "idToken": "...",
  "refreshToken": "..."
}
```

#### Validate Email
```http
POST /auth/validate
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "message": "User validated successfully"
}
```

### User Endpoints (Protected)

All user endpoints require `Authorization: Bearer {accessToken}` header.

#### Get Current User
```http
GET /users/me
Authorization: Bearer {accessToken}

Response:
{
  "user": {
    "id": "uuid",
    "cognitoSub": "cognito-sub",
    "firstNames": "John",
    "lastNames": "Doe",
    "email": "user@example.com",
    "createdAt": "2026-03-02T00:00:00.000Z",
    "updatedAt": "2026-03-02T00:00:00.000Z"
  }
}
```

#### Update Current User
```http
PUT /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstNames": "John Updated",
  "lastNames": "Doe Updated",
  "email": "newemail@example.com"
}

Response:
{
  "message": "User updated successfully",
  "user": { ... }
}
```

#### Delete Current User
```http
DELETE /users/me
Authorization: Bearer {accessToken}

Response:
{
  "message": "User deleted successfully"
}
```

### Birthday Endpoints (Protected)

All birthday endpoints require `Authorization: Bearer {accessToken}` header.

#### Create Birthday
```http
POST /birthdays
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Mom's Birthday",
  "birthDate": "1970-05-15",
  "notes": "Remember to buy flowers",
  "reminderDays": 7
}

Response:
{
  "message": "Birthday created successfully",
  "birthday": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Mom's Birthday",
    "birthDate": "1970-05-15",
    "notes": "Remember to buy flowers",
    "reminderDays": 7,
    "createdAt": "2026-03-02T00:00:00.000Z",
    "updatedAt": "2026-03-02T00:00:00.000Z"
  }
}
```

#### List All Birthdays
```http
GET /birthdays
Authorization: Bearer {accessToken}

Response:
{
  "birthdays": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "name": "Mom's Birthday",
      "birthDate": "1970-05-15",
      "notes": "Remember to buy flowers",
      "reminderDays": 7,
      "createdAt": "2026-03-02T00:00:00.000Z",
      "updatedAt": "2026-03-02T00:00:00.000Z"
    }
  ]
}
```
*Note: Birthdays are sorted by proximity to next birthday (closest first)*

#### Get Specific Birthday
```http
GET /birthdays/{id}
Authorization: Bearer {accessToken}

Response:
{
  "birthday": { ... }
}
```

#### Update Birthday
```http
PUT /birthdays/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Mom's Birthday Updated",
  "birthDate": "1970-05-15",
  "notes": "Updated notes",
  "reminderDays": 14
}

Response:
{
  "message": "Birthday updated successfully",
  "birthday": { ... }
}
```

#### Delete Birthday
```http
DELETE /birthdays/{id}
Authorization: Bearer {accessToken}

Response:
{
  "message": "Birthday deleted successfully"
}
```

## Data Models

### User Model
```typescript
{
  id: string;           // UUID
  cognitoSub: string;   // Cognito user sub (for token auth)
  firstNames: string;   // First names
  lastNames: string;    // Last names
  email: string;        // Email (unique, validated)
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

### Birthday Model
```typescript
{
  id: string;           // UUID
  userId: string;       // User ID (owner)
  name: string;         // Birthday person's name
  birthDate: string;    // Date in YYYY-MM-DD format
  notes?: string;       // Optional notes
  reminderDays?: number; // Days before to remind (optional)
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

## Environment Variables

- `USERS_TABLE`: DynamoDB Users table name
- `BIRTHDAYS_TABLE`: DynamoDB Birthdays table name
- `COGNITO_USER_POOL_ID`: Cognito User Pool ID
- `COGNITO_CLIENT_ID`: Cognito User Pool Client ID
- `AWS_REGION`: AWS Region (default: eu-west-3)

## DynamoDB Tables

### Users Table
- **Primary Key**: `id` (String)
- **GSI**: `CognitoSubIndex` on `cognitoSub` (for token-based queries)
- **Billing**: PAY_PER_REQUEST

### Birthdays Table
- **Primary Key**: `id` (String)
- **GSI**: `UserIdIndex` on `userId` (for user's birthdays queries)
- **Billing**: PAY_PER_REQUEST

## Hexagonal Architecture Layers

### Domain Layer
- **Entities**: Core business logic (`User`, `Birthday`)
- **Value Objects**: Immutable objects (`Email`, `UserId`, `BirthdayId`, `BirthDate`)
- **Repository Interfaces**: Persistence contracts

### Application Layer
- **Use Cases**: Business use cases with validation
- **DTOs**: Data transfer objects for each operation
- **Business Rules**: Age calculation, days until birthday, etc.

### Infrastructure Layer
- **Repository Implementations**: DynamoDB persistence
- **External Services**: Cognito integration
- **AWS SDK Clients**: DynamoDB, Cognito clients

### Adapters Layer
- **Lambda Handlers**: API Gateway event handlers
- **Request/Response Mapping**: HTTP to domain translation
- **Error Handling**: User-friendly error responses

## Authentication Flow

1. **Registration**: User signs up → Cognito creates user → Email verification required → User profile created
2. **Email Verification**: User receives code → Validates via `/auth/validate` → Account activated
3. **Login**: User signs in → Cognito returns JWT tokens (access, id, refresh)
4. **Protected Requests**: Client sends access token → API Gateway validates → Lambda extracts user from token

## Security Features

- ✅ **JWT Token Verification**: All protected endpoints validate Cognito tokens
- ✅ **Ownership Validation**: Users can only access their own resources
- ✅ **Cognito Integration**: Industry-standard authentication
- ✅ **Password Policies**: Minimum 8 characters, uppercase, lowercase, numbers, symbols
- ✅ **Email Verification**: Required before account activation

## Available Scripts

```bash
# Build
pnpm run build                    # Compile TypeScript

# Deploy
pnpm run deploy                   # Deploy complete project
pnpm run deploy -- --stage dev    # Deploy to dev
pnpm run deploy -- --stage prod   # Deploy to prod

# Remove
pnpm run remove                   # Remove complete stack
pnpm run remove -- --stage dev    # Remove dev stack

# Info
serverless info                   # Get deployment information
```

## Testing the API

### 1. Register a new user
```bash
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstNames": "Test",
    "lastNames": "User"
  }'
```

### 2. Verify email (check your email for code)
```bash
curl -X POST https://your-api-url/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

### 3. Login
```bash
curl -X POST https://your-api-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 4. Use the access token for protected endpoints
```bash
# Get current user
curl -X GET https://your-api-url/users/me \
  -H "Authorization: Bearer {accessToken}"

# Create a birthday
curl -X POST https://your-api-url/birthdays \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Birthday Person",
    "birthDate": "1990-12-25",
    "reminderDays": 7
  }'

# List birthdays
curl -X GET https://your-api-url/birthdays \
  -H "Authorization: Bearer {accessToken}"
```

## Adding a New Module

To add a new module (e.g., `reminder`):

1. **Create module structure**:
```bash
mkdir -p src/reminder/{domain,application,infrastructure,adapters}
```

2. **Implement layers**:
- Domain: Entity, value objects, repository interface
- Application: Use cases with DTOs
- Infrastructure: Repository implementation
- Adapters: Lambda handlers with `.yml` configs

3. **Add functions to serverless.yml**:
```yaml
functions:
  createReminder: ${file(src/reminder/adapters/createReminder/createReminder.yml)}
  # ... other functions
```

4. **Add table to resources** (if needed):
```yaml
resources:
  Resources:
    RemindersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-reminders-${self:provider.stage}
        # ... configuration
```

5. **Deploy**:
```bash
pnpm run deploy
```

## Best Practices

- ✅ Keep domain logic pure and framework-agnostic
- ✅ Use value objects for complex validations
- ✅ Validate input at application layer before reaching domain
- ✅ Repository interfaces in domain, implementations in infrastructure
- ✅ Lambda handlers only map requests/responses, delegate to use cases
- ✅ Use DTOs for clear contract between layers
- ✅ Always verify resource ownership in protected endpoints

## Troubleshooting

### Token Verification Issues
- Ensure `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` are set correctly
- Access tokens require `clientId: null` in verifier configuration
- Use access tokens for API calls, not ID tokens

### DynamoDB Permission Errors
- Ensure IAM role has Query permission for GSI operations
- Resource ARN must include `index/*` for GSI queries

### CORS Issues
- API Gateway HTTP API with JWT authorizer configured
- Ensure client sends Authorization header properly

## License

ISC

