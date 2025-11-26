# ================================
# 1. Core NestJS utilities
# ================================
npm install @nestjs/config class-validator class-transformer

# ================================
# 2. Swagger (API docs)
# ================================
npm install @nestjs/swagger swagger-ui-express

# ================================
# 3. Auth (JWT + Passport + Bcrypt)
# ================================
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install -D @types/bcrypt

# ================================
# 4. Database (TypeORM + PostgreSQL)
#    If you use PostgreSQL
# ================================
npm install @nestjs/typeorm typeorm pg

# ================================
# 5. Dev tools (ESLint + TypeScript latest)
# ================================
npm install -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest typescript@latest
npm i nodemailer twilio
npm i -D @types/nodemailer
