import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

interface FeaturedProject {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  imagenUrl?: string;
  ubicacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  beneficiarios: number;
  tags?: string[];
}

interface ProjectForm {
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  imagenUrl?: string;
  ubicacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  beneficiarios?: number;
  tags?: string;
}

/**
 * Panel de administración de Proyectos Destacados
 * Acceso restringido a roles de junta: Presidente, Vicepresidente, Secretario, Tesorero
 */
export default function FeaturedProjectsAdmin() {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectForm>();

  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/featured-projects');
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Error al cargar proyectos. Verifica tu sesión y permisos.');
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/featured-projects/stats');
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onSubmit = async (formData: ProjectForm) => {
    try {
      const payload = {
        ...formData,
        beneficiarios: formData.beneficiarios ? Number(formData.beneficiarios) : 0,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingId) {
        await api.patch(`/featured-projects/${editingId}`, payload);
        alert('Proyecto actualizado exitosamente');
      } else {
        await api.post('/featured-projects', payload);
        alert('Proyecto creado exitosamente');
      }

      reset();
      setEditingId(null);
      setShowForm(false);
      loadProjects();
      loadStats();
    } catch (error: any) {
      console.error('Error saving project:', error);
      const message = error.response?.data?.message || 'Error al guardar. Verifica tus permisos (solo junta).';
      alert(message);
    }
  };

  const editProject = (project: FeaturedProject) => {
    setEditingId(project.id);
    setValue('nombre', project.nombre);
    setValue('descripcion', project.descripcion);
    setValue('tipo', project.tipo);
    setValue('estado', project.estado);
    setValue('imagenUrl', project.imagenUrl || '');
    setValue('ubicacion', project.ubicacion || '');
    setValue('fechaInicio', project.fechaInicio || '');
    setValue('fechaFin', project.fechaFin || '');
    setValue('beneficiarios', project.beneficiarios || 0);
    setValue('tags', project.tags?.join(', ') || '');
    setShowForm(true);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await api.delete(`/featured-projects/${id}`);
      alert('Proyecto eliminado exitosamente');
      loadProjects();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      const message = error.response?.data?.message || 'Error al eliminar. Verifica tus permisos (solo junta).';
      alert(message);
    }
  };

  const cancelEdit = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
  };

  const typeColors: Record<string, string> = {
    salud: 'bg-red-100 text-red-800',
    educacion: 'bg-blue-100 text-blue-800',
    comunitario: 'bg-green-100 text-green-800',
    acompanamiento: 'bg-purple-100 text-purple-800',
  };

  const statusColors: Record<string, string> = {
    'En curso': 'bg-yellow-100 text-yellow-800',
    'Finalizado': 'bg-green-100 text-green-800',
    'Próximo': 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos Destacados</h1>
          <p className="text-gray-600 mt-1">Gestión de proyectos sociales (acceso: roles de junta)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancelar' : 'Nuevo Proyecto'}
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Proyectos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">En Curso</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.enCurso}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Finalizados</p>
            <p className="text-2xl font-bold text-green-600">{stats.finalizados}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Próximos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.proximos}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Beneficiarios</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalBeneficiarios.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  {...register('nombre', { required: 'Campo requerido' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="Ej: Jornada de Salud Rural"
                />
                {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo *</label>
                <select
                  {...register('tipo', { required: 'Campo requerido' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                >
                  <option value="salud">Salud</option>
                  <option value="educacion">Educación</option>
                  <option value="comunitario">Apoyo Comunitario</option>
                  <option value="acompanamiento">Acompañamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado *</label>
                <select
                  {...register('estado', { required: 'Campo requerido' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                >
                  <option value="En curso">En curso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Próximo">Próximo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                <input
                  {...register('ubicacion')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="Ej: Oriente antioqueño"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  {...register('fechaInicio')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  {...register('fechaFin')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Beneficiarios</label>
                <input
                  type="number"
                  {...register('beneficiarios')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL Imagen</label>
                <input
                  {...register('imagenUrl')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción *</label>
              <textarea
                {...register('descripcion', { required: 'Campo requerido' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 resize-none"
                rows={3}
                placeholder="Descripción detallada del proyecto..."
              />
              {errors.descripcion && <span className="text-red-500 text-sm">{errors.descripcion.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (separados por coma)</label>
              <input
                {...register('tags')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="Ej: rural, salud, urgente"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Actualizar' : 'Crear'} Proyecto
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de proyectos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beneficiarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{project.nombre}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{project.descripcion}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[project.tipo] || 'bg-gray-100 text-gray-800'}`}>
                    {project.tipo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[project.estado] || 'bg-gray-100 text-gray-800'}`}>
                    {project.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {project.beneficiarios.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-3">
                  <button
                    onClick={() => editProject(project)}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay proyectos registrados. Crea el primero usando el botón "Nuevo Proyecto".
          </div>
        )}
      </div>
    </div>
  );
}
