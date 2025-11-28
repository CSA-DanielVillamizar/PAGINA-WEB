# Assets Requeridos - Fundación L.A.M.A. Medellín

Este directorio `public/` debe contener los siguientes archivos para el correcto funcionamiento del sitio:

## 1. LogoMedellin.png
**Ubicación**: `/public/LogoMedellin.png`  
**Descripción**: Logo oficial L.A.M.A. Medellín  
**Formato**: PNG con fondo transparente  
**Tamaño recomendado**: 200x200px o similar (se ajusta a h-24 en formulario)  
**Uso**: 
- Header del formulario de inscripción (`InscriptionForm.tsx`)
- Posiblemente en PDF de inscripción (futuro)

**Acción requerida**: Por favor coloque aquí el archivo de logo proporcionado.

---

## 2. ESTATUTOS - LAMA.pdf
**Ubicación**: `/public/ESTATUTOS - LAMA.pdf`  
**Descripción**: Estatutos Internacionales L.A.M.A. completos  
**Formato**: PDF  
**Uso**:
- Enlace "Leer Estatutos" en banner informativo del formulario
- Enlace "Ver Estatutos" en página de requisitos de membresía
- Referencia para checkbox de aceptación de estatutos

**Acción requerida**: Por favor coloque aquí el documento PDF de estatutos adjunto.

---

## Notas Técnicas

### Referencias en Código
- `InscriptionForm.tsx` línea ~80: `<img src="/LogoMedellin.png" alt="Logo L.A.M.A. Medellín" />`
- `InscriptionForm.tsx` línea ~95: `<a href="/ESTATUTOS - LAMA.pdf" target="_blank">`
- `MembershipRequirements.tsx` línea ~180: `<a href="/ESTATUTOS - LAMA.pdf" target="_blank">`

### Rutas Absolutas vs Relativas
- Los archivos en `public/` se sirven desde la raíz del dominio: `/archivo.ext`
- En desarrollo: `http://localhost:5173/LogoMedellin.png`
- En producción: `https://tudominio.com/LogoMedellin.png`

### Fallback Temporal
Si los archivos no están disponibles:
- **Logo**: Se mostrará broken image placeholder (navegador)
- **PDF Estatutos**: Enlaces mostrarán 404

### Verificación
Ejecutar en terminal:
```powershell
Get-ChildItem public/
```

Debe listar:
- `LogoMedellin.png`
- `ESTATUTOS - LAMA.pdf`
- `README_ASSETS.md` (este archivo)
