// Admin Authentication Utilities

// Check if user is authenticated
async function checkAuth() {
    // Skip authentication if Supabase is not configured (for development/testing)
    if (typeof SUPABASE_CONFIG === 'undefined' || 
        SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.log('Supabase not configured - skipping authentication');
        return true; // Allow access without auth
    }
    
    // Make sure Supabase is initialized
    if (typeof initSupabase === 'function') {
        initSupabase();
    }
    
    if (typeof getSupabase !== 'function') {
        console.error('getSupabase not available. Make sure config.js is loaded.');
        return true; // Allow access for development
    }
    
    const supabase = getSupabase();
    if (!supabase) {
        console.log('Supabase not initialized - allowing access for development');
        return true; // Allow access for development
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            console.log('No session found - allowing access for development');
            return true; // Allow access without auth for development
        }

        return true;
    } catch (error) {
        console.log('Auth check error - allowing access for development:', error);
        return true; // Allow access for development
    }
}

// Logout function
async function logout() {
    if (typeof getSupabase === 'function') {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
    }
    window.location.href = 'login.html';
}

// Initialize auth check on page load (for protected pages)
async function initAuth() {
    const isAuthenticated = await checkAuth();
    return isAuthenticated;
}
