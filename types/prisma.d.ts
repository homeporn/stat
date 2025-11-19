declare module '@prisma/client' {
  export type PrismaClientOptions = Record<string, unknown>

  export class PrismaClient {
    constructor(options?: PrismaClientOptions)
    [key: string]: any
  }
}
