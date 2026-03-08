// Public API for fetching projects from Supabase or Local Storage
// This file is used by the public-facing pages

// Check if using local storage mode
function isLocalStorageMode() {
    const supabaseConfig = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
    return !supabaseConfig || 
           supabaseConfig.url === 'YOUR_SUPABASE_URL' || 
           supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY';
}

// Load projects from Local Storage
async function loadProjectsFromLocalStorage() {
    try {
        const data = localStorage.getItem('bashir_filmmaker_projects');
        const projects = data ? JSON.parse(data) : [];
        
        // Transform to match expected format
        return {
            projects: projects.map(project => ({
                id: project.slug,
                title: project.title,
                headline: project.headline,
                description: project.description,
                client: project.client,
                year: project.year,
                thumbnail: project.cover_image || '',
                media: {
                    type: project.video_url ? 'video' : 'image',
                    url: project.video_url || project.cover_image || '',
                    poster: project.cover_image || ''
                },
                gallery_images: project.gallery_images || []
            }))
        };
    } catch (error) {
        console.error('Error loading projects from local storage:', error);
        return { projects: [] };
    }
}

// Load projects from Supabase
async function loadProjectsFromSupabase() {
    try {
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn) {
            console.error('getSupabase not available');
            return { projects: [] };
        }
        
        const supabase = getSupabaseFn();
        if (!supabase) {
            console.error('Supabase not initialized');
            return { projects: [] };
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading projects:', error);
            return { projects: [] };
        }

        // Transform Supabase data to match expected format
        const projects = (data || []).map(project => ({
            id: project.slug,
            title: project.title,
            headline: project.headline,
            description: project.description,
            client: project.client,
            year: project.year,
            thumbnail: project.cover_image || '',
            media: {
                type: project.video_url ? 'video' : 'image',
                url: project.video_url || project.cover_image || '',
                poster: project.cover_image || ''
            },
            gallery_images: project.gallery_images || []
        }));

        return { projects };
    } catch (error) {
        console.error('Error loading projects:', error);
        return { projects: [] };
    }
}

// Load featured projects from Supabase or Local Storage
async function loadFeaturedProjectsFromSupabase() {
    // Use local storage if Supabase is not configured
    if (isLocalStorageMode()) {
        try {
            const data = localStorage.getItem('bashir_filmmaker_projects');
            const projects = data ? JSON.parse(data) : [];
            
            // Filter featured projects and limit to 4
            const featured = projects
                .filter(p => p.featured === true)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 4)
                .map(project => ({
                    id: project.slug,
                    title: project.title,
                    headline: project.headline,
                    description: project.description,
                    client: project.client,
                    year: project.year,
                    thumbnail: project.cover_image || '',
                    media: {
                        type: project.video_url ? 'video' : 'image',
                        url: project.video_url || project.cover_image || '',
                        poster: project.cover_image || ''
                    },
                    gallery_images: project.gallery_images || []
                }));
            
            return featured;
        } catch (error) {
            console.error('Error loading featured projects from local storage:', error);
            return [];
        }
    }
    
    // Use Supabase
    try {
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn) {
            console.error('getSupabase not available');
            return [];
        }
        
        const supabase = getSupabaseFn();
        if (!supabase) {
            console.error('Supabase not initialized');
            return [];
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) {
            console.error('Error loading featured projects:', error);
            return [];
        }

        // Transform Supabase data to match expected format
        const projects = (data || []).map(project => ({
            id: project.slug,
            title: project.title,
            headline: project.headline,
            description: project.description,
            client: project.client,
            year: project.year,
            thumbnail: project.cover_image || '',
            media: {
                type: project.video_url ? 'video' : 'image',
                url: project.video_url || project.cover_image || '',
                poster: project.cover_image || ''
            },
            gallery_images: project.gallery_images || []
        }));

        return projects;
    } catch (error) {
        console.error('Error loading featured projects:', error);
        return [];
    }
}

// Load single project by slug from Supabase or Local Storage
async function loadProjectBySlug(slug) {
    // Use local storage if Supabase is not configured
    if (isLocalStorageMode()) {
        try {
            const data = localStorage.getItem('bashir_filmmaker_projects');
            const projects = data ? JSON.parse(data) : [];
            const project = projects.find(p => p.slug === slug);
            
            if (!project) {
                return null;
            }
            
            // Transform to match expected format
            return {
                id: project.slug,
                title: project.title,
                headline: project.headline,
                description: project.description,
                client: project.client,
                year: project.year,
                thumbnail: project.cover_image || '',
                media: {
                    type: project.video_url ? 'video' : 'image',
                    url: project.video_url || project.cover_image || '',
                    poster: project.cover_image || ''
                },
                gallery_images: project.gallery_images || []
            };
        } catch (error) {
            console.error('Error loading project from local storage:', error);
            return null;
        }
    }
    
    // Use Supabase
    try {
        const getSupabaseFn = window.getSupabase || (typeof getSupabase !== 'undefined' ? getSupabase : null);
        if (!getSupabaseFn) {
            console.error('getSupabase not available');
            return null;
        }
        
        const supabase = getSupabaseFn();
        if (!supabase) {
            console.error('Supabase not initialized');
            return null;
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            console.error('Error loading project:', error);
            return null;
        }

        // Transform Supabase data to match expected format
        return {
            id: data.slug,
            title: data.title,
            headline: data.headline,
            description: data.description,
            client: data.client,
            year: data.year,
            thumbnail: data.cover_image || '',
            media: {
                type: data.video_url ? 'video' : 'image',
                url: data.video_url || data.cover_image || '',
                poster: data.cover_image || ''
            },
            gallery_images: data.gallery_images || []
        };
    } catch (error) {
        console.error('Error loading project:', error);
        return null;
    }
}
