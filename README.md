# Weather App

A web application that allows users to check current weather conditions and forecasts for any location.

Based on: [Weather App Project](https://roadmap.sh/projects/weather-app)
Repository: [Weather Web](https://github.com/rwsrx/Weather)

## 🌟 Features

- 🔍 Location search with autocomplete
- 📍 Automatic current location detection
- 🌡️ Display of current weather conditions:
  - Temperature
  - Wind speed
  - Humidity
  - Precipitation probability
- ⏱️ Hourly forecast for the next 24 hours
- 🎨 Modern and responsive interface with smooth animations
- 🌓 Elegant dark theme design

## 🛠️ Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- React Swiper for forecast carousel
- Visual Crossing Weather API
- Lucide Icons

## 🚀 How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/rwsrx/Weather.git
   ```

2. Install dependencies:
   ```bash
   cd weather-app
   npm install
   ```

3. Create a `.env.local` file in the project root and add your Visual Crossing API key:
   ```bash
   NEXT_PUBLIC_WEATHER_API_KEY=your_visual_crossing_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
