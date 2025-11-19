import React from 'react'

export default function MotoTouring() {
  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8">¿Qué es Moto-Touring?</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-2xl font-semibold mb-4">Definición</h3>
          <p className="text-gray-700 leading-relaxed">
            El moto-touring es una modalidad de motociclismo que combina el viaje de larga distancia 
            con la exploración de rutas escénicas. No es una carrera ni competencia, sino un estilo 
            de vida que permite descubrir paisajes, culturas y experiencias únicas sobre dos ruedas.
          </p>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold mb-4">Beneficios</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Desarrollo de habilidades de conducción avanzadas</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Conexión con la naturaleza y cultura local</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Compañerismo y hermandad entre motociclistas</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Superación personal y aventura</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-6">Galería de Campeones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Imagen {i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
