# Birty API

API Serverless construida con AWS Lambda, DynamoDB, API Gateway y Cognito, siguiendo los principios de Domain-Driven Design (DDD).

## Arquitectura

El proyecto sigue una arquitectura modular con DDD:

```
src/
└── user/                    # Módulo de usuario
    ├── domain/              # Capa de dominio (lógica de negocio)
    │   ├── user.ts                  # Entidad User + Value Objects
    │   └── user.repository.ts       # Interface del repositorio
    ├── application/         # Capa de aplicación (casos de uso)
    │   ├── createUser.ts
    │   ├── getUser.ts
    │   ├── updateUser.ts
    │   └── deleteUser.ts
    ├── infrastructure/      # Capa de infraestructura
    │   └── dynamoUserRepository.ts  # Implementación DynamoDB
    ├── adapters/            # Capa de adaptadores (handlers)
    │   ├── createUser.handler.ts
    │   ├── getUser.handler.ts
    │   ├── updateUser.handler.ts
    │   └── deleteUser.handler.ts
    └── serverless.yml       # Configuración de funciones del módulo

serverless.yml               # Configuración central (importa módulos)
```

## Características

- ✅ **Domain-Driven Design**: Separación clara de responsabilidades
- ✅ **TypeScript**: Tipado estático para mayor seguridad
- ✅ **AWS Lambda**: Funciones serverless escalables
- ✅ **DynamoDB**: Base de datos NoSQL
- ✅ **Cognito**: Autenticación y autorización
- ✅ **API Gateway**: REST API con CORS
- ✅ **Deploy Independiente**: Cada función puede desplegarse por separado
- ✅ **pnpm**: Gestor de paquetes eficiente

## Requisitos Previos

- Node.js >= 18
- pnpm
- AWS CLI configurado
- Serverless Framework

## Instalación

```bash
# Instalar dependencias
pnpm install

# Compilar TypeScript
pnpm run build
```

## Despliegue

### 1. Desplegar todo el proyecto (recursos + todos los módulos)

```bash
pnpm run deploy
```

Esto desplegará:
- Tabla DynamoDB: `{stage}-users`
- User Pool de Cognito
- Todas las funciones Lambda de todos los módulos
- HTTP API Gateway configurado

### 2. Desplegar solo un módulo específico

Si solo has hecho cambios en el módulo `user` y no quieres redesplegar otros módulos:

```bash
# Usando npm scripts
pnpm run deploy:user

# O con el script de shell
./deploy-module.sh user dev
```

Esto desplegará únicamente las funciones Lambda del módulo user, sin afectar otros módulos ni recursos compartidos.

### 3. Desplegar en diferentes entornos

```bash
# Deploy completo
pnpm run deploy:dev      # Entorno de desarrollo
pnpm run deploy:prod     # Entorno de producción

# Deploy de módulo específico
pnpm run deploy:user:dev  # Módulo user en dev
pnpm run deploy:user:prod # Módulo user en prod

# O usando el script
./deploy-module.sh user dev
./deploy-module.sh user prod
```

## Arquitectura del Proyecto

### Configuración Modular con Deploy Independiente

El proyecto utiliza una **arquitectura dual** que permite tanto deploy completo como deploy por módulos:

#### 1. Deploy Completo (serverless.yml raíz)
```yaml
# serverless.yml (raíz)
service: birty-api
provider:
  # Configuración global
functions:
  ${file(src/user/serverless.functions.yml)}  # Solo definiciones de funciones
resources:
  # Recursos compartidos (DynamoDB, Cognito)
```

#### 2. Deploy por Módulo (serverless.standalone.yml)
```yaml
# src/user/serverless.standalone.yml
service: birty-api-user
provider:
  # Configuración específica del módulo
functions:
  createUser:
    handler: adapters/createUser.handler
    events: [...]
```

Cada módulo tiene **dos archivos de configuración**:
- `serverless.functions.yml`: Solo definiciones de funciones (para deploy completo)
- `serverless.standalone.yml`: Configuración completa (para deploy independiente)

Esta estructura permite:
- ✅ **Deploy completo**: Un comando despliega todos los recursos y módulos
- ✅ **Deploy por módulo**: Desplegar solo el módulo modificado sin afectar otros
- ✅ **Aislamiento**: Cambios en un módulo no requieren redespliegue de otros
- ✅ **Escalabilidad**: Fácil agregar nuevos módulos sin afectar los existentes

## API Endpoints

Todos los endpoints requieren autenticación con Cognito (token JWT en el header `Authorization`).

### Crear Usuario
```http
POST /users
Content-Type: application/json

{
  "firstNames": "Juan Carlos",
  "lastNames": "Pérez García",
  "email": "juan.perez@example.com"
}
```

### Obtener Usuario
```http
GET /users/{id}
```

### Actualizar Usuario
```http
PUT /users/{id}
Content-Type: application/json

{
  "firstNames": "Juan Carlos",
  "lastNames": "Pérez García",
  "email": "nuevo.email@example.com"
}
```

### Eliminar Usuario
```http
DELETE /users/{id}
```

## Modelo de Usuario

```typescript
{
  id: string;           // UUID generado automáticamente
  firstNames: string;   // Nombres
  lastNames: string;    // Apellidos
  email: string;        // Email (único y validado)
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

## Autenticación con Cognito

### Registrar un usuario en Cognito

```bash
aws cognito-idp sign-up \
  --client-id YOUR_CLIENT_ID \
  --username user@example.com \
  --password YourPassword123! \
  --user-attributes Name=email,Value=user@example.com
```

### Confirmar usuario

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username user@example.com
```

### Obtener token de autenticación

```bash
aws cognito-idp initiate-auth \
  --client-id YOUR_CLIENT_ID \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword123!
```

## Desarrollo Local

```bash
# Instalar serverless-offline
pnpm add -D serverless-offline

# Ejecutar localmente (desde cada carpeta de función)
cd functions/create-user
serverless offline
```

## Variables de Entorno

- `USERS_TABLE`: Nombre de la tabla DynamoDB
- `AWS_REGION`: Región de AWS (default: us-east-1)

## Estructura de Capas DDD

### Domain (Dominio)
- **Entities**: Lógica de negocio principal (`User`)
- **Value Objects**: Objetos inmutables (`Email`, `UserId`)
- **Repositories**: Interfaces de persistencia

### Application (Aplicación)
- **Use Cases**: Casos de uso del negocio
  - `CreateUserUseCase`
  - `GetUserUseCase`
  - `UpdateUserUseCase`
  - `DeleteUserUseCase`

### Infrastructure (Infraestructura)
- **Repositories**: Implementación con DynamoDB
- **Persistence**: Cliente de DynamoDB

### Presentation (Presentación)
- **Handlers**: Lambda handlers para API Gateway

## Scripts Disponibles

```bash
# Build
pnpm run build                    # Compilar TypeScript

# Deploy completo
pnpm run deploy                   # Deploy todo (stage dev)
pnpm run deploy:dev               # Deploy todo en desarrollo
pnpm run deploy:prod              # Deploy todo en producción
pnpm run deploy:resources         # Solo recursos compartidos

# Deploy por módulo
pnpm run deploy:user              # Deploy módulo user
pnpm run deploy:user:dev          # Deploy módulo user en dev
pnpm run deploy:user:prod         # Deploy módulo user en prod

# Información
pnpm run info                     # Info del proyecto completo
pnpm run info:user                # Info del módulo user

# Eliminar
pnpm run remove                   # Eliminar stack completo
pnpm run remove:user              # Eliminar módulo user

# Local
pnpm run offline                  # Ejecutar localmente
```

### ¿Cuándo usar cada tipo de deploy?

#### Deploy Completo (`pnpm run deploy`)
Usa cuando:
- ✅ Es el primer deploy del proyecto
- ✅ Has modificado recursos compartidos (DynamoDB, Cognito)
- ✅ Has agregado un nuevo módulo
- ✅ Has modificado la configuración global del provider
- ✅ Quieres asegurar consistencia completa

#### Deploy por Módulo (`pnpm run deploy:user`)
Usa cuando:
- ✅ Solo modificaste código de un módulo específico
- ✅ Quieres deploys más rápidos (solo las funciones del módulo)
- ✅ Trabajas en equipo y cada uno maneja módulos diferentes
- ✅ No quieres arriesgar afectar otros módulos en producción
- ✅ Necesitas hacer hotfix solo en un módulo

## Ventajas de la Arquitectura Modular con Deploy Independiente

### Flexibilidad de Deploy
- ✅ **Deploy completo**: Para cambios globales o configuración inicial
- ✅ **Deploy por módulo**: Para cambios aislados y deploys rápidos
- ✅ **Sin dependencias cruzadas**: Módulos se despliegan independientemente

### Desarrollo en Equipo
- ✅ **Equipos separados**: Cada equipo puede trabajar y desplegar su módulo
- ✅ **Sin conflictos**: Cambios en un módulo no afectan otros
- ✅ **Testing independiente**: Probar módulos en aislamiento

### Producción más Segura
- ✅ **Hotfix localizado**: Reparar un módulo sin tocar los demás
- ✅ **Rollback granular**: Revertir solo el módulo con problemas
- ✅ **Menor riesgo**: Deploy de un módulo no afecta servicios de otros módulos

### Performance
- ✅ **Deploys más rápidos**: Solo desplegar lo que cambió
- ✅ **Menos tiempo de inactividad**: Deploy parcial es más rápido

### Organización
- ✅ **Código cohesivo**: Todo relacionado con User está en `src/user/`
- ✅ **Configuración dual**: Flexibilidad sin duplicación excesiva
- ✅ **Escalabilidad horizontal**: Agregar módulos sin afectar existentes

## Eliminar recursos

```bash
# Eliminar todo el stack
pnpm run remove

# O específicamente por stage
serverless remove --stage dev
serverless remove --stage prod
```

## Agregar un Nuevo Módulo

Para agregar un nuevo módulo (ejemplo: `product`):

1. **Crear la estructura del módulo**:
```bash
mkdir -p src/product/{domain,application,infrastructure,adapters}
```

2. **Crear serverless.functions.yml (para deploy completo)**:
```yaml
# src/product/serverless.functions.yml
createProduct:
  handler: src/product/adapters/createProduct.handler
  events:
    - httpApi:
        path: /products
        method: post

getProduct:
  handler: src/product/adapters/getProduct.handler
  events:
    - httpApi:
        path: /products/{id}
        method: get
```

3. **Crear serverless.standalone.yml (para deploy independiente)**:
```yaml
# src/product/serverless.standalone.yml
service: birty-api-product

frameworkVersion: '3'

provider:
    name: aws
    runtime: nodejs20.x
    region: 'eu-west-3'
    stage: ${opt:stage, 'dev'}
    environment:
        PRODUCTS_TABLE: ${self:provider.stage}-products
    iam:
        role:
            statements:
                - Effect: Allow
                  Action:
                      - dynamodb:*
                  Resource:
                      - Fn::ImportValue: ${self:provider.stage}-ProductsTableArn

plugins:
    - serverless-plugin-typescript

functions:
    createProduct:
        handler: adapters/createProduct.handler
        events:
            - httpApi:
                  path: /products
                  method: post
```

4. **Importar en el serverless.yml raíz**:
```yaml
functions:
  ${file(src/user/serverless.functions.yml)}
  ${file(src/product/serverless.functions.yml)}
```

5. **Agregar scripts en package.json**:
```json
{
  "scripts": {
    "deploy:product": "cd src/product && serverless deploy -c serverless.standalone.yml",
    "deploy:product:dev": "cd src/product && serverless deploy -c serverless.standalone.yml --stage dev",
    "deploy:product:prod": "cd src/product && serverless deploy -c serverless.standalone.yml --stage prod"
  }
}
```

6. **Deploy**:
```bash
# Deploy completo (incluye product)
pnpm run deploy

# O deploy solo del módulo product
pnpm run deploy:product
```

## Licencia

ISC
