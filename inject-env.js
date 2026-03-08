// Script to inject environment variables into HTML files
// This runs at build time to inject Supabase credentials
// Only runs in production (when environment variables are set)

const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only inject if environment variables are set (production)
if (supabaseUrl && supabaseKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
    
    const htmlFiles = [
        'index.html',
        'projects.html',
        'project.html',
        'admin/login.html',
        'admin/dashboard.html'
    ];

    // Create inline script to inject env vars
    const envScript = `
<script>
    window.SUPABASE_URL = '${supabaseUrl}';
    window.SUPABASE_ANON_KEY = '${supabaseKey}';
</script>
`;

    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove existing env script if present
            content = content.replace(
                /<script>\s*window\.SUPABASE_URL[^<]*<\/script>/gi,
                ''
            );
            
            // Insert after <head> tag
            content = content.replace(
                /<head>/i,
                `<head>${envScript}`
            );
            
            fs.writeFileSync(filePath, content, 'utf8');
        }
    });
    
    console.log('✓ Environment variables injected into HTML files');
} else {
    console.log('⚠ Environment variables not set - skipping injection (local development mode)');
}
