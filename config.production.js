// Production Supabase Configuration
// This file is loaded in production to inject environment variables
// For Vercel/Netlify, environment variables are automatically available

(function() {
    'use strict';
    
    // Prevent multiple loads
    if (window.__SUPABASE_CONFIG_LOADED__) {
        return;
    }
    window.__SUPABASE_CONFIG_LOADED__ = true;
    
    // Get configuration from environment variables or window object
    // In production, these are set by the hosting platform
    const getEnvVar = (name, defaultValue) => {
        // Try window object first (for client-side injection)
        if (typeof window !== 'undefined' && window[name]) {
            return window[name];
        }
        // Try process.env (for Node.js environments)
        if (typeof process !== 'undefined' && process.env && process.env[name]) {
            return process.env[name];
        }
        return defaultValue;
    };
    
    const supabaseUrl = getEnvVar('SUPABASE_URL', 'YOUR_SUPABASE_URL');
    const supabaseKey = getEnvVar('SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY');
    
    // Configuration
    if (typeof window.SUPABASE_CONFIG === 'undefined') {
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
            if (window.SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
                // Silently fail in development mode
                return null;
            }
            return null;
        }
        
        try {
            const config = window.SUPABASE_CONFIG_GLOBAL || window.SUPABASE_CONFIG;
            
            // Validate configuration
            if (!config.url || config.url === 'YOUR_SUPABASE_URL' || 
                !config.anonKey || config.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                return null;
            }
            
            window.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
            return window.supabaseClient;
        } catch (error) {
            // Silently fail in production
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
