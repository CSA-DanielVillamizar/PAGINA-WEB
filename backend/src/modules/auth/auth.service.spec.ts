import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { ConfigService } from '@nestjs/config'

// Mock ConfigService
class ConfigMock {
  private values: Record<string,string> = {
    FRONTEND_URL: 'http://localhost:5173',
    MULTI_TENANT: 'true'
  }
  get<T=string>(key: string): T | undefined {
    return this.values[key] as T
  }
}

describe('AuthService', () => {
  let service: AuthService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useClass: ConfigMock }
      ]
    }).compile()
    service = module.get<AuthService>(AuthService)
  })

  it('validateUserByEmailDomain marca externo si dominio distinto', () => {
    const result1 = service.validateUserByEmailDomain('alguien@fundacionlamamedellin.org')
    expect(result1.allowed).toBe(true)
    expect(result1.external).toBe(false)
    const result2 = service.validateUserByEmailDomain('otro@otrodominio.com')
    expect(result2.allowed).toBe(true)
    expect(result2.external).toBe(true)
  })

  it('decodeJwt lanza error con token mal formado', async () => {
    await expect(service.validateAzureToken('abc.def')).rejects.toThrow()
  })
})
