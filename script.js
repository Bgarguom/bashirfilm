// Load projects data from Supabase or Local Storage
let projectsData = null;

async function loadProjectsData() {
    if (projectsData) return projectsData;
    
    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        if (isLocalMode) {
            // Load from local storage
            const data = await loadProjectsFromLocalStorage();
            projectsData = data;
            return data;
        }
        
        // Initialize Supabase
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
        
        // Try to load from Supabase
        const data = await loadProjectsFromSupabase();
        projectsData = data;
        return data;
    } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to empty array if both fail
        return { projects: [] };
    }
}

// Load featured projects on home page
async function loadFeaturedProjects() {
    const grid = document.getElementById('featured-projects-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        if (!isLocalMode && typeof initSupabase === 'function') {
            // Initialize Supabase only if not in local mode
            initSupabase();
        }
        
        // Load featured projects (will use local storage or Supabase automatically)
        const featuredProjects = await loadFeaturedProjectsFromSupabase();
        
        grid.innerHTML = '';

        if (featuredProjects.length === 0) {
            grid.innerHTML = '<p class="loading">No featured projects yet.</p>';
            return;
        }

        featuredProjects.forEach(project => {
            const card = createProjectCard(project);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading featured projects:', error);
        grid.innerHTML = '<p class="loading">Error loading projects.</p>';
    }
}

// Load all projects on projects page
async function loadAllProjects() {
    const grid = document.getElementById('all-projects-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        if (!isLocalMode && typeof initSupabase === 'function') {
            // Initialize Supabase only if not in local mode
            initSupabase();
        }
        
        const data = await loadProjectsData();

        grid.innerHTML = '';

        if (data.projects.length === 0) {
            grid.innerHTML = '<p class="loading">No projects yet.</p>';
            return;
        }

        data.projects.forEach(project => {
            const card = createProjectCard(project);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p class="loading">Error loading projects.</p>';
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('a');
    card.href = `project.html?slug=${project.id}`;
    card.className = 'project-card';

    const image = document.createElement('img');
    image.src = project.thumbnail;
    image.alt = project.title;
    image.className = 'project-card-image';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%231a1a1a" width="800" height="450"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="24"%3EImage%3C/text%3E%3C/svg%3E';
    };

    const content = document.createElement('div');
    content.className = 'project-card-content';

    const title = document.createElement('h3');
    title.className = 'project-card-title';
    title.textContent = project.title;

    const headline = document.createElement('p');
    headline.className = 'project-card-headline';
    headline.textContent = project.headline;

    const link = document.createElement('span');
    link.className = 'project-card-link';
    link.textContent = 'View →';

    content.appendChild(title);
    content.appendChild(headline);
    content.appendChild(link);

    card.appendChild(image);
    card.appendChild(content);

    return card;
}

// Load project details on project page
async function loadProjectDetails() {
    const content = document.getElementById('project-content');
    if (!content) return;

    content.innerHTML = '<div class="loading">Loading project...</div>';

    // Get project slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectSlug = urlParams.get('slug') || urlParams.get('id'); // Support both for backward compatibility

    if (!projectSlug) {
        content.innerHTML = '<p class="loading">Project not found.</p>';
        return;
    }

    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        if (!isLocalMode && typeof initSupabase === 'function') {
            // Initialize Supabase only if not in local mode
            initSupabase();
        }
        
        // Load project by slug (will use local storage or Supabase automatically)
        const project = await loadProjectBySlug(projectSlug);

        if (!project) {
            content.innerHTML = '<p class="loading">Project not found.</p>';
            return;
        }

        // Build project page content
        let html = `
            <div class="project-header">
                <h1 class="project-title">${project.title}</h1>
                <p class="project-headline">${project.headline}</p>
            </div>
        `;

        // Add main media (video or cover image)
        html += '<div class="project-media">';
        if (project.media.type === 'video' && project.media.url) {
            // Use video embed utility if available
            if (typeof window.createVideoEmbed === 'function') {
                html += window.createVideoEmbed(project.media.url, project.media.poster || project.thumbnail);
            } else {
                // Fallback to basic video element
                html += `<div class="video-container">
                    <video controls poster="${project.media.poster || project.thumbnail || ''}" preload="metadata" playsinline>
                        <source src="${project.media.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>`;
            }
        } else if (project.media.url) {
            html += `<img src="${project.media.url}" alt="${project.title}" loading="lazy" decoding="async">`;
        }
        html += '</div>';

        // Add description
        html += `<p class="project-description">${project.description}</p>`;

        // Add gallery images if available
        if (project.gallery_images && project.gallery_images.length > 0) {
            html += '<div class="project-gallery">';
            project.gallery_images.forEach(imgUrl => {
                html += `<img src="${imgUrl}" alt="${project.title}" class="project-gallery-image" loading="lazy" decoding="async">`;
            });
            html += '</div>';
        }

        // Add project details
        html += `
            <div class="project-details">
        `;
        
        if (project.client) {
            html += `
                <div class="project-detail-item">
                    <span class="project-detail-label">Client</span>
                    <span class="project-detail-value">${project.client}</span>
                </div>
            `;
        }
        
        if (project.year) {
            html += `
                <div class="project-detail-item">
                    <span class="project-detail-label">Year</span>
                    <span class="project-detail-value">${project.year}</span>
                </div>
            `;
        }
        
        html += `</div>`;

        content.innerHTML = html;

        // Update page title and meta tags dynamically
        updateProjectMetaTags(project);
        
        // Add structured data for project
        addProjectStructuredData(project);
    } catch (error) {
        console.error('Error loading project:', error);
        content.innerHTML = '<p class="loading">Error loading project.</p>';
    }
}

// Load hero portrait image as background in gradient
async function loadHeroPortrait() {
    const bgContainer = document.getElementById('hero-portrait-background');
    const bgImage = document.getElementById('hero-portrait-bg-image');
    
    if (!bgContainer || !bgImage) return;
    
    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        let portraitUrl = null;
        
        if (isLocalMode) {
            // Load from local storage
            const settings = localStorage.getItem('bashir_filmmaker_site_settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                portraitUrl = parsed.hero_portrait_image || null;
            }
        } else {
            // Load from Supabase
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .select('hero_portrait_image')
                        .single();
                    
                    if (!error && data) {
                        portraitUrl = data.hero_portrait_image || null;
                    }
                }
            }
        }
        
        if (portraitUrl) {
            bgImage.src = portraitUrl;
            bgImage.onload = () => {
                bgContainer.style.display = 'block';
            };
            bgImage.onerror = () => {
                bgContainer.style.display = 'none';
            };
        } else {
            bgContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading hero portrait:', error);
        bgContainer.style.display = 'none';
    }
}

// Load about section background image
async function loadAboutBackground() {
    const container = document.getElementById('about-background-image');
    const image = document.getElementById('about-bg-img');
    
    if (!container || !image) {
        return;
    }
    
    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        let aboutBgUrl = null;
        
        if (isLocalMode) {
            // Load from local storage
            const settings = localStorage.getItem('bashir_filmmaker_site_settings');
            if (settings) {
                try {
                    const parsed = JSON.parse(settings);
                    aboutBgUrl = parsed.about_background_image || null;
                    // Loaded from local storage
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
        } else {
            // Load from Supabase
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .select('about_background_image')
                        .single();
                    
                    if (!error && data) {
                        aboutBgUrl = data.about_background_image || null;
                    }
                }
            }
        }
        
        if (aboutBgUrl && aboutBgUrl.trim() !== '') {
            image.src = aboutBgUrl;
            image.onload = () => {
                container.classList.add('show');
            };
            image.onerror = () => {
                container.classList.remove('show');
            };
        } else {
            container.classList.remove('show');
        }
    } catch (error) {
        console.error('Error loading about background:', error);
        container.classList.remove('show');
    }
}

// Load contact background
async function loadContactBackground() {
    const container = document.getElementById('contact-background-image');
    const image = document.getElementById('contact-bg-img');
    
    if (!container || !image) {
        return;
    }
    
    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        let contactBgUrl = null;
        
        if (isLocalMode) {
            // Load from local storage
            const settings = localStorage.getItem('bashir_filmmaker_site_settings');
            if (settings) {
                try {
                    const parsed = JSON.parse(settings);
                    contactBgUrl = parsed.contact_image || null;
                    // Loaded from local storage
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
        } else {
            // Load from Supabase
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .select('contact_image')
                        .single();
                    
                    if (!error && data) {
                        contactBgUrl = data.contact_image || null;
                    }
                }
            }
        }
        
        if (contactBgUrl && contactBgUrl.trim() !== '') {
            image.src = contactBgUrl;
            image.onload = () => {
                container.classList.add('show');
            };
            image.onerror = () => {
                container.classList.remove('show');
            };
        } else {
            container.classList.remove('show');
        }
    } catch (error) {
        console.error('Error loading contact background:', error);
        container.classList.remove('show');
    }
}

// Load contact information
async function loadContactInfo() {
    const emailBtn = document.getElementById('contact-email-btn');
    const phoneBtn = document.getElementById('contact-phone-btn');
    const whatsappBtn = document.getElementById('contact-whatsapp-btn');
    const instagramBtn = document.getElementById('contact-instagram-btn');
    
    if (!emailBtn || !phoneBtn || !whatsappBtn || !instagramBtn) {
        return;
    }
    
    try {
        // Check if using local storage mode
        const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
        const isLocalMode = !supabaseConfig || 
                           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
                           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
        
        let contactData = {
            email: null,
            phone: null,
            whatsapp: null,
            instagram: null
        };
        
        if (isLocalMode) {
            // Load from local storage
            const settings = localStorage.getItem('bashir_filmmaker_site_settings');
            if (settings) {
                try {
                    const parsed = JSON.parse(settings);
                    contactData = {
                        email: parsed.contact_email || null,
                        phone: parsed.contact_phone || null,
                        whatsapp: parsed.contact_whatsapp || null,
                        instagram: parsed.contact_instagram || null
                    };
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
        } else {
            // Load from Supabase
            const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
            if (getSupabaseFn) {
                const supabase = getSupabaseFn();
                if (supabase) {
                    const { data, error } = await supabase
                        .from('site_settings')
                        .select('contact_email, contact_phone, contact_whatsapp, contact_instagram')
                        .single();
                    
                    if (!error && data) {
                        contactData = {
                            email: data.contact_email || null,
                            phone: data.contact_phone || null,
                            whatsapp: data.contact_whatsapp || null,
                            instagram: data.contact_instagram || null
                        };
                    }
                }
            }
        }
        
        // Update email button
        if (contactData.email) {
            emailBtn.href = `mailto:${contactData.email}`;
            emailBtn.style.display = 'flex';
        } else {
            emailBtn.style.display = 'none';
        }
        
        // Update phone button
        if (contactData.phone) {
            phoneBtn.href = `tel:${contactData.phone}`;
            phoneBtn.style.display = 'flex';
        } else {
            phoneBtn.style.display = 'none';
        }
        
        // Update WhatsApp button
        if (contactData.whatsapp) {
            // Remove any non-digit characters except + for WhatsApp URL
            const whatsappNumber = contactData.whatsapp.replace(/[^\d+]/g, '');
            whatsappBtn.href = `https://wa.me/${whatsappNumber}`;
            whatsappBtn.style.display = 'flex';
        } else {
            whatsappBtn.style.display = 'none';
        }
        
        // Update Instagram button
        if (contactData.instagram) {
            instagramBtn.href = contactData.instagram;
            instagramBtn.style.display = 'flex';
        } else {
            instagramBtn.style.display = 'none';
        }
        
        // Update contact info display (email and phone below buttons)
        const contactInfoContainer = document.getElementById('contact-info');
        const emailInfo = document.getElementById('contact-email-info');
        const phoneInfo = document.getElementById('contact-phone-info');
        const emailValue = document.getElementById('contact-email-value');
        const phoneValue = document.getElementById('contact-phone-value');
        
        let hasInfo = false;
        
        // Display email info
        if (contactData.email) {
            emailValue.textContent = contactData.email;
            emailInfo.style.display = 'flex';
            hasInfo = true;
        } else {
            emailInfo.style.display = 'none';
        }
        
        // Display phone info
        if (contactData.phone) {
            phoneValue.textContent = contactData.phone;
            phoneInfo.style.display = 'flex';
            hasInfo = true;
        } else {
            phoneInfo.style.display = 'none';
        }
        
        // Show/hide contact info container
        if (hasInfo && contactInfoContainer) {
            contactInfoContainer.style.display = 'flex';
        } else if (contactInfoContainer) {
            contactInfoContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Initialize on page load
function initializePages() {
    // Load hero portrait on home page
    if (document.getElementById('hero-portrait-background')) {
        loadHeroPortrait();
    }
    
    // Load about background on home page
    if (document.getElementById('about-background-image')) {
        loadAboutBackground();
    }
    
    // Load contact background on home page
    if (document.getElementById('contact-background-image')) {
        loadContactBackground();
    }
    
    // Load contact information on home page
    if (document.getElementById('contact-buttons')) {
        loadContactInfo();
    }
    
    // Load featured projects on home page
    if (document.getElementById('featured-projects-grid')) {
        loadFeaturedProjects();
    }

    // Load all projects on projects page
    if (document.getElementById('all-projects-grid')) {
        loadAllProjects();
    }

    // Load project details on project page
    if (document.getElementById('project-content')) {
        loadProjectDetails();
    }
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const body = document.body;
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }
}

// Navigation scroll effect
function initNavigationScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Fade-in animation for elements
function initFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections (exclude hero)
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.classList.add('scroll-reveal');
        observer.observe(section);
    });
    
    // Observe section headings
    const headings = document.querySelectorAll('.section-subheading, .section-title-large');
    headings.forEach((heading, index) => {
        heading.classList.add('scroll-reveal');
        heading.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(heading);
    });
    
    // Observe project cards (will be added dynamically)
    const observeProjectCards = () => {
        const projectCards = document.querySelectorAll('.project-card:not(.observed)');
        projectCards.forEach((card, index) => {
            card.classList.add('scroll-reveal', 'observed');
            card.style.transitionDelay = `${index * 0.08}s`;
            observer.observe(card);
        });
    };
    
    // Initial observation
    observeProjectCards();
    
    // Re-observe after projects load
    setTimeout(observeProjectCards, 500);
    setTimeout(observeProjectCards, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializePages();
        initNavigationScroll();
        initMobileMenu();
        // Delay fade-in animations slightly to ensure content is loaded
        setTimeout(initFadeInAnimations, 300);
    });
} else {
    // DOM already loaded
    initializePages();
    initNavigationScroll();
    initMobileMenu();
    setTimeout(initFadeInAnimations, 300);
}
