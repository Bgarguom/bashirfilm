// Admin Dashboard JavaScript

let currentProjects = [];
let coverImageFile = null;
let galleryImageFiles = [];
let editingProjectId = null;
let existingGalleryImages = [];

// Initialize dashboard
async function initDashboard() {
    try {
        // Wait a bit for scripts to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Make sure Supabase is initialized first
        if (typeof initSupabase !== 'function') {
            throw new Error('config.js not loaded. Make sure config.js is included before admin-dashboard.js');
        }
        
        if (typeof getSupabase !== 'function') {
            throw new Error('getSupabase function not found. Make sure config.js is loaded.');
        }
        
        // Initialize Supabase (optional if not configured)
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
        
        // Check auth (but allow access even if not authenticated for development)
        const isAuthenticated = await initAuth();
        // Don't block if not authenticated - allow development access

        await loadProjects();
        setupFormHandlers();
        setupFileUploads();
        setupSiteSettingsHandlers();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        const listContainer = document.getElementById('projects-list');
        if (listContainer) {
            listContainer.innerHTML = `<div class="error-message" style="padding: var(--spacing-md);">Error initializing: ${error.message}<br><br>Make sure config.js is loaded before admin-dashboard.js</div>`;
        }
    }
}

// Check if using local storage mode
function isLocalStorageMode() {
    const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
    return !supabaseConfig || 
           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY' ||
           typeof window.LocalStorageAPI !== 'undefined';
}

// Load all projects
async function loadProjects() {
    const listContainer = document.getElementById('projects-list');
    listContainer.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        // Use local storage if Supabase is not configured
        if (isLocalStorageMode()) {
            if (typeof window.LocalStorageAPI === 'undefined') {
                // Load local storage API
                const script = document.createElement('script');
                script.src = 'local-storage.js';
                script.onload = () => loadProjects(); // Reload after script loads
                document.head.appendChild(script);
                return;
            }
            
            // Load from local storage
            const projects = await window.LocalStorageAPI.getProjects();
            currentProjects = projects || [];
            
            // Show local storage mode notice
            if (currentProjects.length === 0) {
                listContainer.innerHTML = `
                    <div style="padding: var(--spacing-md); background: rgba(81, 207, 102, 0.1); border: 1px solid rgba(81, 207, 102, 0.3); border-radius: 8px; margin-bottom: var(--spacing-md);">
                        <strong style="display: block; margin-bottom: 0.5rem; color: #51cf66;">✓ Local Storage Mode (Testing)</strong>
                        <p style="color: var(--text-secondary); margin: 0; line-height: 1.6; font-size: 0.9em;">
                            Projects are saved in your browser's local storage. Perfect for testing!<br>
                            <small style="opacity: 0.7;">To use Supabase in production, configure it in config.js</small>
                        </p>
                    </div>
                    <div class="empty-state">
                        <h2>No projects yet</h2>
                        <p>Click "Add Project" to create your first project.</p>
                    </div>
                `;
            } else {
                // Show notice above projects list
                const notice = document.createElement('div');
                notice.style.cssText = 'padding: var(--spacing-xs) var(--spacing-sm); background: rgba(81, 207, 102, 0.1); border: 1px solid rgba(81, 207, 102, 0.3); border-radius: 4px; margin-bottom: var(--spacing-sm); font-size: 0.85em; color: #51cf66;';
                notice.innerHTML = '✓ Local Storage Mode - Projects saved in browser';
                listContainer.insertBefore(notice, listContainer.firstChild);
                
                renderProjects(currentProjects);
            }
            return;
        }
        
        // Use Supabase
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn || typeof getSupabaseFn !== 'function') {
            throw new Error('getSupabase function not found. Make sure config.js is loaded.');
        }
        
        const supabase = getSupabaseFn();
        
        if (!supabase) {
            throw new Error('Supabase is not configured. Please set up your Supabase credentials in config.js');
        }
        
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        currentProjects = data || [];
        renderProjects(currentProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        let errorMessage = error.message || 'Error loading projects';
        let errorDetails = '';
        
        if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
            errorMessage = 'Database table not found';
            errorDetails = 'Please run the SQL setup from SUPABASE_SETUP.md to create the projects table.';
        } else if (error.message && error.message.includes('JWT')) {
            errorMessage = 'Authentication error';
            errorDetails = 'Please log out and log back in.';
        } else if (error.message && error.message.includes('fetch')) {
            errorMessage = 'Connection error';
            errorDetails = 'Check your Supabase URL in config.js and make sure it\'s correct.';
        } else if (error.message && error.message.includes('Supabase')) {
            errorDetails = 'Please update config.js with your Supabase credentials.';
        }
        
        listContainer.innerHTML = `
            <div class="error-message" style="padding: var(--spacing-md); line-height: 1.6;">
                <strong style="display: block; margin-bottom: 0.5rem;">${errorMessage}</strong>
                ${errorDetails ? `<div style="margin-top: 0.5rem; font-size: 0.9em;">${errorDetails}</div>` : ''}
                <div style="margin-top: 1rem; font-size: 0.85em; color: var(--text-secondary);">
                    Full error: ${error.message || 'Unknown error'}
                </div>
            </div>
        `;
    }
}

// Render projects list
function renderProjects(projects) {
    const listContainer = document.getElementById('projects-list');

    if (projects.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h2>No projects yet</h2>
                <p>Click "Add Project" to create your first project.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = projects.map(project => `
        <div class="project-item">
            <div class="project-item-info">
                ${project.cover_image ? `
                    <img src="${project.cover_image}" alt="${project.title}" class="project-item-thumb" onerror="this.style.display='none'">
                ` : '<div class="project-item-thumb"></div>'}
                <div class="project-item-details">
                    <div class="project-item-title">
                        ${project.title}
                        ${project.featured ? '<span class="project-item-badge">Featured</span>' : ''}
                    </div>
                    <div class="project-item-meta">
                        ${project.client || 'No client'} • ${project.year || 'No year'}
                    </div>
                </div>
            </div>
            <div class="project-item-actions">
                <button class="btn btn-secondary btn-small" onclick="editProject('${project.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProject('${project.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Open project modal for adding
// Site Settings Functions
let heroPortraitFile = null;
let aboutBgFile = null;
let contactImageFile = null;

function openSiteSettingsModal() {
    const modal = document.getElementById('site-settings-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    loadSiteSettings();
}

function closeSiteSettingsModal() {
    const modal = document.getElementById('site-settings-modal');
    if (!modal) return;
    
    modal.style.display = 'none';
    heroPortraitFile = null;
    aboutBgFile = null;
    contactImageFile = null;
    document.getElementById('hero-portrait-input').value = '';
    document.getElementById('hero-portrait-url').value = '';
    document.getElementById('hero-portrait-preview').innerHTML = '';
    document.getElementById('about-bg-input').value = '';
    document.getElementById('about-bg-url').value = '';
    document.getElementById('about-bg-preview').innerHTML = '';
    document.getElementById('contact-image-input').value = '';
    document.getElementById('contact-image-url').value = '';
    document.getElementById('contact-image-preview').innerHTML = '';
    // Note: We don't clear contact info fields to preserve user input
}

async function loadSiteSettings() {
    try {
        const isLocalMode = isLocalStorageMode();
        let settingsData = {
            hero_portrait_image: null,
            about_background_image: null,
            contact_image: null,
            contact_email: null,
            contact_phone: null,
            contact_whatsapp: null,
            contact_instagram: null
        };
        
        if (isLocalMode) {
            const settings = localStorage.getItem('bashir_filmmaker_site_settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                settingsData = {
                    hero_portrait_image: parsed.hero_portrait_image || null,
                    about_background_image: parsed.about_background_image || null,
                    contact_image: parsed.contact_image || null,
                    contact_email: parsed.contact_email || null,
                    contact_phone: parsed.contact_phone || null,
                    contact_whatsapp: parsed.contact_whatsapp || null,
                    contact_instagram: parsed.contact_instagram || null
                };
            }
        } else {
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .select('hero_portrait_image, about_background_image, contact_image, contact_email, contact_phone, contact_whatsapp, contact_instagram')
                        .single();
                    
                    if (!error && data) {
                        settingsData = {
                            hero_portrait_image: data.hero_portrait_image || null,
                            about_background_image: data.about_background_image || null,
                            contact_image: data.contact_image || null,
                            contact_email: data.contact_email || null,
                            contact_phone: data.contact_phone || null,
                            contact_whatsapp: data.contact_whatsapp || null,
                            contact_instagram: data.contact_instagram || null
                        };
                    }
                }
            }
        }
        
        // Load hero portrait
        if (settingsData.hero_portrait_image) {
            document.getElementById('hero-portrait-url').value = settingsData.hero_portrait_image;
            document.getElementById('hero-portrait-preview').innerHTML = `
                <div class="uploaded-file">
                    <img src="${settingsData.hero_portrait_image}" alt="Hero portrait" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;">
                    <button type="button" class="uploaded-file-remove" onclick="removeHeroPortrait()">&times;</button>
                </div>
            `;
        }
        
        // Load about background
        if (settingsData.about_background_image) {
            document.getElementById('about-bg-url').value = settingsData.about_background_image;
            document.getElementById('about-bg-preview').innerHTML = `
                <div class="uploaded-file">
                    <img src="${settingsData.about_background_image}" alt="About background" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
                    <button type="button" class="uploaded-file-remove" onclick="removeAboutBg()">&times;</button>
                </div>
            `;
        }
        
        // Load contact image
        if (settingsData.contact_image) {
            document.getElementById('contact-image-url').value = settingsData.contact_image;
            document.getElementById('contact-image-preview').innerHTML = `
                <div class="uploaded-file">
                    <img src="${settingsData.contact_image}" alt="Contact image" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
                    <button type="button" class="uploaded-file-remove" onclick="removeContactImage()">&times;</button>
                </div>
            `;
        }
        
        // Load contact information
        if (settingsData.contact_email) {
            document.getElementById('contact-email').value = settingsData.contact_email;
        }
        if (settingsData.contact_phone) {
            document.getElementById('contact-phone').value = settingsData.contact_phone;
        }
        if (settingsData.contact_whatsapp) {
            document.getElementById('contact-whatsapp').value = settingsData.contact_whatsapp;
        }
        if (settingsData.contact_instagram) {
            document.getElementById('contact-instagram').value = settingsData.contact_instagram;
        }
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

function removeHeroPortrait() {
    heroPortraitFile = null;
    document.getElementById('hero-portrait-input').value = '';
    document.getElementById('hero-portrait-url').value = '';
    document.getElementById('hero-portrait-preview').innerHTML = '';
}

function removeAboutBg() {
    aboutBgFile = null;
    document.getElementById('about-bg-input').value = '';
    document.getElementById('about-bg-url').value = '';
    document.getElementById('about-bg-preview').innerHTML = '';
}

function removeContactImage() {
    contactImageFile = null;
    document.getElementById('contact-image-input').value = '';
    document.getElementById('contact-image-url').value = '';
    document.getElementById('contact-image-preview').innerHTML = '';
}

async function saveSiteSettings() {
    try {
        const portraitUrlInput = document.getElementById('hero-portrait-url');
        const aboutBgUrlInput = document.getElementById('about-bg-url');
        const contactImageUrlInput = document.getElementById('contact-image-url');
        let portraitUrl = portraitUrlInput.value.trim();
        let aboutBgUrl = aboutBgUrlInput.value.trim();
        let contactImageUrl = contactImageUrlInput.value.trim();
        
        const isLocalMode = isLocalStorageMode();
        
        // Upload hero portrait if file is uploaded
        if (heroPortraitFile) {
            if (isLocalMode) {
                // Convert to data URL for local storage
                const reader = new FileReader();
                portraitUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(heroPortraitFile);
                });
            } else {
                // Upload to Supabase Storage
                const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
                if (getSupabaseFn) {
                    const supabase = getSupabaseFn();
                    if (supabase) {
                        const fileExt = heroPortraitFile.name.split('.').pop();
                        const fileName = `hero-portrait-${Date.now()}.${fileExt}`;
                        const filePath = `site/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage
                            .from('images')
                            .upload(filePath, heroPortraitFile, {
                                cacheControl: '3600',
                                upsert: false
                            });
                        
                        if (uploadError) throw uploadError;
                        
                        const { data } = supabase.storage
                            .from('images')
                            .getPublicUrl(filePath);
                        
                        portraitUrl = data.publicUrl;
                    }
                }
            }
        }
        
        // Upload about background if file is uploaded
        if (aboutBgFile) {
            if (isLocalMode) {
                // Convert to data URL for local storage
                const reader = new FileReader();
                aboutBgUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(aboutBgFile);
                });
            } else {
                // Upload to Supabase Storage
                const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
                if (getSupabaseFn) {
                    const supabase = getSupabaseFn();
                    if (supabase) {
                        const fileExt = aboutBgFile.name.split('.').pop();
                        const fileName = `about-bg-${Date.now()}.${fileExt}`;
                        const filePath = `site/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage
                            .from('images')
                            .upload(filePath, aboutBgFile, {
                                cacheControl: '3600',
                                upsert: false
                            });
                        
                        if (uploadError) throw uploadError;
                        
                        const { data } = supabase.storage
                            .from('images')
                            .getPublicUrl(filePath);
                        
                        aboutBgUrl = data.publicUrl;
                    }
                }
            }
        }
        
        // Upload contact image if file is uploaded
        if (contactImageFile) {
            if (isLocalMode) {
                // Convert to data URL for local storage
                const reader = new FileReader();
                contactImageUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(contactImageFile);
                });
            } else {
                // Upload to Supabase Storage
                const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
                if (getSupabaseFn) {
                    const supabase = getSupabaseFn();
                    if (supabase) {
                        const fileExt = contactImageFile.name.split('.').pop();
                        const fileName = `contact-image-${Date.now()}.${fileExt}`;
                        const filePath = `site/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage
                            .from('images')
                            .upload(filePath, contactImageFile, {
                                cacheControl: '3600',
                                upsert: false
                            });
                        
                        if (uploadError) throw uploadError;
                        
                        const { data } = supabase.storage
                            .from('images')
                            .getPublicUrl(filePath);
                        
                        contactImageUrl = data.publicUrl;
                    }
                }
            }
        }
        
        // Get contact information
        const contactEmail = document.getElementById('contact-email').value.trim() || null;
        const contactPhone = document.getElementById('contact-phone').value.trim() || null;
        const contactWhatsapp = document.getElementById('contact-whatsapp').value.trim() || null;
        const contactInstagram = document.getElementById('contact-instagram').value.trim() || null;
        
        // Save settings
        if (isLocalMode) {
            // Save to local storage
            const settings = {
                hero_portrait_image: portraitUrl || null,
                about_background_image: aboutBgUrl || null,
                contact_image: contactImageUrl || null,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                contact_whatsapp: contactWhatsapp,
                contact_instagram: contactInstagram
            };
            localStorage.setItem('bashir_filmmaker_site_settings', JSON.stringify(settings));
            showSuccess('Site settings saved successfully!');
        } else {
            // Save to Supabase
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { error } = await supabase
                        .from('site_settings')
                        .upsert({
                            id: 1,
                            hero_portrait_image: portraitUrl || null,
                            about_background_image: aboutBgUrl || null,
                            contact_image: contactImageUrl || null,
                            contact_email: contactEmail,
                            contact_phone: contactPhone,
                            contact_whatsapp: contactWhatsapp,
                            contact_instagram: contactInstagram
                        }, {
                            onConflict: 'id'
                        });
                    
                    if (error) throw error;
                    showSuccess('Site settings saved successfully!');
                }
            }
        }
        
        closeSiteSettingsModal();
    } catch (error) {
        console.error('Error saving site settings:', error);
        showError('Error saving site settings: ' + (error.message || 'Unknown error'));
    }
}

function setupSiteSettingsHandlers() {
    // Site settings form
    const siteSettingsForm = document.getElementById('site-settings-form');
    if (siteSettingsForm) {
        siteSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSiteSettings();
        });
    }
    
    // Hero portrait file input
    const heroPortraitInput = document.getElementById('hero-portrait-input');
    if (heroPortraitInput) {
        heroPortraitInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                heroPortraitFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('hero-portrait-preview').innerHTML = `
                        <div class="uploaded-file">
                            <img src="${e.target.result}" alt="Hero portrait preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;">
                            <button type="button" class="uploaded-file-remove" onclick="removeHeroPortrait()">&times;</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Hero portrait URL input
    const heroPortraitUrlInput = document.getElementById('hero-portrait-url');
    if (heroPortraitUrlInput) {
        heroPortraitUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && url.startsWith('http')) {
                document.getElementById('hero-portrait-preview').innerHTML = `
                    <div class="uploaded-file">
                        <img src="${url}" alt="Hero portrait preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.parentElement.parentElement.innerHTML=''">
                        <button type="button" class="uploaded-file-remove" onclick="removeHeroPortrait()">&times;</button>
                    </div>
                `;
            } else if (!url) {
                document.getElementById('hero-portrait-preview').innerHTML = '';
            }
        });
    }
    
    // About background file input
    const aboutBgInput = document.getElementById('about-bg-input');
    if (aboutBgInput) {
        aboutBgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                aboutBgFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('about-bg-preview').innerHTML = `
                        <div class="uploaded-file">
                            <img src="${e.target.result}" alt="About background preview" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
                            <button type="button" class="uploaded-file-remove" onclick="removeAboutBg()">&times;</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // About background URL input
    const aboutBgUrlInput = document.getElementById('about-bg-url');
    if (aboutBgUrlInput) {
        aboutBgUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && url.startsWith('http')) {
                document.getElementById('about-bg-preview').innerHTML = `
                    <div class="uploaded-file">
                        <img src="${url}" alt="About background preview" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" onerror="this.parentElement.parentElement.innerHTML=''">
                        <button type="button" class="uploaded-file-remove" onclick="removeAboutBg()">&times;</button>
                    </div>
                `;
            } else if (!url) {
                document.getElementById('about-bg-preview').innerHTML = '';
            }
        });
    }
    
    // Contact image file input
    const contactImageInput = document.getElementById('contact-image-input');
    if (contactImageInput) {
        contactImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                contactImageFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('contact-image-preview').innerHTML = `
                        <div class="uploaded-file">
                            <img src="${e.target.result}" alt="Contact image preview" style="width: 150px; height: 112px; object-fit: cover; border-radius: 8px;">
                            <button type="button" class="uploaded-file-remove" onclick="removeContactImage()">&times;</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Contact image URL input
    const contactImageUrlInput = document.getElementById('contact-image-url');
    if (contactImageUrlInput) {
        contactImageUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && url.startsWith('http')) {
                document.getElementById('contact-image-preview').innerHTML = `
                    <div class="uploaded-file">
                        <img src="${url}" alt="Contact image preview" style="width: 150px; height: 112px; object-fit: cover; border-radius: 8px;" onerror="this.parentElement.parentElement.innerHTML=''">
                        <button type="button" class="uploaded-file-remove" onclick="removeContactImage()">&times;</button>
                    </div>
                `;
            } else if (!url) {
                document.getElementById('contact-image-preview').innerHTML = '';
            }
        });
    }
}

function openProjectModal() {
    editingProjectId = null;
    existingGalleryImages = [];
    document.getElementById('modal-title').textContent = 'Add Project';
    document.getElementById('project-form').reset();
    document.getElementById('cover-image-preview').innerHTML = '';
    document.getElementById('gallery-images-preview').innerHTML = '';
    coverImageFile = null;
    galleryImageFiles = [];
    document.getElementById('project-modal').style.display = 'flex';
    hideMessages();
}

// Close project modal
function closeProjectModal() {
    document.getElementById('project-modal').style.display = 'none';
    editingProjectId = null;
    coverImageFile = null;
    galleryImageFiles = [];
    existingGalleryImages = [];
}

// Edit project
async function editProject(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    if (!project) return;

    editingProjectId = projectId;
    document.getElementById('modal-title').textContent = 'Edit Project';
    
    // Fill form with project data
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title').value = project.title || '';
    document.getElementById('project-slug').value = project.slug || '';
    document.getElementById('project-headline').value = project.headline || '';
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-client').value = project.client || '';
    document.getElementById('project-year').value = project.year || '';
    document.getElementById('project-video-url').value = project.video_url || '';
    document.getElementById('project-featured').checked = project.featured || false;

    // Show cover image preview
    if (project.cover_image) {
        document.getElementById('cover-image-preview').innerHTML = `
            <div class="uploaded-file">
                <img src="${project.cover_image}" alt="Cover">
            </div>
        `;
    }

    // Show gallery images preview
    if (project.gallery_images && project.gallery_images.length > 0) {
        document.getElementById('gallery-images-preview').innerHTML = project.gallery_images.map((url, index) => `
            <div class="uploaded-file">
                <img src="${url}" alt="Gallery">
                <button type="button" class="uploaded-file-remove" onclick="removeExistingGalleryImage('${url}')">&times;</button>
            </div>
        `).join('');
    }
    
    // Store existing gallery images for preservation
    if (project.gallery_images) {
        existingGalleryImages = [...project.gallery_images];
    }

    document.getElementById('project-modal').style.display = 'flex';
    hideMessages();
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        // Use local storage if Supabase is not configured
        if (isLocalStorageMode()) {
            if (typeof window.LocalStorageAPI === 'undefined') {
                alert('Local storage API not loaded. Please refresh the page.');
                return;
            }
            await window.LocalStorageAPI.deleteProject(projectId);
            await loadProjects();
            return;
        }
        
        // Use Supabase
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn) {
            throw new Error('getSupabase function not found.');
        }
        
        const supabase = getSupabaseFn();
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;

        await loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
    }
}

// Setup form handlers
function setupFormHandlers() {
    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject();
    });

    // Auto-generate slug from title
    document.getElementById('project-title').addEventListener('input', (e) => {
        if (!editingProjectId) {
            const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            document.getElementById('project-slug').value = slug;
        }
    });

    // Setup thumbnail button click handler
    const thumbnailBtn = document.getElementById('generate-thumbnail-btn');
    if (thumbnailBtn) {
        thumbnailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateThumbnailFromVideo();
        });
    }
    
    // Auto-generate thumbnail from video URL (on Enter key)
    const videoUrlInput = document.getElementById('project-video-url');
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                generateThumbnailFromVideo();
            }
        });
    }
}

// Generate thumbnail from video URL (called by button or auto)
async function generateThumbnailFromVideo() {
    console.log('generateThumbnailFromVideo called');
    
    const videoUrlInput = document.getElementById('project-video-url');
    if (!videoUrlInput) {
        console.error('Video URL input not found');
        showError('Video URL input not found');
        return;
    }
    
    const videoUrl = videoUrlInput.value.trim();
    if (!videoUrl) {
        showError('Please enter a video URL first');
        return;
    }
    
    console.log('Video URL:', videoUrl);
    
    const coverPreview = document.getElementById('cover-image-preview');
    if (!coverPreview) {
        console.error('Cover preview not found');
        showError('Cover preview element not found');
        return;
    }
    
    try {
        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'thumbnail-loading';
        loadingMsg.textContent = 'Generating thumbnail from video...';
        loadingMsg.style.cssText = 'padding: 0.75rem; color: var(--text-secondary); font-size: 0.9em; text-align: center; background: rgba(255, 255, 255, 0.05); border-radius: 4px;';
        coverPreview.innerHTML = '';
        coverPreview.appendChild(loadingMsg);
        
        // Disable button
        const btn = document.getElementById('generate-thumbnail-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Generating...';
        }
        
        // Check if function is available
        console.log('Checking for getVideoThumbnail function...');
        console.log('window.getVideoThumbnail:', typeof window.getVideoThumbnail);
        
        if (typeof window.getVideoThumbnail !== 'function') {
            console.error('getVideoThumbnail function not available');
            throw new Error('Video thumbnail function not loaded. Please refresh the page and make sure video-thumbnail.js is loaded.');
        }
        
        console.log('Calling getVideoThumbnail...');
        // Get thumbnail
        const thumbnailUrl = await window.getVideoThumbnail(videoUrl);
        console.log('Thumbnail result:', thumbnailUrl);
        
        // Remove loading message
        loadingMsg.remove();
        
        if (thumbnailUrl) {
            // Show thumbnail preview
            coverPreview.innerHTML = `
                <div class="uploaded-file">
                    <img src="${thumbnailUrl}" alt="Video thumbnail" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'%3E%3Crect fill=\\'%231a1a1a\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23666\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'12\\'%3EError%3C/text%3E%3C/svg%3E';">
                    <button type="button" class="uploaded-file-remove" onclick="removeCoverImage()">&times;</button>
                </div>
            `;
            
            // Store as data URL if it's a canvas-generated thumbnail
            if (thumbnailUrl.startsWith('data:')) {
                // Convert data URL to file-like object for saving
                coverImageFile = dataURLtoFile(thumbnailUrl, 'video-thumbnail.jpg');
            } else {
                // For external URLs (YouTube, Vimeo), we'll use the URL directly
                coverImageFile = { 
                    isUrl: true, 
                    url: thumbnailUrl,
                    name: 'video-thumbnail.jpg'
                };
            }
            
            showSuccess('✓ Thumbnail generated from video URL!');
        } else {
            showError('Could not generate thumbnail. Make sure the video URL is valid (YouTube, Vimeo, or direct video file).');
        }
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        const loadingMsg = document.getElementById('thumbnail-loading');
        if (loadingMsg) loadingMsg.remove();
        showError('Error generating thumbnail: ' + error.message);
    } finally {
        // Re-enable button
        const btn = document.getElementById('generate-thumbnail-btn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Generate Thumbnail';
        }
    }
}

// Make function available globally
window.generateThumbnailFromVideo = generateThumbnailFromVideo;

// Helper function to convert data URL to File object
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// Setup file uploads
function setupFileUploads() {
    // Cover image
    document.getElementById('cover-image-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            coverImageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('cover-image-preview').innerHTML = `
                    <div class="uploaded-file">
                        <img src="${e.target.result}" alt="Cover preview">
                        <button type="button" class="uploaded-file-remove" onclick="removeCoverImage()">&times;</button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Gallery images
    document.getElementById('gallery-images-input').addEventListener('change', (e) => {
        Array.from(e.target.files).forEach(file => {
            if (!galleryImageFiles.find(f => f.name === file.name)) {
                galleryImageFiles.push(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'uploaded-file';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Gallery preview">
                        <button type="button" class="uploaded-file-remove" onclick="removeGalleryImage('${file.name}')">&times;</button>
                    `;
                    document.getElementById('gallery-images-preview').appendChild(div);
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function removeCoverImage() {
    coverImageFile = null;
    document.getElementById('cover-image-input').value = '';
    document.getElementById('cover-image-preview').innerHTML = '';
}

function removeGalleryImage(fileName) {
    galleryImageFiles = galleryImageFiles.filter(f => f.name !== fileName);
    renderGalleryPreview();
}

function removeExistingGalleryImage(url) {
    existingGalleryImages = existingGalleryImages.filter(img => img !== url);
    renderExistingGalleryPreview();
}

function renderExistingGalleryPreview() {
    const container = document.getElementById('gallery-images-preview');
    const existingHtml = existingGalleryImages.map((url, index) => `
        <div class="uploaded-file">
            <img src="${url}" alt="Gallery">
            <button type="button" class="uploaded-file-remove" onclick="removeExistingGalleryImage('${url}')">&times;</button>
        </div>
    `).join('');
    
    const newFilesHtml = galleryImageFiles.map(file => {
        // This will be rendered by renderGalleryPreview
        return '';
    }).join('');
    
    // Re-render all
    container.innerHTML = existingHtml;
    renderGalleryPreview();
}

function renderGalleryPreview() {
    const container = document.getElementById('gallery-images-preview');
    
    // Keep existing images HTML
    const existingHtml = existingGalleryImages.map((url, index) => `
        <div class="uploaded-file">
            <img src="${url}" alt="Gallery">
            <button type="button" class="uploaded-file-remove" onclick="removeExistingGalleryImage('${url}')">&times;</button>
        </div>
    `).join('');
    
    // Add new files
    galleryImageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'uploaded-file';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Gallery preview">
                <button type="button" class="uploaded-file-remove" onclick="removeGalleryImage('${file.name}')">&times;</button>
            `;
            container.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// Save project
async function saveProject() {
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    hideMessages();

    try {
        // Use local storage if Supabase is not configured
        if (isLocalStorageMode()) {
            if (typeof window.LocalStorageAPI === 'undefined') {
                showError('Local storage API not loaded. Please refresh the page.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Project';
                return;
            }
            
            // Get form data
            const projectData = {
                title: document.getElementById('project-title').value,
                slug: document.getElementById('project-slug').value,
                headline: document.getElementById('project-headline').value,
                description: document.getElementById('project-description').value,
                client: document.getElementById('project-client').value || null,
                year: document.getElementById('project-year').value || null,
                video_url: document.getElementById('project-video-url').value || null,
                featured: document.getElementById('project-featured').checked,
                gallery_images: existingGalleryImages
            };

            // Upload cover image if new
            if (coverImageFile) {
                // Handle URL-based thumbnails (YouTube, Vimeo)
                if (coverImageFile.isUrl && coverImageFile.url) {
                    projectData.cover_image = coverImageFile.url;
                } else {
                    // Handle file uploads
                    const result = await window.LocalStorageAPI.uploadFile(coverImageFile, `projects/${projectData.slug}/cover.jpg`);
                    projectData.cover_image = result.publicUrl;
                }
            } else if (editingProjectId) {
                // Keep existing cover image
                const existing = currentProjects.find(p => p.id === editingProjectId);
                if (existing && existing.cover_image) {
                    projectData.cover_image = existing.cover_image;
                }
            }

            // Upload gallery images if new
            if (galleryImageFiles.length > 0) {
                const galleryUrls = [...existingGalleryImages];
                for (const file of galleryImageFiles) {
                    const result = await window.LocalStorageAPI.uploadFile(file, `projects/${projectData.slug}/gallery-${file.name}`);
                    galleryUrls.push(result.publicUrl);
                }
                projectData.gallery_images = galleryUrls;
            }

            // Save to local storage
            let result;
            if (editingProjectId) {
                result = await window.LocalStorageAPI.updateProject(editingProjectId, projectData);
            } else {
                result = await window.LocalStorageAPI.createProject(projectData);
            }

            showSuccess('Project saved successfully! (Saved in browser local storage)');
            await loadProjects();
            
            setTimeout(() => {
                closeProjectModal();
            }, 1000);
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Project';
            return;
        }
        
        // Use Supabase
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn || typeof getSupabaseFn !== 'function') {
            throw new Error('getSupabase function not found. Make sure config.js is loaded.');
        }
        
        const supabase = getSupabaseFn();
        
        if (!supabase) {
            throw new Error('Supabase is not configured. Please set up your Supabase credentials in config.js');
        }
        
        // Get form data
        const projectData = {
            title: document.getElementById('project-title').value,
            slug: document.getElementById('project-slug').value,
            headline: document.getElementById('project-headline').value,
            description: document.getElementById('project-description').value,
            client: document.getElementById('project-client').value || null,
            year: document.getElementById('project-year').value || null,
            video_url: document.getElementById('project-video-url').value || null,
            featured: document.getElementById('project-featured').checked
        };

        // Upload cover image if new
        if (coverImageFile) {
            // Handle URL-based thumbnails (YouTube, Vimeo) - use URL directly
            if (coverImageFile.isUrl && coverImageFile.url) {
                projectData.cover_image = coverImageFile.url;
            } else {
                // Handle file uploads to Supabase storage
                const coverPath = `projects/${projectData.slug}/cover-${Date.now()}.${coverImageFile.name.split('.').pop()}`;
                const { data: coverData, error: coverError } = await supabase.storage
                    .from('images')
                    .upload(coverPath, coverImageFile, { upsert: true });

                if (coverError) throw coverError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(coverPath);
                
                projectData.cover_image = publicUrl;
            }
        }

        // Handle gallery images
        const galleryUrls = [...existingGalleryImages]; // Start with existing images
        
        // Add new gallery images
        if (galleryImageFiles.length > 0) {
            for (const file of galleryImageFiles) {
                const galleryPath = `projects/${projectData.slug}/gallery-${Date.now()}-${file.name}`;
                const { error: galleryError } = await supabase.storage
                    .from('images')
                    .upload(galleryPath, file, { upsert: true });

                if (galleryError) throw galleryError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(galleryPath);
                
                galleryUrls.push(publicUrl);
            }
        }
        
        projectData.gallery_images = galleryUrls;

        // Save to database
        let result;
        if (editingProjectId) {
            // Update existing project
            const { data, error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingProjectId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new project
            const { data, error } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        showSuccess('Project saved successfully!');
        await loadProjects();
        
        setTimeout(() => {
            closeProjectModal();
        }, 1000);
    } catch (error) {
        console.error('Error saving project:', error);
        let errorMessage = error.message || 'Error saving project';
        
        // Provide helpful error messages
        if (error.message && error.message.includes('Supabase')) {
            errorMessage = error.message;
        } else if (error.message && error.message.includes('JWT')) {
            errorMessage = 'Authentication error. Please log out and log back in.';
        } else if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
            errorMessage = 'Database table not found. Please run the SQL setup from SUPABASE_SETUP.md to create the projects table.';
        } else if (error.message && error.message.includes('storage')) {
            errorMessage = 'Storage bucket not found. Please create the "images" bucket in Supabase Storage. See SUPABASE_SETUP.md for instructions.';
        }
        
        showError(errorMessage);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Project';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('form-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('form-success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

function hideMessages() {
    document.getElementById('form-error').style.display = 'none';
    document.getElementById('form-success').style.display = 'none';
}

// Initialize on page load - but wait a bit for all scripts to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    // DOM already loaded
    initializeDashboard();
}

async function initializeDashboard() {
    // Small delay to ensure all scripts are loaded
    setTimeout(async () => {
        // Wait a bit more for config.js to fully load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if required functions exist (check both window and global scope)
        const initSupabaseFn = window.initSupabase || (typeof initSupabase !== 'undefined' ? initSupabase : null);
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        
        if (!initSupabaseFn || typeof initSupabaseFn !== 'function') {
            const listContainer = document.getElementById('projects-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="error-message" style="padding: var(--spacing-md);">Error: initSupabase function not found.<br><br>Check browser console (F12) for details.<br>Make sure config.js is loaded before admin-dashboard.js.</div>';
            }
            console.error('initSupabase not found. Available:', {
                'window.initSupabase': typeof window.initSupabase,
                'initSupabase': typeof initSupabase
            });
            return;
        }
        
        if (!getSupabaseFn || typeof getSupabaseFn !== 'function') {
            const listContainer = document.getElementById('projects-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="error-message" style="padding: var(--spacing-md);">Error: getSupabase function not found.<br><br>Check browser console (F12) for details.<br>Make sure config.js is loaded before admin-dashboard.js.</div>';
            }
            console.error('getSupabase not found. Available:', {
                'window.getSupabase': typeof window.getSupabase,
                'getSupabase': typeof getSupabase
            });
            return;
        }
        
        // Use window functions if available
        if (typeof initSupabase === 'undefined') {
            window.initSupabase = initSupabaseFn;
        }
        if (typeof getSupabase === 'undefined') {
            window.getSupabase = getSupabaseFn;
        }
        
        if (typeof initDashboard === 'function') {
            initDashboard();
        } else {
            console.error('initDashboard function not found');
            const listContainer = document.getElementById('projects-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="error-message" style="padding: var(--spacing-md);">Error: Dashboard initialization function not found. Please refresh the page.</div>';
            }
        }
    }, 200);
}
