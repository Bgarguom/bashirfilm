// Supabase Configuration
// Prevent multiple declarations by using IIFE
(function() {
    'use strict';
    
    // Prevent multiple loads
    if (window.__SUPABASE_CONFIG_LOADED__) {
        return;
    }
    window.__SUPABASE_CONFIG_LOADED__ = true;
    
    // Configuration - Uses environment variables in production
    if (typeof window.SUPABASE_CONFIG === 'undefined') {
        // Try to get from environment variables (for production)
        const supabaseUrl = window.SUPABASE_URL || 
                           (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ||
                           'YOUR_SUPABASE_URL';
        
        const supabaseKey = window.SUPABASE_ANON_KEY || 
                           (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) ||
                           'YOUR_SUPABASE_ANON_KEY';
        
        window.SUPABASE_CONFIG = {
            url: supabaseUrl,
            anonKey: supabaseKey
        };
    }
    
    // Make it available globally
    window.SUPABASE_CONFIG_GLOBAL = window.SUPABASE_CONFIG;
    
    // Initialize Supabase client storage
    if (typeof window.supabaseClient === 'undefined') {
        window.supabaseClient = null;
    }
    
    // Initialize Supabase function
    window.initSupabase = function() {
        // Return existing client if already initialized
        if (window.supabaseClient && window.supabaseClient !== null) {
            return window.supabaseClient;
        }
        
        // Load Supabase JS library if not already loaded
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase JS library not loaded. Make sure to include the Supabase script in your HTML.');
            return null;
        }
        
        try {
            const config = window.SUPABASE_CONFIG_GLOBAL || window.SUPABASE_CONFIG;
            window.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
            return window.supabaseClient;
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            return null;
        }
    };
    
    // Get Supabase function
    window.getSupabase = function() {
        if (!window.supabaseClient || window.supabaseClient === null) {
            return window.initSupabase();
        }
        return window.supabaseClient;
    };
    
    // Make available in global scope for backward compatibility
    if (typeof window !== 'undefined') {
        window.SUPABASE_CONFIG = window.SUPABASE_CONFIG_GLOBAL || window.SUPABASE_CONFIG;
    }
})();

// Export to global scope for scripts that expect them
if (typeof SUPABASE_CONFIG === 'undefined') {
    var SUPABASE_CONFIG = window.SUPABASE_CONFIG;
}
if (typeof initSupabase === 'undefined') {
    var initSupabase = window.initSupabase;
}
if (typeof getSupabase === 'undefined') {
    var getSupabase = window.getSupabase;
}
