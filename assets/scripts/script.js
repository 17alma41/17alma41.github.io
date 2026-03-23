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
            const response = await fetch('../content/data/posts-data.json');
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

/**
 * Projects Management System
 * Sistema completo para gestionar proyectos dinámicamente
 */
class ProjectsManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentPage = 1;
        this.projectsPerPage = 6;
        
        this.init();
    }
    
    /**
     * Inicializa el sistema de proyectos
     */
    async init() {
        try {
            // Cargar datos de proyectos
            const response = await fetch('../content/data/projects-data.json');
            const data = await response.json();
            
            this.projects = data.projects;
            this.filteredProjects = [...this.projects];
            
            this.setupEventListeners();
            this.displayProjects();
        } catch (error) {
            console.error('Error inicializando proyectos:', error);
            this.showError('No se pudieron cargar los proyectos');
        }
    }
    
    /**
     * Configura los event listeners - SOLO UNA VEZ al inicializar
     */
    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('projects-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Paginación - Botones de flecha
        const prevBtn = document.getElementById('projects-prev-pagination-btn');
        const nextBtn = document.getElementById('projects-next-pagination-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (!prevBtn.disabled) {
                    this.previousPage();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!nextBtn.disabled) {
                    this.nextPage();
                }
            });
        }
        
        // Paginación - Números de página (delegación de eventos)
        const numbersContainer = document.getElementById('projects-pagination-numbers');
        if (numbersContainer) {
            numbersContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-number')) {
                    const pageNum = parseInt(e.target.dataset.page);
                    this.goToPage(pageNum);
                }
            });
        }
    }
    
    /**
     * Maneja la búsqueda de proyectos
     */
    handleSearch(searchTerm) {
        const trimmedTerm = searchTerm.trim().toLowerCase();
        
        if (trimmedTerm === '') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => {
                const searchableText = `
                    ${project.title.toLowerCase()} 
                    ${project.description.toLowerCase()} 
                    ${project.category ? project.category.toLowerCase() : ''}
                    ${project.technologies ? project.technologies.join(' ').toLowerCase() : ''}
                `.toLowerCase();
                
                return searchableText.includes(trimmedTerm);
            });
        }
        
        // Resetear a la primera página cuando se busca
        this.currentPage = 1;
        this.displayProjects();
    }
    
    /**
     * Obtiene los proyectos de la página actual
     */
    getPaginatedProjects() {
        const start = (this.currentPage - 1) * this.projectsPerPage;
        const end = start + this.projectsPerPage;
        return this.filteredProjects.slice(start, end);
    }
    
    /**
     * Obtiene el número total de páginas
     */
    getTotalPages() {
        return Math.ceil(this.filteredProjects.length / this.projectsPerPage);
    }
    
    /**
     * Va a una página específica
     */
    goToPage(pageNum) {
        const totalPages = this.getTotalPages();
        if (pageNum >= 1 && pageNum <= totalPages) {
            this.currentPage = pageNum;
            this.displayProjects();
            this.updatePaginationUI();
        }
    }
    
    /**
     * Va a la página anterior
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayProjects();
            this.updatePaginationUI();
        }
    }
    
    /**
     * Va a la página siguiente
     */
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayProjects();
            this.updatePaginationUI();
        }
    }
    
    /**
     * Actualiza la UI de paginación (estado de botones y números)
     */
    updatePaginationUI() {
        const totalPages = this.getTotalPages();
        const prevBtn = document.getElementById('projects-prev-pagination-btn');
        const nextBtn = document.getElementById('projects-next-pagination-btn');
        const numbersContainer = document.getElementById('projects-pagination-numbers');
        const paginationDiv = document.getElementById('projects-pagination');
        
        // Mostrar/ocultar paginación
        if (paginationDiv) {
            paginationDiv.style.display = totalPages > 1 ? 'flex' : 'none';
        }
        
        // Actualizar estado de botones de flecha
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.setAttribute('aria-disabled', prevBtn.disabled);
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.setAttribute('aria-disabled', nextBtn.disabled);
        }
        
        // Regenerar números de página
        if (numbersContainer) {
            numbersContainer.innerHTML = this.generatePageNumbers(this.currentPage, totalPages);
        }
    }
    
    /**
     * Genera HTML para los números de página con puntos suspensivos
     */
    generatePageNumbers(currentPage, totalPages) {
        if (totalPages <= 1) return '';
        
        let html = '';
        const maxVisible = 5;
        const halfVisible = Math.floor(maxVisible / 2);
        
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        // Puntos suspensivos al inicio
        if (startPage > 1) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        // Números de página
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<button class="page-number ${isActive}" data-page="${i}" aria-label="Página ${i}">${i}</button>`;
        }
        
        // Puntos suspensivos al final
        if (endPage < totalPages) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        return html;
    }
    
    /**
     * Muestra los proyectos de la página actual
     */
    displayProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        const paginatedProjects = this.getPaginatedProjects();
        
        if (paginatedProjects.length === 0) {
            const searchInput = document.getElementById('projects-search-input');
            const isSearching = searchInput && searchInput.value.trim() !== '';
            
            const emptyMessage = isSearching 
                ? 'No projects encontrados con esa búsqueda'
                : 'No hay proyectos disponibles';
            
            const emptyIcon = isSearching ? '🔍' : '💼';
            
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">${emptyIcon}</div>
                    <h3 class="empty-state-title">${emptyMessage}</h3>
                    <p class="empty-state-message">
                        ${isSearching 
                            ? 'Intenta con palabras clave diferentes' 
                            : 'Todavía no hay proyectos para mostrar'}
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = paginatedProjects.map(project => this.createProjectCard(project)).join('');
        }
        
        // Actualizar UI de paginación
        this.updatePaginationUI();
    }
    
    /**
     * Crea el HTML de una tarjeta de proyecto
     */
    createProjectCard(project) {
        const techsHtml = project.technologies && project.technologies.length > 0
            ? project.technologies
                .slice(0, 3)
                .map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`)
                .join('')
            : '';
        
        return `
            <a href="${project.url}" target="_blank" rel="noopener" class="project-card" title="Ir a ${this.escapeHtml(project.title)}">
                <img src="${project.image}" alt="${project.title}" class="project-thumbnail" loading="lazy">
                <div class="project-content">
                    ${project.category ? `<span class="project-category-badge">${this.escapeHtml(project.category)}</span>` : ''}
                    <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                    <p class="project-description">${this.escapeHtml(project.description)}</p>
                    ${techsHtml ? `<div class="project-technologies">${techsHtml}</div>` : ''}
                    <div class="project-footer">
                        <span>Ver proyecto</span>
                        <span class="project-link-icon">↗</span>
                    </div>
                </div>
            </a>
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
     * Muestra mensaje de error
     */
    showError(message) {
        const container = document.getElementById('projects-container');
        if (container) {
            container.innerHTML = `<p style="color: #e53e3e; padding: 20px; text-align: center; grid-column: 1 / -1;">${message}</p>`;
        }
    }
}

/**
 * Mobile Menu Manager - Menú Hamburguesa para móviles
 * Gestiona la apertura y cierre del menú lateral en dispositivos móviles
 */
class MobileMenuManager {
    constructor() {
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.sidebar = document.getElementById('sidebar');
        this.menuLinks = document.querySelectorAll('.menu-link');
        
        this.init();
    }

    /**
     * Inicializa el manejador del menú móvil
     */
    init() {
        if (this.hamburgerBtn && this.sidebar) {
            // Click en el botón hamburguesa
            this.hamburgerBtn.addEventListener('click', () => this.toggleMenu());
            
            // Click en los links del menú para cerrar
            this.menuLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Click fuera del menú para cerrar
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
            
            // Escape para cerrar
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMenu();
                }
            });
        }
    }

    /**
     * Abre/cierra el menú hamburguesa
     */
    toggleMenu() {
        this.hamburgerBtn.classList.toggle('active');
        this.sidebar.classList.toggle('active');
        
        // Prevenir scroll del body cuando el menú está abierto
        if (this.sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Cierra el menú
     */
    closeMenu() {
        this.hamburgerBtn.classList.remove('active');
        this.sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Maneja clicks fuera del menú
     */
    handleOutsideClick(e) {
        // Solo en móvil cuando el menú está abierto
        if (!this.sidebar.classList.contains('active')) return;
        
        // Si hace click en el hamburguesa, no cerrar (ya se maneja en toggleMenu)
        if (this.hamburgerBtn && this.hamburgerBtn.contains(e.target)) return;
        
        // Si hace click fuera del sidebar, cerrar
        if (!this.sidebar.contains(e.target)) {
            this.closeMenu();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PostsManager();
    new ProjectsManager();
    new MobileMenuManager();
});
