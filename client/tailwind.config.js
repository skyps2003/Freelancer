/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'main': '#073B4C',
                'primary': '#06D6A0',
                'secondary': '#1B9AAA',
                'alert': '#EF476F',
                'warning': '#FFD166',
            }
        },
    },
    plugins: [],
}
