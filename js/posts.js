/**
 * Posts Management System - Full Version v3.0
 * 
 * Sistema completo para gestionar posts integrados en el Home
 * Con renderizado de Markdown individual y paginación moderna
 */

class PostsManager {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentPostIndex = -1;
        
        this.init();
    }
    
    /**
     * Inicializa el sistema
     */
    async init() {
        try {
            // Esperar a que marked.js esté disponible
            await this.loadMarkedIfNeeded();
            
            // Cargar datos de posts
            const response = await fetch('./data/posts-data.json');
            const data = await response.json();
            
            this.posts = data.posts;
            this.filteredPosts = [...this.posts];
            
            this.setupEventListeners();
            this.displayPosts();
            this.setupMenuNavigation();
        } catch (error) {
            console.error('Error inicializando posts:', error);
            this.showError('No se pudieron cargar los posts');
        }
    }
    
    /**
     * Espera a que marked.js esté disponible
     */
    async loadMarkedIfNeeded() {
        let attempts = 0;
        return new Promise((resolve) => {
            const checkMarked = setInterval(() => {
                if (typeof marked !== 'undefined') {
                    clearInterval(checkMarked);
                    resolve();
                } else if (attempts++ > 50) {
                    clearInterval(checkMarked);
                    console.warn('marked.js no se cargó, usando fallback');
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * Configura los event listeners de paginación y navegación
     */
    setupEventListeners() {
        // Paginación de lista
        const prevPaginationBtn = document.getElementById('prev-pagination-btn');
        const nextPaginationBtn = document.getElementById('next-pagination-btn');
        
        if (prevPaginationBtn) prevPaginationBtn.addEventListener('click', () => this.previousPage());
        if (nextPaginationBtn) nextPaginationBtn.addEventListener('click', () => this.nextPage());
        
        // Botón de volver desde post detalle
        const backBtn = document.getElementById('back-to-posts-btn');
        if (backBtn) backBtn.addEventListener('click', () => this.backToPostsList());
        
        // Navegación entre posts detalle
        const postPrevBtn = document.getElementById('post-prev-btn');
        const postNextBtn = document.getElementById('post-next-btn');
        
        if (postPrevBtn) postPrevBtn.addEventListener('click', () => this.previousPost());
        if (postNextBtn) postNextBtn.addEventListener('click', () => this.nextPost());
        
        // Búsqueda de posts
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }
    
    /**
     * Obtiene los posts de la página actual
     */
    getPaginatedPosts() {
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        return this.filteredPosts.slice(start, end);
    }
    
    /**
     * Obtiene el número total de páginas
     */
    getTotalPages() {
        return Math.ceil(this.filteredPosts.length / this.postsPerPage);
    }
    
    /**
     * Crea el HTML de una tarjeta de post
     */
    createPostCard(post) {
        const date = new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <article class="post-card" data-post-id="${post.id}">
                <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">
                <div class="post-content">
                    <div class="post-header">
                        <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    </div>
                    <p class="post-description">${this.escapeHtml(post.description)}</p>
                    <div class="post-meta">
                        <time class="post-date" datetime="${post.date}">${date}</time>
                    </div>
                </div>
            </article>
        `;
    }
    
    /**
     * Escapa caracteres HTML para prevenir XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    /**
     * Maneja la búsqueda de posts
     */
    handleSearch(searchTerm) {
        const trimmedTerm = searchTerm.trim().toLowerCase();
        
        if (trimmedTerm === '') {
            // Si vacío, mostrar todos los posts
            this.filteredPosts = [...this.posts];
        } else {
            // Filtrar posts por título, descripción o categoría
            this.filteredPosts = this.posts.filter(post => {
                const searchableText = `
                    ${post.title.toLowerCase()} 
                    ${post.description.toLowerCase()} 
                    ${post.category ? post.category.toLowerCase() : ''}
                `.toLowerCase();
                
                return searchableText.includes(trimmedTerm);
            });
        }
        
        // Resetear a la primera página cuando se busca
        this.currentPage = 1;
        
        // Redisplayar los posts con los resultados de búsqueda
        this.displayPosts();
    }
    /**
     * Muestra los posts de la página actual (vista de lista)
     */
    displayPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;
        
        const posts = this.getPaginatedPosts();
        const totalPages = this.getTotalPages();
        
        // Si no hay posts
        if (posts.length === 0) {
            const searchInput = document.getElementById('search-input');
            const isSearching = searchInput && searchInput.value.trim() !== '';
            
            const emptyMessage = isSearching 
                ? 'No posts encontrados con esa búsqueda'
                : 'No hay posts disponibles';
            
            const emptyIcon = isSearching ? '🔍' : '📝';
            
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${emptyIcon}</div>
                    <h3 class="empty-state-title">${emptyMessage}</h3>
                    <p class="empty-state-message">
                        ${isSearching 
                            ? 'Intenta con palabras clave diferentes' 
                            : 'Todavía no hay posts para mostrar'}
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
            
            // Agregar event listeners a las tarjetas
            document.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => this.openPost(card.dataset.postId));
            });
        }
        
        // Actualizar paginación moderna
        this.updateModernPagination(totalPages);
    }
    
    /**
     * Actualiza la paginación moderna (números + flechas)
     */
    updateModernPagination(totalPages) {
        const prevBtn = document.getElementById('prev-pagination-btn');
        const nextBtn = document.getElementById('next-pagination-btn');
        const numbersContainer = document.getElementById('pagination-numbers');
        
        if (!numbersContainer) return;
        
        // Actualizar estado de botones de flecha
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        // Generar números de página
        numbersContainer.innerHTML = this.generatePageNumbers(this.currentPage, totalPages);
        
        // Agregar event listeners a los números
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const pageNum = parseInt(btn.dataset.page);
                this.goToPage(pageNum);
            });
        });
    }
    
    /**
     * Genera HTML para los números de página con puntos suspensivos
     */
    generatePageNumbers(currentPage, totalPages) {
        if (totalPages <= 1) return '';
        
        let html = '';
        const maxVisible = 5; // Máximo número de páginas visibles
        const halfVisible = Math.floor(maxVisible / 2);
        
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        // Ajustar si estamos cerca del final
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        // Puntos suspensivos al inicio
        if (startPage > 1) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        // Números
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<button class="page-number ${isActive}" data-page="${i}">${i}</button>`;
        }
        
        // Puntos suspensivos al final
        if (endPage < totalPages) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        return html;
    }
    
    /**
     * Va a una página específica
     */
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.getTotalPages()) {
            this.currentPage = pageNum;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    /**
     * Va a la página anterior
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    /**
     * Va a la página siguiente
     */
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    /**
     * Abre un post individual
     */
    openPost(postId) {
        const postIndex = this.filteredPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        const post = this.filteredPosts[postIndex];
        this.currentPostIndex = postIndex;
        
        // Mostrar vista de detalle
        this.displayPostDetail(post);
        this.updatePostNavigation();
    }
    
    /**
     * Muestra el detalle de un post con Markdown renderizado
     */
    displayPostDetail(post) {
        const titleEl = document.querySelector('.post-title-detail');
        const dateEl = document.querySelector('.post-date-detail');
        const categoryEl = document.querySelector('.post-category-badge');
        const imageEl = document.getElementById('post-featured-image');
        const contentEl = document.getElementById('post-content');
        
        // Rellenar datos
        titleEl.textContent = post.title;
        dateEl.textContent = new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        categoryEl.textContent = post.category;
        imageEl.src = post.image;
        imageEl.alt = post.title;
        
        // Renderizar Markdown a HTML
        let htmlContent = '';
        if (typeof marked !== 'undefined') {
            // Configurar marked para mejor renderizado
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            htmlContent = marked.parse(post.content);
        } else {
            // Fallback: mostrar contenido sin procesar
            htmlContent = `<p>${this.escapeHtml(post.content).replace(/\n/g, '<br>')}</p>`;
        }
        
        contentEl.innerHTML = htmlContent;
        
        // Cambiar vista
        this.showDetailView();
        this.updatePostNavigation();
        this.scrollToSection();
    }
    
    /**
     * Actualiza estado de botones de navegación entre posts
     */
    updatePostNavigation() {
        const prevPostBtn = document.getElementById('post-prev-btn');
        const nextPostBtn = document.getElementById('post-next-btn');
        
        if (prevPostBtn) {
            prevPostBtn.disabled = this.currentPostIndex === 0;
        }
        if (nextPostBtn) {
            nextPostBtn.disabled = this.currentPostIndex === this.filteredPosts.length - 1;
        }
    }
    
    /**
     * Va al post anterior
     */
    previousPost() {
        if (this.currentPostIndex > 0) {
            this.currentPostIndex--;
            const post = this.filteredPosts[this.currentPostIndex];
            this.displayPostDetail(post);
            this.updatePostNavigation();
        }
    }
    
    /**
     * Va al post siguiente
     */
    nextPost() {
        if (this.currentPostIndex < this.filteredPosts.length - 1) {
            this.currentPostIndex++;
            const post = this.filteredPosts[this.currentPostIndex];
            this.displayPostDetail(post);
            this.updatePostNavigation();
        }
    }
    
    /**
     * Vuelve a la lista de posts
     */
    backToPostsList() {
        this.showListView();
        this.scrollToSection();
    }
    
    /**
     * Muestra la vista de lista con transición suave
     */
    showListView() {
        const listView = document.getElementById('posts-list-view');
        const detailView = document.getElementById('post-detail-view');
        
        if (detailView) {
            detailView.classList.add('hidden');
        }
        
        // Pequeño delay para que la animación sea suave
        setTimeout(() => {
            if (listView) {
                listView.classList.remove('hidden');
            }
        }, 50);
    }
    
    /**
     * Muestra la vista de detalle con transición suave
     */
    showDetailView() {
        const listView = document.getElementById('posts-list-view');
        const detailView = document.getElementById('post-detail-view');
        
        if (listView) {
            listView.classList.add('hidden');
        }
        
        // Pequeño delay para que la animación sea suave
        setTimeout(() => {
            if (detailView) {
                detailView.classList.remove('hidden');
            }
        }, 50);
    }
    
    /**
     * Scroll suave a la sección de posts
     */
    scrollToSection() {
        const section = document.getElementById('home-section');
        if (section) {
            // Dar un pequeño delay para asegurar que el DOM esté actualizado
            setTimeout(() => {
                section.parentElement.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
    
    /**
     * Muestra mensaje de error
     */
    showError(message) {
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `<p style="color: #e53e3e; padding: 20px; text-align: center;">${message}</p>`;
        }
    }
    
    /**
     * Configura la navegación del menú principal
     */
    setupMenuNavigation() {
        const menuLinks = document.querySelectorAll('.menu-link');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Mapeo de links a secciones
                if (href === '#home') {
                    this.showSection('home-section');
                    this.showListView(); // Volver a vista de lista al hacer click en Home
                } else if (href === '#projects') {
                    this.showSection('projects-section');
                } else if (href === '#about') {
                    this.showSection('about-section');
                }
            });
        });
        
        // Mostrar sección Home por defecto
        this.showSection('home-section');
    }
    
    /**
     * Muestra/oculta secciones principales
     */
    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar la sección especificada
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PostsManager();
});
