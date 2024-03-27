/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './front/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './front/src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ], 
  mode: 'jit',
  purge: [
    './front/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './front/src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

