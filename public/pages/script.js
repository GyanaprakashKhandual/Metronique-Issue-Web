// Content Pages Data
const pages = {
    user: {
        title: 'User Management',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`,
        subtitle: 'Manage and view user profiles and settings',
        content: `
            <h2 style="margin-bottom: 15px;">User Management System</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Manage user accounts, permissions, and access controls. View detailed user profiles, track activity, and manage user roles.
            </p>
        `
    },
    upload: {
        title: 'Upload Management',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>`,
        subtitle: 'Handle file uploads and media management',
        content: `
            <h2 style="margin-bottom: 15px;">File Upload System</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Upload and manage files, images, and media assets. Monitor upload progress and organize your digital content efficiently.
            </p>
        `
    },
    configuration: {
        title: 'Configuration',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>`,
        subtitle: 'System configuration and settings',
        content: `
            <h2 style="margin-bottom: 15px;">System Configuration</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Configure system parameters, API settings, and application preferences. Customize your dashboard experience.
            </p>
        `
    },
    organization: {
        title: 'Organization',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>`,
        subtitle: 'Organization structure and management',
        content: `
            <h2 style="margin-bottom: 15px;">Organization Structure</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Manage organization details, hierarchy, and company information. View organizational units and structure.
            </p>
        `
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
        content: `
            <h2 style="margin-bottom: 15px;">Department Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Create and manage departments, assign managers, and organize teams. Track departmental performance metrics.
            </p>
        `
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
        content: `
            <h2 style="margin-bottom: 15px;">Team Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Manage team members, assign roles, and organize team projects. Facilitate collaboration and communication.
            </p>
        `
    },
    project: {
        title: 'Project',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>`,
        subtitle: 'Project planning and tracking',
        content: `
            <h2 style="margin-bottom: 15px;">Project Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Plan, track, and manage projects. Assign resources, set timelines, and monitor progress in real-time.
            </p>
        `
    },
    page: {
        title: 'Phase',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>`,
        subtitle: 'Phase and content management',
        content: `
            <h2 style="margin-bottom: 15px;">Phase Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Create and manage phases, organize content, and publish updates. Version control and revision history available.
            </p>
        `
    },
    sprint: {
        title: 'Sprint',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
            </svg>`,
        subtitle: 'Sprint planning and execution',
        content: `
            <h2 style="margin-bottom: 15px;">Sprint Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Plan sprints, assign tasks, and track velocity. Manage burndown charts and sprint retrospectives.
            </p>
        `
    },
    folder: {
        title: 'Folder',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>`,
        subtitle: 'Folder and file organization',
        content: `
            <h2 style="margin-bottom: 15px;">Folder Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Organize files into folders, manage permissions, and organize your digital workspace effectively.
            </p>
        `
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
        content: `
            <h2 style="margin-bottom: 15px;">Bug Tracking System</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Report, track, and resolve bugs. Assign priority levels and monitor resolution progress.
            </p>
        `
    },
    requirement: {
        title: 'Requirement',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>`,
        subtitle: 'Requirement management and tracking',
        content: `
            <h2 style="margin-bottom: 15px;">Requirement Management</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Document requirements, track status, and manage specifications. Link requirements to development tasks.
            </p>
        `
    },
    issue: {
        title: 'Issue',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>`,
        subtitle: 'Issue tracking and resolution',
        content: `
            <h2 style="margin-bottom: 15px;">Issue Tracking</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Log, track, and resolve issues. Monitor status, assign responsibility, and ensure timely resolution.
            </p>
        `
    },
    docs: {
        title: 'Documentation',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>`,
        subtitle: 'Comprehensive documentation and guides',
        content: `
            <h2 style="margin-bottom: 15px;">Documentation</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Access comprehensive documentation, guides, and tutorials to help you make the most of the platform.
            </p>
        `
    },
    api: {
        title: 'API Documentation',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>`,
        subtitle: 'API reference and integration guides',
        content: `
            <h2 style="margin-bottom: 15px;">API Documentation</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Integrate with our API. Access endpoints, authentication methods, and code examples.
            </p>
        `
    },
    health: {
        title: 'System Health',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>`,
        subtitle: 'Monitor system status and performance',
        content: `
            <h2 style="margin-bottom: 15px;">System Health Monitor</h2>
            <p style="line-height: 1.6; opacity: 0.8;">
                Monitor system health, uptime, and performance metrics. View status of all services and dependencies.
            </p>
        `
    }
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mainContainer = document.getElementById('mainContainer');
const contentArea = document.getElementById('contentArea');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const themeToggle = document.getElementById('themeToggle');
const themeMenu = document.getElementById('themeMenu');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize
let currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

// Hamburger Menu Toggle
hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
    mainContainer.classList.toggle('sidebar-closed');
    const isClosed = sidebar.classList.contains('closed');

    // Animate hamburger icon
    gsap.to('.hamburger-icon', {
        rotation: isClosed ? 90 : 0,
        duration: 0.3,
        ease: 'power2.out'
    });
});

// Theme Toggle Dropdown
themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('active');

    gsap.from('.theme-option', {
        opacity: 0,
        y: -10,
        stagger: 0.05,
        duration: 0.3,
        ease: 'power2.out'
    });
});

// Close theme menu when clicking outside
document.addEventListener('click', (e) => {
    if (!themeToggle.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.remove('active');
    }
});

// Theme Options
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        applyTheme(theme);
        localStorage.setItem('theme', theme);
        themeMenu.classList.remove('active');

        // Update active state
        document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Apply Theme Function
function applyTheme(theme) {
    document.body.classList.remove('dark-mode', 'blue-mode');

    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else if (theme === 'light') {
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else if (theme === 'blue') {
        document.body.classList.add('blue-mode');
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v12M6 12h12"></path>`;
    } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        }
        themeIcon.innerHTML = `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>`;
    }

    // Animate theme transition
    gsap.fromTo(document.body,
        { opacity: 0.95 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
}

// Sidebar Navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        loadPage(page);

        // Update active states
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.add('closed');
            mainContainer.classList.add('sidebar-closed');
        }
    });
});

// Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const page = link.dataset.page;
        if (page) {
            e.preventDefault();
            loadPage(page);
        }
    });
});

// Load Page Function
function loadPage(pageName) {
    const page = pages[pageName];
    if (!page) return;

    // Animate content out
    gsap.to(contentArea, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            // Update content
            contentArea.innerHTML = `
                <div class="content-header">
                    <h1 class="content-title">
                        ${page.icon}
                        ${page.title}
                    </h1>
                    <p class="content-subtitle">${page.subtitle}</p>
                </div>
                <div class="content-card">
                    ${page.content}
                </div>
            `;

            // Animate content in
            gsap.fromTo(contentArea,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
        }
    });
}

// Search Input Animation
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

// Responsive Behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        // Desktop: sidebar controls content margin
        const isClosed = sidebar.classList.contains('closed');
        if (isClosed) {
            mainContainer.classList.add('sidebar-closed');
        } else {
            mainContainer.classList.remove('sidebar-closed');
        }
    } else {
        // Mobile: content always takes full width
        mainContainer.classList.add('sidebar-closed');
        if (!sidebar.classList.contains('closed')) {
            sidebar.classList.add('closed');
            gsap.set('.hamburger-icon', { rotation: 90 });
        }
    }
});

// Initial setup
if (window.innerWidth <= 768) {
    sidebar.classList.add('closed');
    mainContainer.classList.add('sidebar-closed');
    gsap.set('.hamburger-icon', { rotation: 90 });
} else {
    // Desktop starts with sidebar open
    sidebar.classList.remove('closed');
    mainContainer.classList.remove('sidebar-closed');
    gsap.set('.hamburger-icon', { rotation: 0 });
}

// Initial Animation
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

// Hover effects for nav links
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