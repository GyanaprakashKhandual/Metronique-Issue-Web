const tabs = [
    { id: 'home', name: 'Home', icon: 'fas fa-home', file: '../docs/home.doc.md' },
    { id: 'user', name: 'User', icon: 'fas fa-user', file: '../docs/user.doc.md' },
    { id: 'organization', name: 'Organization', icon: 'fas fa-building', file: '../docs/organization.doc.md' },
    { id: 'department', name: 'Department', icon: 'fas fa-sitemap', file: '../docs/department.doc.md' },
    { id: 'team', name: 'Team', icon: 'fas fa-users', file: '../docs/team.doc.md' },
    { id: 'project', name: 'Project', icon: 'fas fa-project-diagram', file: '../docs/project.doc.md' },
    { id: 'page', name: 'Page', icon: 'fas fa-file-alt', file: '../docs/page.doc.md' },
    { id: 'sprint', name: 'Sprint', icon: 'fas fa-running', file: '../docs/sprint.doc.md' },
    { id: 'folder', name: 'Folder', icon: 'fas fa-folder', file: '../docs/folder.doc.md' },
    { id: 'bug', name: 'Bug', icon: 'fas fa-bug', file: '../docs/bug.doc.md' },
    { id: 'requirement', name: 'Requirement', icon: 'fas fa-clipboard-list', file: '../docs/requirement.doc.md' },
    { id: 'issue', name: 'Issue', icon: 'fas fa-exclamation-circle', file: '../docs/issue.doc.md' },
    { id: 'message', name: 'Message', icon: 'fas fa-envelope', file: '../docs/message.doc.md' },
    { id: 'access', name: 'Access', icon: 'fas fa-key', file: '../docs/access.doc.md' },
    { id: 'upload', name: 'Upload', icon: 'fas fa-upload', file: '../docs/upload.doc.md' },
    { id: 'setting', name: 'Setting', icon: 'fas fa-cog', file: '../docs/setting.doc.md' }
];

const sidebar = document.querySelector('.sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarTabs = document.querySelector('.sidebar-tabs');
const markdownContent = document.getElementById('markdownContent');

document.addEventListener('DOMContentLoaded', function () {
    // Configure marked.js for GitHub Flavored Markdown
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        sanitize: false,
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.error('Highlight error:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        }
    });

    renderTabs();
    loadContent('../docs/home.doc.md', 'Home');
    document.querySelector(`[data-tab="home"]`).classList.add('active');
});

function renderTabs() {
    sidebarTabs.innerHTML = '';
    tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tab = tab.id;
        tabElement.innerHTML = `
                    <i class="${tab.icon}"></i>
                    <span>${tab.name}</span>
                `;
        tabElement.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tabElement.classList.add('active');
            loadContent(tab.file, tab.name);
        });
        sidebarTabs.appendChild(tabElement);
    });
}

function loadContent(fileName, title) {
    markdownContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading content...</div>';

    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.text();
        })
        .then(markdownText => {
            // Convert markdown to HTML using marked.js
            const htmlContent = marked.parse(markdownText);
            markdownContent.innerHTML = htmlContent;

            // Add copy buttons to code blocks
            addCopyButtons();

            // Re-highlight code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        })
        .catch(error => {
            markdownContent.innerHTML = `
                        <div class="error">
                            <h3><i class="fas fa-exclamation-triangle"></i> Content Not Found</h3>
                            <p>The requested document "${fileName}" could not be loaded.</p>
                            <p>Please try again later or contact support if the problem persists.</p>
                        </div>
                    `;
        });
}

function addCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
        // Check if button already exists
        if (pre.querySelector('.copy-button')) return;

        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';

        button.addEventListener('click', () => {
            const code = pre.querySelector('code');
            const text = code.textContent;

            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                button.textContent = 'Failed';
            });
        });

        pre.appendChild(button);
    });
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}