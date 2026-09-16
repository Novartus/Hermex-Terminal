/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#f1f3f7',
          surface: '#ffffff',
          surfaceHover: '#f8fafc',
          border: '#e5e7eb',
          borderLight: '#f1f5f9',
          text: '#0f172a',
          muted: '#64748b',
          dim: '#94a3b8',
          blue: '#3b82f6',
          blueHover: '#2563eb',
          green: '#10b981',
          greenLight: '#ecfdf5',
          greenText: '#059669',
          red: '#f43f5e',
          redLight: '#fff1f2',
          redText: '#e11d48',
          amber: '#f59e0b',
        },
        terminal: {
          bg: '#090d16',
          surface: '#111726',
          card: '#161e31',
          panel: '#1b253c',
          border: '#232f48',
          borderLight: '#334155',
          text: '#f1f5f9',
          muted: '#94a3b8',
          dim: '#64748b',
          green: '#00f090',
          red: '#ff3366',
          cyan: '#00d4ff',
          amber: '#ffb800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
