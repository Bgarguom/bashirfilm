// Build script for production deployment
// Replaces environment variables in config.js
// Only updates if environment variables are set (production)

const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only build if environment variables are set (production)
if (supabaseUrl && supabaseKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
    
    console.log('Building for production...');
    
    // Read config.js
    const configPath = path.join(__dirname, 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace placeholders
    configContent = configContent.replace(/YOUR_SUPABASE_URL/g, supabaseUrl);
    configContent = configContent.replace(/YOUR_SUPABASE_ANON_KEY/g, supabaseKey);
    
    // Write back
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    console.log('✓ Configuration updated with environment variables');
} else {
    console.log('⚠ Environment variables not set - using default config (local development mode)');
}

console.log('✓ Build complete');
