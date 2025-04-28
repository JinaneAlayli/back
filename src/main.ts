import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify"
import cookie from "@fastify/cookie"
import cors from "@fastify/cors"
import multipart from "@fastify/multipart"
import { Logger } from "@nestjs/common"

async function bootstrap() {
  const logger = new Logger("Bootstrap")

  logger.log("Initializing NestJS application with Fastify")

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true, // Enable Fastify logger
    }),
  )

  logger.log("Registering Fastify plugins")

  // Configure multipart with appropriate limits
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1, // Only allow one file per request
    },
    attachFieldsToBody: false, // Important: Don't attach fields to body for streaming
  })

  logger.log("Multipart plugin registered")

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || "your-cookie-secret",
  })

  logger.log("Cookie plugin registered")

  // Configure CORS
  const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:3000"]

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })

  logger.log(`CORS configured with origins: ${corsOrigins.join(", ")}`)

  // Configure global prefix if needed
  if (process.env.API_PREFIX) {
    app.setGlobalPrefix(process.env.API_PREFIX)
    logger.log(`Global prefix set to: ${process.env.API_PREFIX}`)
  }

  // Get port and host from environment
  const PORT = Number.parseInt(process.env.PORT || "5000", 10)
  const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost")

  // Start the server
  await app.listen(PORT, HOST)
  logger.log(`Server running at http://${HOST}:${PORT}`)
}

bootstrap().catch((err) => {
  const logger = new Logger("Bootstrap")
  logger.error(`Failed to start application: ${err.message}`, err.stack)
  process.exit(1)
})
