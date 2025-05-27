import { Fustat, Space_Mono } from 'next/font/google';

// Load Fustat with all weights and subsets
export const fustat = Fustat({
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-fustat',
    preload: true,
    fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
});

// Load Space Mono with all weights and subsets
export const spaceMono = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-space-mono',
    preload: true,
    fallback: ['Courier New', 'Courier', 'monospace']
});

// Font face definitions for critical CSS
// These will be inlined in the head of the document
export const fontFaces = `
  @font-face {
    font-family: 'Fustat';
    src: url('https://fonts.gstatic.com/s/fustat/v1/7cHrv4wK2MnH0U3Z5Xc8Q3XU.woff2') format('woff2');
    font-weight: 200 800;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Space Mono';
    src: url('https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8QA.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Space Mono';
    src: url('https://fonts.gstatic.com/s/spacemono/v13/i7dMIFZifjKcF5UAWdDRaPpZUFWaHg.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Space Mono';
    src: url('https://fonts.gstatic.com/s/spacemono/v13/i7dNIFZifjKcF5UAWdDRYER8TXF0.woff2') format('woff2');
    font-weight: 400;
    font-style: italic;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Space Mono';
    src: url('https://fonts.gstatic.com/s/spacemono/v13/i7dSIFZifjKcF5UAWdDRYERE_FeqEiQ.woff2') format('woff2');
    font-weight: 700;
    font-style: italic;
    font-display: swap;
  }
`;
