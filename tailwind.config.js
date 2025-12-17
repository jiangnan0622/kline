/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ink: {
                    DEFAULT: '#111111',
                    light: '#333333',
                    lighter: '#555555'
                },
                paper: {
                    DEFAULT: '#FAF9F6', // 稍微暖一点的白
                    dark: '#F0EFE9'
                },
                cinnabar: {
                    DEFAULT: '#B83B3B', // 朱砂红
                    light: '#D65A5A',
                    dark: '#8B2525'
                },
                'indigo-dye': {
                    DEFAULT: '#374E59', // 黛色/深蓝灰
                    light: '#567282'
                },
                gold: {
                    DEFAULT: '#CFB053',
                    light: '#E5C975'
                }
            },
            fontFamily: {
                'serif-sc': ['"Noto Serif SC"', 'serif'],
                'calligraphy': ['"Ma Shan Zheng"', '"ZCOOL XiaoWei"', 'cursive'],
                'sans': ['"Inter"', '"PingFang SC"', 'sans-serif'], // 备用
            },
            backgroundImage: {
                'paper-pattern': "url('https://www.transparenttextures.com/patterns/cream-paper.png')", // 使用在线纹理或稍后生成svg
                'cloud-pattern': "radial-gradient(circle at 50% 50%, #FAF9F6 0%, #F0EFE9 100%)",
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'ink-spread': 'inkSpread 1s ease-out forwards'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                inkSpread: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                }
            }
        },
    },
    plugins: [],
}
