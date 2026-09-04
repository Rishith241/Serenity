# Serenity — Mental Health & Reflection Companion

A minimalist, privacy-first web application designed to support daily emotional wellness and mindfulness. Built with a calming, low-stimulus dark aesthetic to reduce sensory fatigue and encourage quiet reflection.

---

## Key Features

- **Daily Mood & Rhythm Tracking:** Log emotional states (*Peaceful*, *Content*, *Energized*, *Neutral*, *Anxious*, *Stressed*, *Low*), energy levels (1–5), sleep quality (1–5), context tags, and personal notes. Track progress over time with a rolling 7-day visual rhythm bar chart.
- **Gratitude Journaling:** Capture daily micro-moments of gratitude with category tagging (*Everyday*, *People*, *Moments*, *Growth*, *Nature*) and rotating thought-starter prompts to overcome blank-canvas hesitation.
- **Guided Breathwork (Zero-Asset Web Audio):** Practice evidence-based breathing techniques (*Box Breathing 4-4-4-4*, *4-7-8 Relaxing Breath*, and *Calm Flow 4-6*). Ambient chime cues are synthesized in real-time using the native HTML5 Web Audio API—no external audio files or downloads required.
- **Empathetic Companion:** A reflective chat space focused on gentle active listening, emotional validation, and grounding support with multi-model fallback and built-in crisis lifeline resources (988 Lifeline, Crisis Text Line).
- **Privacy-First Storage:** All personal mood logs, journal entries, and reflection histories remain stored locally on your device via a local-first repository layer.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend & API:** Node.js, Express, TypeScript (`tsx`)
- **Audio Synthesis:** Native HTML5 Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
- **Persistence:** Local-first storage repository pattern (`localStorage`)
- **Build Tooling:** Vite 6, esbuild

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/serenity-mental-health-tracker.git
   cd serenity-mental-health-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```
   *(Get an API key from [Google AI Studio](https://aistudio.google.com/))*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## Available Scripts

- `npm run dev` — Starts the development server on port 3000 with hot reload.
- `npm run build` — Compiles the React frontend via Vite and bundles the Express backend via esbuild into `dist/`.
- `npm run start` — Runs the production server from `dist/server.cjs`.
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

## Project Structure

```text
├── index.html               # Main HTML entry point
├── package.json             # Scripts & dependencies
├── server.ts                # Express backend server & companion chat proxy
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── src/
    ├── main.tsx             # React application root entry point
    ├── App.tsx              # Main dashboard shell & layout orchestration
    ├── index.css            # Global CSS & Tailwind styling
    ├── types.ts             # Shared TypeScript models & interfaces
    ├── components/
    │   ├── WeeklyRhythmCard.tsx   # 7-day mood history & streak visualization
    │   ├── MoodLoggerModal.tsx    # Multi-metric mood & energy logging modal
    │   ├── GratitudeSection.tsx   # Categorized gratitude journal & prompt generator
    │   ├── BreathingExercise.tsx  # Interactive breath timer & visual pacer
    │   └── CompanionChat.tsx      # Empathetic conversational companion interface
    └── utils/
        ├── audio.ts         # Native Web Audio API chime synthesis
        └── storage.ts       # Local-first repository pattern & initial seed data
```

---

## License

MIT License — Feel free to use and modify for personal or educational projects.
