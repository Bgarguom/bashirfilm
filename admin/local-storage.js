// Local Storage Fallback for Testing
// This allows the dashboard to work without Supabase for local testing

const LOCAL_STORAGE_KEY = 'bashir_filmmaker_projects';

// Local Storage API (mimics Supabase interface)
const LocalStorageAPI = {
    // Get all projects
    async getProjects() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },

    // Get project by slug
    async getProjectBySlug(slug) {
        const projects = await this.getProjects();
        return projects.find(p => p.slug === slug) || null;
    },

    // Create project
    async createProject(projectData) {
        const projects = await this.getProjects();
        const newProject = {
            id: 'local-' + Date.now(),
            ...projectData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        projects.push(newProject);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
        return newProject;
    },

    // Update project
    async updateProject(projectId, projectData) {
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === projectId);
        if (index === -1) {
            throw new Error('Project not found');
        }
        projects[index] = {
            ...projects[index],
            ...projectData,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
        return projects[index];
    },

    // Delete project
    async deleteProject(projectId) {
        const projects = await this.getProjects();
        const filtered = projects.filter(p => p.id !== projectId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Upload file (returns a data URL for local testing)
    async uploadFile(file, path) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Return data URL for local testing
                resolve({
                    publicUrl: e.target.result,
                    path: path
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

// Make available globally
window.LocalStorageAPI = LocalStorageAPI;
