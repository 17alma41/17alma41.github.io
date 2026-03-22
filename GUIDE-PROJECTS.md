# Guía: Cómo Agregar Nuevos Proyectos

## Ubicación del Archivo
Los proyectos se definen en:
```
data/projects-data.json
```

## Estructura de un Proyecto

Cada proyecto debe tener estos campos **obligatorios**:

```json
{
  "id": "unique-id",                    // ID único (sin espacios, usar guiones)
  "slug": "proyecto-slug",               // URL-friendly (usado para filtros)
  "title": "Título del Proyecto",        // Título visible
  "description": "Descripción breve",    // Texto que aparece en la card
  "image": "https://url-imagen.jpg",     // URL de la imagen (mín 400x250px)
  "url": "https://github.com/tu-repo",   // URL del proyecto (enlace externo)
  "category": "Web",                     // Categoría del proyecto
  "technologies": ["HTML", "CSS"],       // Array de tecnologías
  "featured": true                       // Si aparece como destacado (true/false)
}
```

## Campos Explicados

| Campo | Tipo | Requerido | Ejemplo | Notas |
|-------|------|-----------|---------|-------|
| **id** | String | ✅ | `"project-1"` | Debe ser único, sin espacios ni caracteres especiales |
| **slug** | String | ✅ | `"mi-portafolio"` | Para URLs internas, usa guiones (-) |
| **title** | String | ✅ | `"Mi Portfolio"` | Será visible en grande en la card |
| **description** | String | ✅ | `"Portfolio de ciberseguridad..."` | Texto visible en la card (50-150 caracteres es ideal) |
| **image** | String (URL) | ✅ | `"https://via.placeholder.com/400x250"` | Imagen de portada de la card |
| **url** | String (URL) | ✅ | `"https://github.com/usuario/repo"` | Donde se abre al hacer clic |
| **category** | String | ✅ | `"Web"` o `"Tools"` | Para filtrado y organización |
| **technologies** | Array | ✅ | `["React", "Node.js"]` | Se muestran máximo 3 tags en la card |
| **featured** | Boolean | ❌ | `true` o `false` | Opcional, para futuros filtros (ahora no se usa) |

## Ejemplos Reales

### Ejemplo 1: Proyecto Web Simple
```json
{
  "id": "proyecto-blog",
  "slug": "blog-seguridad",
  "title": "Blog de Ciberseguridad",
  "description": "Blog interactivo sobre vulnerabilidades web y técnicas de explotación.",
  "image": "https://via.placeholder.com/400x250?text=Blog+Seguridad",
  "url": "https://github.com/17alma41/blog-seguridad",
  "category": "Web",
  "technologies": ["Next.js", "MongoDB", "TailwindCSS", "Docker"],
  "featured": true
}
```

### Ejemplo 2: Herramienta Python
```json
{
  "id": "herramienta-scanner",
  "slug": "vulnerability-scanner",
  "title": "Vulnerability Scanner",
  "description": "Herramienta automatizada para escanear vulnerabilidades en aplicaciones web.",
  "image": "https://via.placeholder.com/400x250?text=Scanner",
  "url": "https://github.com/17alma41/vuln-scanner",
  "category": "Herramientas",
  "technologies": ["Python", "BeautifulSoup", "Requests", "SQLAlchemy"],
  "featured": false
}
```

### Ejemplo 3: Plataforma Interactiva
```json
{
  "id": "ctf-platform",
  "slug": "ctf-challenges",
  "title": "CTF Challenge Platform",
  "description": "Plataforma interactiva para resolver desafíos de Capture The Flag con puntuación.",
  "image": "https://via.placeholder.com/400x250?text=CTF+Platform",
  "url": "https://ctf-platform.example.com",
  "category": "Web",
  "technologies": ["React", "Django", "PostgreSQL", "WebSockets"],
  "featured": true
}
```

## Paso a Paso: Agregar un Nuevo Proyecto

### 1️⃣ Abre el archivo
Abre `data/projects-data.json` en tu editor

### 2️⃣ Localiza el array de proyectos
Busca la sección `"projects": [` (línea ~11)

### 3️⃣ Copia una tarjeta existente
Copia el objeto JSON de un proyecto existente como base

### 4️⃣ Modifica los valores
Reemplaza los valores con tu información. **Importante:**
- `id`: Debe ser único (nunca repetir)
- `url`: Usa la URL completa: `https://...`
- `image`: Puede ser externa o relativa
- `technologies`: Máximo 3 para que se vea bien

### 5️⃣ Inserta en el array
Agrega una coma al final del proyecto anterior y pega tu nuevo proyecto

**❌ INCORRECTO** (falta coma):
```json
{
  "id": "proj-1",
  ...
}
{
  "id": "proj-2",
  ...
}
```

**✅ CORRECTO** (con coma):
```json
{
  "id": "proj-1",
  ...
},
{
  "id": "proj-2",
  ...
}
```

### 6️⃣ Guarda el archivo
Presiona Ctrl+S (o Cmd+S en Mac)

### 7️⃣ Verifica en el navegador
Recarga la página: el nuevo proyecto debe aparecer automáticamente

---

## Consejos Prácticos

### 📸 Para la Imagen
- **Tamaño ideal**: 400x250 píxeles (16:10)
- **Formato**: JPG, PNG (preferiblemente JPG por tamaño)
- **Opciones de URL de imagen**:
  - Usar un placeholder: `https://via.placeholder.com/400x250?text=Mi+Proyecto`
  - Usar una CDN: `https://cdn.ejemplo.com/imagen.jpg`
  - Vencer desde GitHub: `https://raw.githubusercontent.com/usuario/repo/main/placeholder.jpg`
  - Subirla a tu servidor web

### 🔗 Para el URL
- GitHub: `https://github.com/usuario/nombre-repo`
- Live Demo: `https://mi-proyecto.vercel.app`
- Página personal: `https://miportafolio.com/proyectos/nombre`
- Documentación: `https://docs.mi-proyecto.com`

### 🏷️ Categorías Sugeridas
- `"Web"` - Proyectos web, frontend, fullstack
- `"Herramientas"` - Scripts, CLI, librerías
- `"Investigación"` - Papers, análisis, documentación
- `"Educativo"` - Cursos, tutoriales, demos
- Personaliza las que necesites

### 🔧 Tecnologías
- Máximo **3 tags** se muestran en la card
- Las que pongas primero son las que se ven
- Usa nombres reconocibles: `"React"` en lugar de `"react.js"`

---

## Validación: ¿Está bien formado mi JSON?

Puedes validar tu JSON aquí:
👉 https://jsonlint.com/

Copia el contenido de `projects-data.json` y pega en ese sitio.
Si dice **Valid JSON**, ¡está perfecto!

---

## Cambios que Afectan Automáticamente

✅ **No necesitas modificar nada más**. La aplicación:
- Carga los proyectos automáticamente desde `projects-data.json`
- Los pagina en grupos de 6
- Los busca en tiempo real
- Los renderiza con el mismo estilo

---

## Troubleshooting

### Los proyectos no aparecen
1. **Verifica el JSON**: Usa https://jsonlint.com/
2. **Comprueba la URL de imagen**: Abre en el navegador
3. **Recarga la página**: Ctrl+F5 (fuerza recarga)
4. **Abre la consola**: F12 > Console, busca errores

### El JSON dice "Invalid"
- Faltan comas entre objetos
- Comillas mal cerradas
- Caracteres especiales sin escapar

### Solo se muestran 6 proyectos
- **Esto es normal**: La paginación agrupa de 6 en 6
- Usa los botones de paginación (← →) o números para ver más

---

## Archivo JSON Completo Template

```json
{
  "generated": "2026-03-22T10:00:00.000Z",
  "totalProjects": 4,
  "categories": [
    {"name": "Web", "slug": "web", "count": 2},
    {"name": "Herramientas", "slug": "tools", "count": 1},
    {"name": "Investigación", "slug": "research", "count": 1}
  ],
  "projects": [
    {
      "id": "proyecto-nuevo",
      "slug": "tu-proyecto",
      "title": "Nombre del Proyecto",
      "description": "Descripción breve que aparece en la card.",
      "image": "https://via.placeholder.com/400x250?text=Tu+Proyecto",
      "url": "https://github.com/tu-usuario/tu-repo",
      "category": "Web",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "featured": true
    }
  ]
}
```

---

## ¿Preguntas?

Si el proyecto no aparece:
1. Verifica que el JSON sea válido
2. Asegúrate de que la `id` sea única
3. Recarga la página (Ctrl+Shift+R)
4. Abre F12 > Console para ver errores
