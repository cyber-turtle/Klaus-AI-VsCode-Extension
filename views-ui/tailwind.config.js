/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
	safelist: ["bg-code-light", "bg-code-dark",
		{ pattern: /language-*/ }, 
		{ pattern: /react-syntax-highlighter-*/ }
	  ],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			},
			animation: {
				"spin-slow": "spin 3s linear infinite",
				"fade-in": "fadeIn 0.3s ease-out",
			},
			colors: {
				code: {
					light: "#f6f8fa",
					dark: "#151b23",
				},
			},
			keyframes: {
				'fadeIn': {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
		},
	},
	plugins: [],
};
