import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Role } from '../roles/role.entity'
import * as bcrypt from 'bcrypt'

describe('UsersService', () => {
  let service: UsersService
  const users: User[] = []
  const roles: Role[] = []

  const userRepoMock = {
    find: jest.fn(async () => users),
    findOne: jest.fn(async ({ where: { id } }) => users.find(u => u.id === id)),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn(async (u) => { users.push(u as User); return u })
  }
  const roleRepoMock = {
    find: jest.fn(async ({ where }) => {
      return where.map((w: any) => ({ id: w.name + '-id', name: w.name }))
    })
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: getRepositoryToken(Role), useValue: roleRepoMock }
      ]
    }).compile()
    service = module.get<UsersService>(UsersService)
  })

  it('debe crear usuario con password hasheado y roles', async () => {
    const dto = { nombreCompleto: 'Juan Perez', correo: 'juan@example.com', password: 'Password123', roles: ['Administrador'] }
    const created = await service.create(dto as any)
    expect(created.passwordHash).toBeDefined()
    expect(await bcrypt.compare('Password123', created.passwordHash!)).toBe(true)
    expect(created.roles[0].name).toBe('Administrador')
  })

  it('debe listar usuarios', async () => {
    const all = await service.findAll()
    expect(all.length).toBeGreaterThan(0)
  })
})
