/** Configuración básica de Jest para pruebas unitarias */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  }
}
