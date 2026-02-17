# Auth Module

Módulo de autenticación con AWS Cognito.

## Endpoints

### POST /auth/register
Registra un nuevo usuario en Cognito y crea el perfil en la base de datos.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstNames": "Juan Carlos",
  "lastNames": "García López"
}
```

**Response (201):**
```json
{
  "message": "User registered. Please check your email to confirm your account.",
  "data": {
    "userId": "uuid-generated-id",
    "email": "user@example.com",
    "firstNames": "Juan Carlos",
    "lastNames": "García López",
    "userConfirmed": false
  }
}
```

**Flujo de Registro:**
1. Valida que todos los campos estén presentes (email, password, firstNames, lastNames)
2. Registra al usuario en AWS Cognito (autenticación)
3. Crea el perfil del usuario en DynamoDB (datos del usuario)
4. Retorna la información completa del usuario registrado

**Errores Comunes:**
- `409 Conflict` - El usuario ya existe en Cognito
- `400 Bad Request` - Datos inválidos o falta algún campo requerido
- `400 Bad Request` - La contraseña no cumple con los requisitos de Cognito

### POST /auth/validate
Valida/confirma el email del usuario con el código de verificación enviado por Cognito.

**Request Body:**
```json
{
  "email": "user@example.com",
  "confirmationCode": "123456"
}
```

**Response (200):**
```json
{
  "message": "User confirmed successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

**Flujo de Validación:**
1. El usuario recibe un código de 6 dígitos en su email después del registro
2. Envía el código junto con su email a este endpoint
3. Cognito valida el código y confirma la cuenta
4. El usuario ahora puede hacer login

**Errores Comunes:**
- `400 Bad Request` - Código de verificación inválido
- `410 Gone` - El código de verificación ha expirado
- `404 Not Found` - Usuario no encontrado
- `409 Conflict` - El usuario ya está confirmado

### POST /auth/login
Inicia sesión con credenciales de usuario.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "eyJraWQiOiI...",
    "idToken": "eyJraWQiOiI...",
    "refreshToken": "eyJjdHkiOi...",
    "expiresIn": 3600,
    "email": "user@example.com"
  }
}
```

**Errores Comunes:**
- `401 Unauthorized` - Credenciales inválidas
- `400 Bad Request` - Email no confirmado

## Configuración

### Variables de Entorno Requeridas

```bash
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
USERS_TABLE=Users
```

### Configuración de Cognito User Pool

Para que el módulo funcione correctamente, tu User Pool de Cognito debe estar configurado con:

1. **App Client:**
   - Enable "ALLOW_USER_PASSWORD_AUTH" flow
   - Disable "Generate client secret" (para simplificar la integración)

2. **Políticas de Contraseña:**
   - Mínimo 8 caracteres
   - Puede configurar requisitos adicionales según necesidades

3. **Atributos Requeridos:**
   - Email (requerido)

4. **Verificación:**
   - Email verification (recomendado)
   - Auto-confirm users (opcional, para desarrollo)

## Arquitectura

```
auth/
├── domain/           # Entidades y lógica de negocio (legacy)
├── application/      # Casos de uso
│   ├── register.ts   # Registro en Cognito + creación de usuario
│   ├── validateUser.ts # Confirmación de email con código
│   └── login.ts      # Autenticación con Cognito
├── infrastructure/   # Implementaciones externas
│   └── cognitoService.ts
└── adapters/         # Lambda handlers
    ├── register/
    ├── validate/
    └── login/
```

## Flujo de Autenticación

### Registro (Register)
1. Cliente envía email, password, firstNames, lastNames
2. Lambda valida los datos
3. Se registra el usuario en Cognito (autenticación)
4. Se crea el perfil del usuario en DynamoDB (tabla Users)
5. Se retorna el userId y la información del usuario
6. Cognito envía un código de verificación por email al usuario

### Validación (Validate)
1. Usuario recibe código de 6 dígitos en su email
2. Cliente envía email y código de confirmación
3. Lambda confirma el usuario en Cognito
4. El usuario ahora puede hacer login

### Login
1. Cliente envía email y password
2. Lambda valida con Cognito
3. Cognito retorna tokens JWT (accessToken, idToken, refreshToken)
4. Cliente usa estos tokens para acceder a recursos protegidos

**Nota:** El usuario debe estar confirmado para poder hacer login. Si intenta hacer login sin confirmar su email, recibirá el error "User email not confirmed".

## Notas

- Las contraseñas son manejadas por Cognito (no se almacenan en la aplicación)
- Los tokens JWT son generados y firmados por Cognito
- Por defecto, los usuarios requieren confirmación de email
- En desarrollo, puedes usar `adminConfirmUser()` para confirmar usuarios automáticamente
- El userId retornado es el generado por DynamoDB, no el Cognito Sub
