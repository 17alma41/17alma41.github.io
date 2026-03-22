
## 🔧 Crear un Nuevo Post 

### 1. Crea el archivo
```
posts/attacks/mi-nuevo-post.md
posts/forensics/mi-post.md
posts/tools/mi-post.md
posts/writeups/mi-post.md
```

### 2. Escribe el contenido
```markdown
---
title: "Mi Título"
description: "Breve descripción corta"
date: "2026-03-20"
image: "https://url-imagen.jpg"
category: "attacks"
---

# Contenido en Markdown

Tu artículo aquí...
```

### 3. Regenera posts
```bash
npm run generate-posts
```

### 4. Recarga navegador

**¡Listo!** El nuevo post aparece automáticamente en la lista.

## 🔧 Crear un Nuevo Proyecto 

### 1. Abre el archivo
Abre `data/projects-data.json` en tu editor

### 2. Localiza el array de proyectos
Busca la sección `"projects": [` (línea ~11)

### 3. Copia una tarjeta existente
Copia el objeto JSON de un proyecto existente como base

### 4. Modifica los valores
Reemplaza los valores con tu información. **Importante:**
- `id`: Debe ser único (nunca repetir)
- `url`: Usa la URL completa: `https://...`
- `image`: Puede ser externa o relativa
- `technologies`: Máximo 3 para que se vea bien

### 5. Inserta en el array
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

### 6. Recarga navegador

**¡Listo!** El nuevo proyecto aparece automáticamente en la lista.