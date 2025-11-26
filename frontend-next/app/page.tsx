export default function HomePage() {
  return (
    <main className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Fundación L.A.M.A. Medellín</h1>
      <p className="text-lg mb-6">Mototurismo con propósito. Cultura que deja huella. Somos un legado en movimiento.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <a className="p-4 rounded border hover:bg-brand-50" href="/eventos">Eventos</a>
        <a className="p-4 rounded border hover:bg-brand-50" href="/miembros">Miembros</a>
        <a className="p-4 rounded border hover:bg-brand-50" href="/donaciones">Donaciones</a>
        <a className="p-4 rounded border hover:bg-brand-50" href="/souvenirs">Souvenirs</a>
        <a className="p-4 rounded border hover:bg-brand-50" href="/noticias">Noticias</a>
        <a className="p-4 rounded border hover:bg-brand-50" href="/inscripcion">Formulario Ingreso</a>
      </div>
    </main>
  );
}
