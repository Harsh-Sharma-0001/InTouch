// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         dark: "#1A1A1A", // Main background
//         "dark-card": "#222222", // Card backgrounds
//         "dark-lighter": "#2B2B2B", // Lighter dark for elements like calendar days
//         primary: "#7B61FF", // Your primary purple color
//         "gray-text": "#A0A0A0", // Lighter grey for secondary text
//         "border-color": "#3A3A3A", // Border color
//       },
//       boxShadow: {
//         custom: "0 4px 6px rgba(0, 0, 0, 0.1)",
//       },
//     },
//   },
//   plugins: [],
// };





/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1A1A2E', // Main background color
        'dark-card': '#252540', // Card background color
        'dark-lighter': '#32324F', // Slightly lighter dark for elements like buttons
        primary: '#6A5ACD', // A purple-like color, adjust to match exact purple in screenshot
        'success-green': '#34D399', // Green for success indicators
        'warning-yellow': '#FBBF24', // Yellow for warnings
        'danger-red': '#EF4444', // Red for alerts/danger
        'gray-text': '#A0A0A0', // Lighter grey for secondary text
        'border-color': '#4B5563', // A consistent border color
        
        'dark-header': '#1a1a2e', // Example dark header color
        'dark-border': '#2c2c4d', // Example dark border color
        'dark-card': '#252540',   // Example dark card background
        'primary': '#6366f1', // Example primary color, adjust as needed
        'gray-text': '#a0a0b0', // Example text color for grey text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or your preferred font
      },
    },
  },
  plugins: [],
}




