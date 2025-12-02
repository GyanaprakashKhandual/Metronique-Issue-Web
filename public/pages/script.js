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
            const htmlContent = convertMarkdownToHTML(markdownText);
            markdownContent.innerHTML = htmlContent;
        })
        .catch(error => {
            markdownContent.innerHTML = `
                        <div class="error">
                            <h3>Content Not Found</h3>
                            <p>The requested document "${fileName}" could not be loaded.</p>
                            <p>Please try again later or contact support if the problem persists.</p>
                        </div>
                    `;
        });
}

function convertMarkdownToHTML(markdown) {
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^\s*-\s(.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
        .replace(/^\s*\d\.\s(.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gims, '<ol>$1</ol>')
        .replace(/\n$/gim, '<br>')
        .replace(/^(?!<[h|u|o|l|b|q])(.*$)/gim, '<p>$1</p>');

    html = html.replace(/<p><(h[1-6]|ul|ol|blockquote|li)>/g, '<$1>');
    html = html.replace(/<\/(h[1-6]|ul|ol|blockquote|li)><\/p>/g, '</$1>');

    return html;
}