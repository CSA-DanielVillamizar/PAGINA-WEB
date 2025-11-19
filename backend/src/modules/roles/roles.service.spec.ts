import { Test, TestingModule } from '@nestjs/testing'
import { RolesService } from './roles.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Role } from './role.entity'

describe('RolesService', () => {
  let service: RolesService
  const rolesStore: Role[] = []
  const repoMock = {
    find: jest.fn(async () => rolesStore),
    findOne: jest.fn(async ({ where: { name } }) => rolesStore.find(r => r.name === name) || null),
    create: jest.fn((data) => ({ id: data.name + '-id', ...data })),
    save: jest.fn(async (r) => { rolesStore.push(r as Role); return r })
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, { provide: getRepositoryToken(Role), useValue: repoMock }]
    }).compile()
    service = module.get<RolesService>(RolesService)
  })

  it('seed debe crear los 10 roles si no existen', async () => {
    await service.seed()
    expect(rolesStore.length).toBe(10)
    expect(rolesStore.some(r => r.name === 'Administrador')).toBe(true)
  })

  it('findByName debe retornar rol existente', async () => {
    const rol = await service.findByName('Administrador')
    expect(rol).toBeDefined()
    expect(rol!.name).toBe('Administrador')
  })
})
