const pages = {
    user: {
        title: 'User Management',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`,
        subtitle: 'Manage and view user profiles and settings',
        file: './user.doc.html'
    },
    upload: {
        title: 'Upload Management',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>`,
        subtitle: 'Handle file uploads and media management',
        file: './upload.doc.html'
    },
    configuration: {
        title: 'Configuration',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>`,
        subtitle: 'System configuration and settings',
        file: './configuration.doc.html'
    },
    organization: {
        title: 'Organization',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>`,
        subtitle: 'Organization structure and management',
        file: './organization.doc.html'
    },
    department: {
        title: 'Department',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>`,
        subtitle: 'Department management and organization',
        file: './department.doc.html'
    },
    team: {
        title: 'Team',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>`,
        subtitle: 'Team collaboration and management',
        file: './team.doc.html'
    },
    project: {
        title: 'Project',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>`,
        subtitle: 'Project planning and tracking',
        file: './project.doc.html'
    },
    phase: {
        title: 'Phase',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>`,
        subtitle: 'Phase and content management',
        file: './phase.doc.html'
    },
    sprint: {
        title: 'Sprint',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
            </svg>`,
        subtitle: 'Sprint planning and execution',
        file: './sprint.doc.html'
    },
    folder: {
        title: 'Folder',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>`,
        subtitle: 'Folder and file organization',
        file: './folder.doc.html'
    },
    bug: {
        title: 'Bug',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="8" y="6" width="8" height="14" rx="4"></rect>
                <path d="m8 10-4-4"></path>
                <path d="m16 10 4-4"></path>
                <path d="M8 14H4"></path>
                <path d="M16 14h4"></path>
                <path d="M8 18H4"></path>
                <path d="M16 18h4"></path>
                <path d="M12 6v-2"></path>
            </svg>`,
        subtitle: 'Bug tracking and management',
        file: './bug.doc.html'
    },
    requirement: {
        title: 'Requirement',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>`,
        subtitle: 'Requirement management and tracking',
        file: './requirement.doc.html'
    },
    issue: {
        title: 'Issue',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>`,
        subtitle: 'Issue tracking and resolution',
        file: './issue.doc.html'
    },
    docs: {
        title: 'Documentation',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>`,
        subtitle: 'Comprehensive documentation and guides',
        file: './docs.doc.html'
    },
    api: {
        title: 'API Documentation',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>`,
        subtitle: 'API reference and integration guides',
        file: './api.doc.html'
    },
    health: {
        title: 'System Health',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>`,
        subtitle: 'Monitor system status and performance',
        file: './health.doc.html'
    }
};

const contentArea = document.getElementById('contentArea');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const navLinks = document.querySelectorAll('.nav-link');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        loadPage(page);

        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const page = link.dataset.page;
        if (page) {
            e.preventDefault();
            loadPage(page);
        }
    });
});

async function loadPage(pageName) {
    const page = pages[pageName];
    if (!page) return;

    gsap.to(contentArea, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: async () => {
            try {
                const response = await fetch(page.file);
                const html = await response.text();

                contentArea.innerHTML = `
                    <div class="content-header">
                        <h1 class="content-title">
                            ${page.icon}
                            ${page.title}
                        </h1>
                        <p class="content-subtitle">${page.subtitle}</p>
                    </div>
                    <div class="content-card">
                        <iframe src="${page.file}" style="width: 100%; height: 80vh; border: none; border-radius: 8px;"></iframe>
                    </div>
                `;

                gsap.fromTo(contentArea,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                );
            } catch (error) {
                contentArea.innerHTML = `
                    <div class="content-header">
                        <h1 class="content-title">
                            ${page.icon}
                            ${page.title}
                        </h1>
                        <p class="content-subtitle">${page.subtitle}</p>
                    </div>
                    <div class="content-card">
                        <div style="padding: 30px; text-align: center; color: #c62828;">
                            <h3>Error Loading Page</h3>
                            <p style="margin-top: 10px; opacity: 0.8;">Could not load ${page.file}</p>
                            <p style="margin-top: 5px; font-size: 12px; opacity: 0.6;">${error.message}</p>
                        </div>
                    </div>
                `;

                gsap.fromTo(contentArea,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                );
            }
        }
    });
}

const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('focus', () => {
    gsap.to(searchInput, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
    });
});

searchInput.addEventListener('blur', () => {
    gsap.to(searchInput, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
    });
});

gsap.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
});

gsap.from('.sidebar', {
    x: -100,
    opacity: 0,
    duration: 0.6,
    delay: 0.2,
    ease: 'power3.out'
});

gsap.from('.content-area', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.4,
    ease: 'power3.out'
});

navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(link, {
            scale: 1.05,
            duration: 0.2,
            ease: 'power2.out'
        });
    });

    link.addEventListener('mouseleave', () => {
        gsap.to(link, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out'
        });
    });
});