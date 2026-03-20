#!/usr/bin/env node

/**
 * Post Generator Script
 * 
 * Este script lee archivos Markdown de la carpeta `posts/` y genera un archivo JSON
 * con metadatos de los posts para ser consumido por el frontend.
 * 
 * Uso: node scripts/generate-posts.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuración
const POSTS_DIR = path.join(__dirname, '../posts');
const OUTPUT_FILE = path.join(__dirname, '../data/posts-data.json');

// Crear directorio de salida si no existe
const dataDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Extrae frontmatter YAML de un archivo Markdown
 * @param {string} content - Contenido del archivo
 * @returns {object} - {metadata: object, content: string}
 */
function parseFrontmatter(content) {
    // Normalizar saltos de línea
    let normalizedContent = content.replace(/\r\n/g, '\n');
    
    // Regex mejorada para frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = normalizedContent.match(frontmatterRegex);
    
    if (!match) {
        return { metadata: {}, content: normalizedContent };
    }
    
    const [, yamlString, markdownContent] = match;
    
    try {
        const metadata = yaml.load(yamlString) || {};
        // Asegurar que el contenido no contiene frontmatter
        const cleanContent = markdownContent.trim();
        return { metadata, content: cleanContent };
    } catch (error) {
        console.warn('⚠️ Error al parsear YAML:', error.message);
        return { metadata: {}, content: markdownContent.trim() };
    }
}

/**
 * Genera un slug único a partir de un nombre de archivo
 * @param {string} filename - Nombre del archivo sin extensión
 * @returns {string} - Slug para usarlo como ID
 */
function generateSlug(filename) {
    return filename
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

/**
 * Procesa todos los posts de una categoría
 * @param {string} category - Nombre de la categoría
 * @returns {array} - Array de objetos post
 */
function processCategory(category) {
    const categoryPath = path.join(POSTS_DIR, category);
    
    if (!fs.existsSync(categoryPath)) {
        return [];
    }
    
    return fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.join(categoryPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const { metadata, content: mdContent } = parseFrontmatter(content);
            
            // Extraer primeras líneas como preview
            const preview = mdContent
                .replace(/^#+ /gm, '')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .substring(0, 150)
                .trim() + '...';
            
            return {
                id: generateSlug(file.replace('.md', '')),
                slug: generateSlug(file.replace('.md', '')),
                title: metadata.title || file.replace('.md', ''),
                description: metadata.description || preview,
                date: metadata.date || new Date().toISOString().split('T')[0],
                image: metadata.image || `https://via.placeholder.com/240x160?text=${encodeURIComponent(metadata.category || category)}`,
                category: metadata.category || capitalizeCategory(category),
                content: mdContent,
                filename: file,
                categoryFolder: category
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha descendente
}

/**
 * Convierte el nombre de carpeta a nombre de categoría legible
 * @param {string} folder - Nombre de la carpeta
 * @returns {string} - Nombre formateado
 */
function capitalizeCategory(folder) {
    return folder
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Función principal: genera el archivo JSON
 */
function generatePostsData() {
    console.log('🚀 Iniciando generación de posts...\n');
    
    // Leer todas las categorías
    const categories = fs.readdirSync(POSTS_DIR)
        .filter(file => {
            const filepath = path.join(POSTS_DIR, file);
            return fs.statSync(filepath).isDirectory();
        });
    
    console.log(`📁 Categorías encontradas: ${categories.join(', ')}\n`);
    
    let allPosts = [];
    
    // Procesar cada categoría
    categories.forEach(category => {
        console.log(`📖 Procesando categoría: ${category}`);
        const posts = processCategory(category);
        console.log(`   └─ ${posts.length} post(s) encontrado(s)`);
        allPosts = allPosts.concat(posts);
    });
    
    // Estructurar datos generales
    const postsData = {
        generated: new Date().toISOString(),
        totalPosts: allPosts.length,
        categories: categories.map(cat => ({
            name: capitalizeCategory(cat),
            slug: cat.toLowerCase(),
            count: allPosts.filter(p => p.categoryFolder === cat).length
        })),
        posts: allPosts
    };
    
    // Guardar JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(postsData, null, 2));
    
    console.log(`\n✅ Archivo generado exitosamente: ${OUTPUT_FILE}`);
    console.log(`📊 Total de posts: ${allPosts.length}`);
    console.log(`📅 Timestamp: ${postsData.generated}\n`);
    
    return postsData;
}

// Ejecutar
try {
    generatePostsData();
} catch (error) {
    console.error('❌ Error al generar posts:', error.message);
    process.exit(1);
}
