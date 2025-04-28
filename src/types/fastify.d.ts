import "fastify"

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: number
      email: string
      role_id: number
      name: string
      company_id?: number
      team_id?: number
    }
  }
}
