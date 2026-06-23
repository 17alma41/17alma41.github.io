class PostsManager {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentPostIndex = -1;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.setupHistoryHandling();
        this.setupMenuNavigation();
        
        try {
            await this.loadMarkedIfNeeded();
            
            const response = await fetch('content/data/posts-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Guardamos los datos en memoria
            this.posts = data.posts;
            this.filteredPosts = [...this.posts];
            
            // Renderizamos las tarjetas
            this.displayPosts();
            
            // Leemos la URL AHORA que ya tenemos los datos
            this.handleInitialUrl();
            
        } catch (error) {
            console.error('Error inicializando posts:', error);
            this.showError('No se pudieron cargar los posts. Asegúrate de estar usando un servidor local (ej: Live Server) y no el protocolo file://');
        }
    }
    
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

    setupHistoryHandling() {
        window.addEventListener('hashchange', () => {
            this.handleHashRoute();
        });
    }

    handleHashRoute() {
        const hash = window.location.hash || '#/';
        
        let route = hash.replace(/^#/, '').toLowerCase();
        if (route === '') route = '/';
        
        if (route === '/' || route === '/home') {
            this.showSection('home-section');
            this.showListView();
            this.scrollToSection('home-section');
            return;
        }
        
        if (route.startsWith('/post/')) {
            const postId = route.replace('/post/', '').replace(/\/$/, '');
            if (postId) {
                this.showSection('home-section');
                this.openPost(postId);
                return;
            }
        }
        
        if (route === '/projects') {
            this.showSection('projects-section');
            this.scrollToSection('projects-section');
            return;
        }
        
        if (route === '/about') {
            this.showSection('about-section');
            this.scrollToSection('about-section');
            return;
        }
        
        this.showSection('home-section');
        this.showListView();
        this.scrollToSection('home-section');
    }

    handleInitialUrl() {
        this.handleHashRoute();
    }
    
    getPaginatedPosts() {
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        return this.filteredPosts.slice(start, end);
    }
    
    getTotalPages() {
        return Math.ceil(this.filteredPosts.length / this.postsPerPage);
    }
    
    createPostCard(post) {
        const date = new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const cleanImage = post.image.startsWith('../') ? post.image.replace('../', '') : post.image;
        
        return `
            <article class="post-card" data-post-id="${post.id}">
                <img src="${cleanImage}" alt="${post.title}" class="post-image" loading="lazy">
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
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    handleSearch(searchTerm) {
        const trimmedTerm = searchTerm.trim().toLowerCase();
        
        if (trimmedTerm === '') {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => {
                const searchableText = `
                    ${post.title.toLowerCase()} 
                    ${post.description.toLowerCase()} 
                    ${post.category ? post.category.toLowerCase() : ''}
                `.toLowerCase();
                return searchableText.includes(trimmedTerm);
            });
        }
        
        this.currentPage = 1;
        this.displayPosts();
    }

    displayPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;
        
        const posts = this.getPaginatedPosts();
        const totalPages = this.getTotalPages();
        
        if (posts.length === 0) {
            const searchInput = document.getElementById('search-input');
            const isSearching = searchInput && searchInput.value.trim() !== '';
            
            const emptyMessage = isSearching 
                ? 'Ningún posts encontrados con esa búsqueda'
                : 'No hay posts disponibles';
            
            const emptyIcon = isSearching ? '🔍' : '📝';
            
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${emptyIcon}</div>
                    <h3 class="empty-state-title">${emptyMessage}</h3>
                    <p class="empty-state-message">
                        ${isSearching ? 'Intenta con palabras clave diferentes' : 'Todavía no hay posts para mostrar'}
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
            
            document.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => {
                    window.location.hash = `/post/${card.dataset.postId}`;
                });
            });
        }
        
        this.updateModernPagination(totalPages);
    }
    
    updateModernPagination(totalPages) {
        const prevBtn = document.getElementById('prev-pagination-btn');
        const nextBtn = document.getElementById('next-pagination-btn');
        const numbersContainer = document.getElementById('pagination-numbers');
        
        if (!numbersContainer) return;
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        numbersContainer.innerHTML = this.generatePageNumbers(this.currentPage, totalPages);
        
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const pageNum = parseInt(btn.dataset.page);
                this.goToPage(pageNum);
            });
        });
    }
    
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
        
        if (startPage > 1) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<button class="page-number ${isActive}" data-page="${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            html += '<span class="page-ellipsis">...</span>';
        }
        
        return html;
    }
    
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.getTotalPages()) {
            this.currentPage = pageNum;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayPosts();
            this.scrollToSection();
        }
    }
    
    openPost(postId) {
        const postIndex = this.filteredPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        const post = this.filteredPosts[postIndex];
        this.currentPostIndex = postIndex;
        
        this.displayPostDetail(post);
        this.updatePostNavigation();
    }
    
    displayPostDetail(post) {
        const titleEl = document.querySelector('.post-title-detail');
        const dateEl = document.querySelector('.post-date-detail');
        const categoryEl = document.querySelector('.post-category-badge');
        const imageEl = document.getElementById('post-featured-image');
        const contentEl = document.getElementById('post-content');
        
        titleEl.textContent = post.title;
        dateEl.textContent = new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        categoryEl.textContent = post.category;
        
        const cleanImage = post.image.startsWith('../') ? post.image.replace('../', '') : post.image;
        imageEl.src = cleanImage;
        imageEl.alt = post.title;

        let htmlContent = '';
        if (typeof marked !== 'undefined') {
            htmlContent = marked.parse(post.content, {
                breaks: true,
                gfm: true
            });
        } else {
            htmlContent = `<p>${this.escapeHtml(post.content).replace(/\n/g, '<br>')}</p>`;
        }
        
        contentEl.innerHTML = htmlContent;
        
        this.showDetailView();
        this.updatePostNavigation();
        this.scrollToSection();
    }
    
    updatePostNavigation() {
        const prevPostBtn = document.getElementById('post-prev-btn');
        const nextPostBtn = document.getElementById('post-next-btn');
        
        if (prevPostBtn) prevPostBtn.disabled = this.currentPostIndex === 0;
        if (nextPostBtn) nextPostBtn.disabled = this.currentPostIndex === this.filteredPosts.length - 1;
    }
    
    previousPost() {
        if (this.currentPostIndex > 0) {
            this.currentPostIndex--;
            const post = this.filteredPosts[this.currentPostIndex];
            window.location.hash = `/post/${post.id}`;
        }
    }

    nextPost() {
       if (this.currentPostIndex < this.filteredPosts.length - 1) {
            this.currentPostIndex++;
            const post = this.filteredPosts[this.currentPostIndex];
            window.location.hash = `/post/${post.id}`;
        }
    }

    backToPostsList() {
        window.location.hash = '/';
    }
    
    showListView() {
        const listView = document.getElementById('posts-list-view');
        const detailView = document.getElementById('post-detail-view');
        
        if (detailView) detailView.classList.add('hidden');
        
        setTimeout(() => {
            if (listView) listView.classList.remove('hidden');
        }, 50);

        const themeBtn = document.getElementById('theme-toggle-container');
        if (themeBtn) themeBtn.classList.remove('hidden');
    }
    
    showDetailView() {
        const listView = document.getElementById('posts-list-view');
        const detailView = document.getElementById('post-detail-view');
        
        if (listView) listView.classList.add('hidden');
        
        setTimeout(() => {
            if (detailView) detailView.classList.remove('hidden');
        }, 50);

        const themeBtn = document.getElementById('theme-toggle-container');
        if (themeBtn) themeBtn.classList.add('hidden');
    }
    
    scrollToSection(sectionId = 'home-section') {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                // En móviles y tablets, el scroll pertenece a la ventana principal
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // En escritorio, el scroll pertenece a la etiqueta <main>
                const section = document.getElementById(sectionId);
                if (section && section.parentElement) {
                    section.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }, 150); // El pequeño retraso extra asegura que el menú móvil tenga tiempo de cerrarse
    }
    
    showError(message) {
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `<p style="color: #e53e3e; padding: 20px; text-align: center;">${message}</p>`;
        }
    }

    setupEventListeners() {
        const prevPaginationBtn = document.getElementById('prev-pagination-btn');
        const nextPaginationBtn = document.getElementById('next-pagination-btn');
        
        if (prevPaginationBtn) prevPaginationBtn.addEventListener('click', () => this.previousPage());
        if (nextPaginationBtn) nextPaginationBtn.addEventListener('click', () => this.nextPage());
        
        const backBtn = document.getElementById('back-to-posts-btn');
        if (backBtn) backBtn.addEventListener('click', () => this.backToPostsList());
        
        const postPrevBtn = document.getElementById('post-prev-btn');
        const postNextBtn = document.getElementById('post-next-btn');
        
        if (postPrevBtn) postPrevBtn.addEventListener('click', () => this.previousPost());
        if (postNextBtn) postNextBtn.addEventListener('click', () => this.nextPost());
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }
    
    setupMenuNavigation() {
        const menuLinks = document.querySelectorAll('.menu-link');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                // Si haces clic en la sección donde ya estás, sube arriba
                const currentHash = window.location.hash.replace(/^#/, '') || '/';
                if (currentHash === href || (currentHash === '' && href === '/')) {
                    if (href === '/') this.scrollToSection('home-section');
                    else if (href === '/projects') this.scrollToSection('projects-section');
                    else if (href === '/about') this.scrollToSection('about-section');
                }
                
                if (href === '/') window.location.hash = '/';
                else if (href === '/projects') window.location.hash = '/projects';
                else if (href === '/about') window.location.hash = '/about';
            });
        });
    }
    
    showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const section = document.getElementById(sectionId);
        if (section) section.classList.remove('hidden');

        const themeBtn = document.getElementById('theme-toggle-container');
        if (themeBtn) {
            if (sectionId === 'post-detail-view') themeBtn.classList.add('hidden');
            else themeBtn.classList.remove('hidden');
        }
    }
}

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentPage = 1;
        this.projectsPerPage = 6;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();

        try {
            const response = await fetch('content/data/projects-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.projects = data.projects;
            this.filteredProjects = [...this.projects];
            
            this.displayProjects();
        } catch (error) {
            console.error('Error inicializando proyectos:', error);
            this.showError('No se pudieron cargar los proyectos. Recuerda abrir el proyecto mediante un servidor local.');
        }
    }
    
    setupEventListeners() {
        const searchInput = document.getElementById('projects-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        const prevBtn = document.getElementById('projects-prev-pagination-btn');
        const nextBtn = document.getElementById('projects-next-pagination-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => { if (!prevBtn.disabled) this.previousPage(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { if (!nextBtn.disabled) this.nextPage(); });
        
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
        
        this.currentPage = 1;
        this.displayProjects();
    }
    
    getPaginatedProjects() {
        const start = (this.currentPage - 1) * this.projectsPerPage;
        const end = start + this.projectsPerPage;
        return this.filteredProjects.slice(start, end);
    }
    
    getTotalPages() {
        return Math.ceil(this.filteredProjects.length / this.projectsPerPage);
    }
    
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.getTotalPages()) {
            this.currentPage = pageNum;
            this.displayProjects();
            this.updatePaginationUI();
            this.scrollToSection();
        }
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayProjects();
            this.updatePaginationUI();
            this.scrollToSection();
        }
    }
    
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayProjects();
            this.updatePaginationUI();
            this.scrollToSection();
        }
    }

    scrollToSection() {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const section = document.getElementById('projects-section');
                if (section && section.parentElement) {
                    section.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }, 150);
    }
    
    updatePaginationUI() {
        const totalPages = this.getTotalPages();
        const prevBtn = document.getElementById('projects-prev-pagination-btn');
        const nextBtn = document.getElementById('projects-next-pagination-btn');
        const numbersContainer = document.getElementById('projects-pagination-numbers');
        const paginationDiv = document.getElementById('projects-pagination');
        
        if (paginationDiv) paginationDiv.style.display = totalPages > 1 ? 'flex' : 'none';
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.setAttribute('aria-disabled', prevBtn.disabled);
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.setAttribute('aria-disabled', nextBtn.disabled);
        }
        
        if (numbersContainer) {
            numbersContainer.innerHTML = this.generatePageNumbers(this.currentPage, totalPages);
        }
    }
    
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
        
        if (startPage > 1) html += '<span class="page-ellipsis">...</span>';
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<button class="page-number ${isActive}" data-page="${i}" aria-label="Página ${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) html += '<span class="page-ellipsis">...</span>';
        
        return html;
    }
    
    displayProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        const paginatedProjects = this.getPaginatedProjects();
        
        if (paginatedProjects.length === 0) {
            const searchInput = document.getElementById('projects-search-input');
            const isSearching = searchInput && searchInput.value.trim() !== '';
            
            const emptyMessage = isSearching ? 'Ningún proyecto encontrado con esa búsqueda' : 'No hay proyectos disponibles';
            const emptyIcon = isSearching ? '🔍' : '💼';
            
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">${emptyIcon}</div>
                    <h3 class="empty-state-title">${emptyMessage}</h3>
                    <p class="empty-state-message">${isSearching ? 'Intenta con palabras clave diferentes' : 'Todavía no hay proyectos para mostrar'}</p>
                </div>
            `;
        } else {
            container.innerHTML = paginatedProjects.map(project => this.createProjectCard(project)).join('');
        }
        
        this.updatePaginationUI();
    }
    
    createProjectCard(project) {
        const techsHtml = project.technologies && project.technologies.length > 0
            ? project.technologies.slice(0, 3).map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`).join('')
            : '';

        const cleanImage = project.image.startsWith('../') ? project.image.replace('../', '') : project.image;
        
        return `
            <a href="${project.url}" target="_blank" rel="noopener" class="project-card" title="Ir a ${this.escapeHtml(project.title)}">
                <img src="${cleanImage}" alt="${project.title}" class="project-thumbnail" loading="lazy">
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
    
    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    showError(message) {
        const container = document.getElementById('projects-container');
        if (container) {
            container.innerHTML = `<p style="color: #e53e3e; padding: 20px; text-align: center; grid-column: 1 / -1;">${message}</p>`;
        }
    }
}

class MobileMenuManager {
    constructor() {
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.hamburgerCheckbox = document.getElementById('hamburger-checkbox');
        this.sidebar = document.getElementById('sidebar');
        this.menuLinks = document.querySelectorAll('.menu-link');
        
        this.init();
    }

    init() {
        if (this.hamburgerBtn && this.sidebar && this.hamburgerCheckbox) {
            this.hamburgerCheckbox.addEventListener('change', () => this.handleCheckboxChange());
            this.menuLinks.forEach(link => link.addEventListener('click', () => this.closeMenu()));
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeMenu(); });
        }
    }

    handleCheckboxChange() {
        if (this.hamburgerCheckbox.checked) {
            this.sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            this.sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        if (this.hamburgerCheckbox.checked) {
            this.hamburgerCheckbox.checked = false;
            this.sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    handleOutsideClick(e) {
        if (!this.sidebar.classList.contains('active')) return;
        if (this.hamburgerBtn && this.hamburgerBtn.contains(e.target)) return;
        if (!this.sidebar.contains(e.target)) this.closeMenu();
    }
}

class ThemeManager {
    constructor() {
        this.themeToggleInput = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        if (!this.themeToggleInput) return;

        const savedTheme = localStorage.getItem('portfolio-theme');
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

        if (savedTheme === 'light') {
            this.enableLightMode(true);
        } else if (savedTheme === 'dark') {
            this.enableDarkMode(true);
        } else if (systemPrefersLight) {
            this.enableLightMode(false); 
        } else {
            this.enableDarkMode(false);
        }

        this.themeToggleInput.addEventListener('change', () => {
            if (this.themeToggleInput.checked) this.enableLightMode(true);
            else this.enableDarkMode(true);
        });
    }

    enableLightMode(savePreference) {
        document.body.classList.add('light-mode');
        this.themeToggleInput.checked = true; 
        if (savePreference) localStorage.setItem('portfolio-theme', 'light');
    }

    enableDarkMode(savePreference) {
        document.body.classList.remove('light-mode');
        this.themeToggleInput.checked = false; 
        if (savePreference) localStorage.setItem('portfolio-theme', 'dark');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PostsManager();
    new ProjectsManager();
    new MobileMenuManager();
    new ThemeManager();
});

// --- SOLUCIÓN AL "STICKY HOVER" EN MÓVILES ---
document.addEventListener('touchend', (e) => {
    const clickableElement = e.target.closest('button, a, .post-card, .project-card, .hamburger-menu, .themeToggle');
    
    if (clickableElement) {
        setTimeout(() => {
            clickableElement.blur();
            
            const originalPointerEvents = clickableElement.style.pointerEvents;
            clickableElement.style.pointerEvents = 'none';
            
            void clickableElement.offsetHeight; 
            
            clickableElement.style.pointerEvents = originalPointerEvents;
            
        }, 150); 
    }
});