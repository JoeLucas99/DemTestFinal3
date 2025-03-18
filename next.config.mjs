/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for GitHub Pages deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set the base path for GitHub Pages deployment
  // This should match your repository name
  basePath: '/DemTestFinal3',
  
  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
}

export default nextConfig;