/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000"]
        }
    },
    images: {
        domains: ['lh3.googleusercontent.com']
    },
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? { 
            exclude: ['error'] // Keep error logs
        } : false,
    },
    // Optional: Disable React's development mode warnings in production
    reactStrictMode: process.env.NODE_ENV !== 'production',
}

// Disable console.log in production
if (process.env.NODE_ENV === 'production') {
    console.log = () => {}
    console.warn = () => {}
    console.error = (message) => {
        // Only log actual errors, not warnings
        if (message instanceof Error) {
            // Log to your error tracking service here if needed
            // e.g., Sentry.captureException(message)
        }
    }
}

export default nextConfig;
