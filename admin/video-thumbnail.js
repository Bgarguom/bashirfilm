// Video Thumbnail Generator
// Automatically generates thumbnails from video URLs

function extractVideoThumbnail(videoUrl) {
    if (!videoUrl || !videoUrl.trim()) {
        return null;
    }

    const url = videoUrl.trim();

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = null;
        
        // youtube.com/watch?v=VIDEO_ID
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (youtubeMatch) {
            videoId = youtubeMatch[1];
        }
        
        if (videoId) {
            // Try high quality thumbnail first
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            const videoId = vimeoMatch[1];
            // Vimeo thumbnail requires API call, but we can try the direct URL
            // For now, return null and handle via API if needed
            return null; // Vimeo requires oEmbed API call
        }
    }

    // Direct video file (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
        // For direct video files, we'll create a video element and capture a frame
        return null; // Will be handled by captureVideoFrame
    }

    return null;
}

// Capture thumbnail from direct video file
function captureVideoFrame(videoUrl, callback) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            // Seek to 1 second (or 10% of duration)
            video.currentTime = Math.min(1, video.duration * 0.1);
        };
        
        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(thumbnailUrl);
            } catch (error) {
                reject(error);
            }
        };
        
        video.onerror = (error) => {
            reject(new Error('Failed to load video'));
        };
        
        video.src = videoUrl;
    });
}

// Get Vimeo thumbnail via oEmbed
async function getVimeoThumbnail(videoUrl) {
    try {
        const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        if (!videoId) return null;
        
        const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`);
        const data = await response.json();
        return data.thumbnail_url || null;
    } catch (error) {
        console.error('Error fetching Vimeo thumbnail:', error);
        return null;
    }
}

// Main function to get thumbnail from video URL
async function getVideoThumbnail(videoUrl) {
    console.log('getVideoThumbnail called with:', videoUrl);
    
    if (!videoUrl || !videoUrl.trim()) {
        console.log('No video URL provided');
        return null;
    }

    const url = videoUrl.trim();
    console.log('Processing URL:', url);

    // Try direct thumbnail extraction first (YouTube)
    const directThumbnail = extractVideoThumbnail(url);
    if (directThumbnail) {
        console.log('Found YouTube thumbnail:', directThumbnail);
        return directThumbnail;
    }

    // Handle Vimeo
    if (url.includes('vimeo.com')) {
        console.log('Detected Vimeo URL, fetching thumbnail...');
        try {
            const thumbnail = await getVimeoThumbnail(url);
            if (thumbnail) {
                console.log('Found Vimeo thumbnail:', thumbnail);
                return thumbnail;
            }
        } catch (error) {
            console.error('Error getting Vimeo thumbnail:', error);
        }
    }

    // Handle direct video files
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
        console.log('Detected direct video file, capturing frame...');
        try {
            const thumbnail = await captureVideoFrame(url);
            if (thumbnail) {
                console.log('Captured video frame');
                return thumbnail;
            }
        } catch (error) {
            console.error('Error capturing video frame:', error);
        }
    }

    console.log('No thumbnail found for URL:', url);
    return null;
}

// Make available globally
window.getVideoThumbnail = getVideoThumbnail;
window.extractVideoThumbnail = extractVideoThumbnail;

console.log('video-thumbnail.js loaded, getVideoThumbnail available:', typeof window.getVideoThumbnail);
