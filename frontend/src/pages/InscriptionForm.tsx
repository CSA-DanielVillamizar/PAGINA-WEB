import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, CheckCircle2 } from 'lucide-react';
import { departamentosColombia, obtenerCiudades } from '../data/colombia';
import { generateInscriptionPdf } from '../tools/exportInscriptionPdf';

/**
 * Formulario nacional de inscripción L.A.M.A. Medellín.
 * Actualizado para:
 * - Separar tipo de identificación y número.
 * - Select dependiente Departamento -> Ciudad de nacimiento.
 * - Select de tallas estandarizadas uniformes.
 * - Select de tipos de sangre completos (grupo + factor Rh).
 * - Campo de carga de fotografía con vista previa.
 * - Inputs de fecha con type="date" para selector calendario.
 * - Arquitectura sencilla: inputs controlados en capa de presentación.
 */

/**
 * Página InscriptionForm - Formulario de inscripción completo (UI)
 */
export default function InscriptionForm() {
  // Estado principal del formulario (solo campos nuevos / clave). Puede evolucionar a react-hook-form.
  const [fullName, setFullName] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [departamentoNacimiento, setDepartamentoNacimiento] = useState('');
  const [ciudadNacimiento, setCiudadNacimiento] = useState('');
  const [tallaCamisa, setTallaCamisa] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [tipoSangrePareja, setTipoSangrePareja] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [anioMoto, setAnioMoto] = useState('');
  const [licenciaCategoria, setLicenciaCategoria] = useState('');
  const [aceptaEstatutos, setAceptaEstatutos] = useState(false);
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Fechas nuevas (ejemplo, se podrían centralizar en un hook).
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [vencLicencia, setVencLicencia] = useState('');
  const [vencSoat, setVencSoat] = useState('');
  const [vencTecno, setVencTecno] = useState('');

  // Campos pareja e hijos (solo fechas para ejemplo de date picker).
  const [fechaNacHijo1, setFechaNacHijo1] = useState('');
  const [fechaNacHijo2, setFechaNacHijo2] = useState('');

  // Ciudades filtradas según departamento seleccionado.
  const ciudadesDisponibles = useMemo(() => obtenerCiudades(departamentoNacimiento), [departamentoNacimiento]);

  const identificacionTipos = ['Cédula de Ciudadanía', 'Pasaporte', 'Cédula de Extranjería'];
  const tallasUniforme = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL'];
  const tiposSangreCompleto = [
    'A+ (A positivo)', 'A- (A negativo)',
    'B+ (B positivo)', 'B- (B negativo)',
    'AB+ (AB positivo)', 'AB- (AB negativo)',
    'O+ (O positivo)', 'O- (O negativo)'
  ];
  const currentYear = new Date().getFullYear();
  const aniosMoto = Array.from({ length: 60 }, (_, i) => (currentYear - i).toString());
  const categoriasLicencia = [
    'A1 - <=125cc', 'A2 - >125cc',
    'B1 - Automóviles particulares', 'B2 - Camiones/Buses particulares', 'B3 - Articulados particulares',
    'C1 - Automóviles servicio público', 'C2 - Camiones/Buses servicio público', 'C3 - Articulados servicio público'
  ];
  const now = useMemo(() => new Date(), []);
  const diaActual = String(now.getDate()).padStart(2, '0');
  const mesActualNombre = now.toLocaleDateString('es-CO', { month: 'long' });
  const anioActual = String(now.getFullYear());

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFotoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setFotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptaEstatutos) {
      alert('Debes aceptar los Estatutos de L.A.M.A. para continuar.');
      return;
    }
    setEnviando(true);
    const fechaEmision = new Date();
    
    // Cargar logo como DataURL (para insertarlo al PDF)
    async function loadLogo(): Promise<string | undefined> {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const src = '/LogoMedellin.svg';
        const loaded: string = await new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 92; canvas.height = 92;
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve('');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/png'));
            } catch (err) { resolve(''); }
          };
          img.onerror = reject;
          img.src = src;
        });
        return loaded || undefined;
      } catch { return undefined; }
    }

    const logoDataUrl = await loadLogo();

    // Generar y descargar PDF con branding; además obtener base64 para adjuntar al backend
    const pdf = await generateInscriptionPdf({
      fullName,
      tipoIdentificacion,
      numeroIdentificacion,
      departamentoNacimiento,
      ciudadNacimiento,
      tallaCamisa,
      tipoSangre,
      email,
      fechaNacimiento,
      licenciaCategoria,
      vencLicencia,
      vencSoat,
      vencTecno,
      fechaEmision
    }, { logoDataUrl, brandColor: '#FFD200', download: true });

    try {
      const response = await fetch('/api/inscriptions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          metadata: {
            tipoIdentificacion,
            numeroIdentificacion,
            departamentoNacimiento,
            ciudadNacimiento,
            tallaCamisa,
            tipoSangre,
            fechaNacimiento,
            licenciaCategoria,
            vencLicencia,
            vencSoat,
            vencTecno,
          },
          pdfBase64: pdf.base64,
          pdfFileName: pdf.fileName,
        })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      alert('Solicitud enviada correctamente. Revisa tu correo para confirmación.');
    } catch (error) {
      console.error('Error enviando email:', error);
      alert('Error al enviar. Por favor intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      <section className="py-10 bg-gradient-to-b from-black to-secondary">
        <div className="container-adventure">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row items-center gap-6">
            <img src="/LogoMedellin.svg" alt="Logo L.A.M.A. Medellín" className="w-24 h-24 object-contain" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white">
                FORMULARIO NACIONAL DE INSCRIPCIÓN
              </h1>
              <p className="text-primary font-semibold">CAPÍTULO Y FUNDACIÓN L.A.M.A. MEDELLÍN</p>
              <p className="text-gray-400">L.A.M.A. Colombia — <span className="text-white font-semibold">Latin American Motorcycle Association</span></p>
              <p className="text-sm text-gray-500 mt-1">Mototurismo con propósito. Cultura que deja huella.</p>
            </div>
          </motion.div>

          {/* Requisitos y Estatutos */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8 p-6 bg-secondary/50 rounded-lg border border-primary/20">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold mb-2">ANTES DE CONTINUAR</h3>
                <p className="text-gray-300 text-sm mb-3">Te invitamos a conocer los requisitos de membresía y leer los Estatutos Internacionales de L.A.M.A. para comprender tus responsabilidades y derechos como miembro.</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/requisitos-membresia" className="text-primary hover:text-yellow-400 text-sm font-semibold underline flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Ver Requisitos de Membresía
                  </Link>
                  <a href="/ESTATUTOS - LAMA.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-yellow-400 text-sm font-semibold underline flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Leer Estatutos L.A.M.A. (PDF)
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* I. DATOS PERSONALES */}
            <section className="card-adventure">
              <h2 className="text-2xl font-bold text-white mb-4">I. DATOS PERSONALES</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nombres y Apellidos" placeholder="Nombre completo" required value={fullName} onChange={e => setFullName(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <FieldSelect
                    label="Tipo de Identificación"
                    required
                    value={tipoIdentificacion}
                    onChange={e => setTipoIdentificacion(e.target.value)}
                    options={identificacionTipos}
                  />
                  <Field label="Número Identificación" required type="number" placeholder="8106001"
                    value={numeroIdentificacion}
                    onChange={e => setNumeroIdentificacion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expedida en" placeholder="Ciudad" />
                  <Field type="date" label="Fecha de Nacimiento" required
                    value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldSelect
                    label="Departamento Nacimiento"
                    required
                    value={departamentoNacimiento}
                    onChange={e => {
                      setDepartamentoNacimiento(e.target.value);
                      setCiudadNacimiento('');
                    }}
                    options={departamentosColombia.map(d => d.nombre)}
                  />
                  <FieldSelect
                    label="Ciudad / Municipio Nacimiento"
                    required
                    value={ciudadNacimiento}
                    onChange={e => setCiudadNacimiento(e.target.value)}
                    options={ciudadesDisponibles}
                    disabled={!departamentoNacimiento}
                  />
                </div>
                <Field label="Actividad Laboral Principal" placeholder="Profesión u ocupación" />
                <FieldSelect
                  label="Talla de Camisa/Chaleco (Para uniformes)"
                  required
                  value={tallaCamisa}
                  onChange={e => setTallaCamisa(e.target.value)}
                  options={tallasUniforme}
                />
                <Field label="Correo Electrónico (Obligatorio)" type="email" placeholder="mi@correo.com" required value={email} onChange={e => setEmail(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Celular (Principal)" placeholder="300 000 0000" />
                  <Field label="Teléfono Residencia" placeholder="604 000 0000" />
                </div>
                <Field label="Dirección Residencia" placeholder="Calle 00 #00-00, Barrio" />
                <Field label="Dirección Laboral" placeholder="Calle 00 #00-00, Empresa" />
                <div className="md:col-span-2">
                  <FieldFile
                    label="Fotografía Reciente (Carné)"
                    required
                    onChange={handleFotoChange}
                    preview={fotoPreview}
                  />
                </div>
              </div>
            </section>

            {/* II. INFORMACIÓN MÉDICA Y DE EMERGENCIA */}
            <section className="card-adventure">
              <h2 className="text-2xl font-bold text-white mb-4">II. INFORMACIÓN MÉDICA Y DE EMERGENCIA (CRÍTICO)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FieldSelect
                  label="Tipo de Sangre (RH)"
                  required
                  value={tipoSangre}
                  onChange={e => setTipoSangre(e.target.value)}
                  options={tiposSangreCompleto}
                />
                <Field label="Entidad de Salud (EPS/Prepagada)" placeholder="Mi EPS" />
                <div className="md:col-span-2">
                  <Field label="Alergias o Condiciones Médicas Importantes" placeholder="Describe alergias o condiciones relevantes" textarea />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">CONTACTO DE EMERGENCIA (Persona que NO viaje con el miembro)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Nombre Completo" placeholder="Nombre de contacto" />
                  <Field label="Parentesco" placeholder="Madre, Padre, Pareja, etc." />
                  <Field label="Teléfono Celular" placeholder="300 000 0000" />
                </div>
              </div>
            </section>

            {/* III. DATOS FAMILIARES */}
            <section className="card-adventure">
              <h2 className="text-2xl font-bold text-white mb-4">III. DATOS FAMILIARES</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nombre de la Pareja" placeholder="Nombre completo" />
                <Field label="Identificación Pareja (Tipo y N.º)" placeholder="CC 123..." />
                <FieldSelect label="Tipo de Sangre (Pareja)" required value={tipoSangrePareja} onChange={e => setTipoSangrePareja(e.target.value)} options={tiposSangreCompleto} />
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <Field label="Hijo 1" placeholder="Nombre completo" />
                <Field type="date" label="Fecha de Nacimiento Hijo 1"
                  value={fechaNacHijo1} onChange={e => setFechaNacHijo1(e.target.value)} />
                <Field label="Hijo 2" placeholder="Nombre completo" />
                <Field type="date" label="Fecha de Nacimiento Hijo 2"
                  value={fechaNacHijo2} onChange={e => setFechaNacHijo2(e.target.value)} />
              </div>
            </section>

            {/* IV. DATOS DEL VEHÍCULO Y DOCUMENTACIÓN LEGAL */}
            <section className="card-adventure">
              <h2 className="text-2xl font-bold text-white mb-4">IV. DATOS DEL VEHÍCULO Y DOCUMENTACIÓN LEGAL</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Marca de Moto" placeholder="Marca" />
                <Field label="Modelo/Línea" placeholder="Modelo" />
                <FieldSelect label="Año" value={anioMoto} onChange={e => setAnioMoto(e.target.value)} options={aniosMoto} />
                <Field label="Color" placeholder="Color" />
                <Field label="Placa" placeholder="ABC12D" />
                <Field label="Cilindraje (c.c.)" placeholder="150 / 250 / 650" />
                <Field label="Años de Experiencia (Moto)" placeholder="0 - 50" />
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <Field label="N.º Licencia de Conducción" placeholder="123456789" />
                <FieldSelect label="Categoría Licencia" value={licenciaCategoria} onChange={e => setLicenciaCategoria(e.target.value)} options={categoriasLicencia} />
                <Field type="date" label="Vencimiento Licencia" value={vencLicencia} onChange={e => setVencLicencia(e.target.value)} />
                <Field type="date" label="Vencimiento SOAT" value={vencSoat} onChange={e => setVencSoat(e.target.value)} />
                <Field type="date" label="Vencimiento Tecno-mecánica" value={vencTecno} onChange={e => setVencTecno(e.target.value)} />
              </div>
            </section>

            {/* V. CERTIFICACIÓN Y EXONERACIÓN */}
            <section className="card-adventure">
              <h2 className="text-2xl font-bold text-white mb-4">V. CERTIFICACIÓN Y EXONERACIÓN DE RESPONSABILIDAD</h2>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold text-white">CERTIFICO:</span> Que conozco, entiendo y acepto en toda su extensión, los estatutos, normas y reglamentos que rigen en la Asociación a la cual me estoy afiliando libre y voluntariamente, y estos serán acatados en su totalidad.
                </p>
                <p>
                  <span className="font-semibold text-white">DECLARACIÓN DE RESPONSABILIDAD Y EXONERACIÓN:</span> Acepto mi completa responsabilidad en caso de accidentes, lesiones personales, daños a terceros, daños en bien ajeno, que pudiesen llegar a ocurrir con el vehículo bajo mi conducción. LAMA COLOMBIA no se hace responsable en ninguna circunstancia por accidentes que ocurrieren a miembros, invitados y/o terceros, ni por comparendos en que incurra el afiliado.
                </p>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <Field label="Firma del Solicitante" value={fullName} readOnly placeholder="" />
                <Field label="Cédula" value={numeroIdentificacion} readOnly placeholder="" />
                <Field label="Día" value={diaActual} readOnly placeholder="" />
                <Field label="Mes" value={mesActualNombre} readOnly placeholder="" />
                <Field label="Año" value={anioActual} readOnly placeholder="" />
              </div>
              <div className="mt-6 text-gray-400 text-sm">
                NOTA: Favor adjuntar fotografía reciente para el carné de membresía.
              </div>
            </section>

            {/* Aceptación Estatutos */}
            <section className="card-adventure border-2 border-primary">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="aceptaEstatutos"
                  checked={aceptaEstatutos}
                  onChange={e => setAceptaEstatutos(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-primary bg-secondary text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="aceptaEstatutos" className="text-gray-300 text-sm cursor-pointer">
                  <span className="text-white font-bold">He leído y acepto los Estatutos Internacionales de L.A.M.A.</span> Comprendo mis responsabilidades, derechos y compromisos como miembro de la Fundación L.A.M.A. Medellín, así como las normas y reglamentos que rigen la organización.
                  {' '}<a href="/ESTATUTOS - LAMA.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-yellow-400">(Ver Estatutos)</a>
                </label>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button type="button" className="px-6 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-black transition-adventure" disabled={enviando}>Guardar Borrador</button>
              <button type="submit" className="btn-adventure flex items-center gap-2" disabled={enviando || !aceptaEstatutos}>
                {enviando ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

/**
 * Componente de campo base (input / textarea) controlado opcionalmente.
 */
function Field({ label, required, placeholder, type = 'text', textarea = false, value, onChange, readOnly }: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-gray-300 text-sm">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {textarea ? (
        <textarea className="input-adventure min-h-[120px]" placeholder={placeholder} value={value} onChange={onChange} readOnly={readOnly} />
      ) : (
        <input className="input-adventure" type={type} placeholder={placeholder} value={value} onChange={onChange} readOnly={readOnly} />
      )}
    </div>
  );
}

/**
 * Select genérico.
 */
function FieldSelect({ label, required, value, onChange, options, disabled }: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-gray-300 text-sm">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <select
        className="input-adventure"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">Seleccione...</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Campo de carga de archivo con vista previa para fotografía.
 */
function FieldFile({ label, required, onChange, preview }: {
  label: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preview: string | null;
}) {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm">{label} {required && <span className="text-primary">*</span>}</label>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="input-adventure file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-black hover:file:bg-yellow-400"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Previsualización" className="w-32 h-32 object-cover rounded-lg border border-primary" />
        </div>
      )}
    </div>
  );
}
