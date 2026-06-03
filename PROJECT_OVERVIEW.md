# Project Overview: AI Interview Simulator

This project is a high-end, interactive web application designed to simulate technical and behavioral interview environments. It leverages Artificial Intelligence to generate personalized questions based on a user's resume, evaluate answers in real-time, and provide constructive feedback.

## 🚀 Tech Stack

### Frontend

- **Framework:** [Next.js](https://nextjs.org/) (React) with TypeScript.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a modern, "Bento Grid" inspired UI.
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI) for accessible, high-quality components like Cards, Buttons, and Modals.
- **State Management & Data Fetching:** [tRPC](https://trpc.io/) for type-safe API communication between the client and server.
- **Code Editor:** [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) to provide a VS Code-like coding experience.
- **Voice Interaction:** Web Speech API (`SpeechRecognition`) for real-time voice-to-text transcription.

### Backend & Infrastructure

- **Database & Auth:** Supabase for user profiles, session persistence, and interview history.
- **AI Orchestration:** LangChain and OpenAI (specifically GPT-4o/o3 models) for question generation, chat coaching, and answer evaluation.
- **API Layer:** tRPC routers handling complex mutations like `evaluateAnswer` and `generateQuestions`.

## 🎯 Key Features

1.  **Personalized Setup:** Users can upload their resumes to provide context, allowing the AI to tailor questions to their specific experience levels and tech stack.
2.  **Multimodal Inputs:** Support for both text-based answers and voice-recorded responses to simulate real-world communication.
3.  **Real-time AI Evaluation:** Immediate scoring (out of 10) for each answer, along with detailed feedback on what was good and specific points for improvement.
4.  **Bento-style Interview Room:** A sleek 3-column layout that manages the question panel, answer area, and an AI chat assistant for coaching.
5.  **Timed Sessions:** A built-in countdown timer with urgent-state animations to help candidates manage their time under pressure.

## 🏁 Goals to Achieve

- **Realistic Simulation:** Create an environment that effectively mimics the pressure and technical requirements of a real big-tech interview.
- **Actionable Insights:** Move beyond simple "correct/incorrect" results by providing deep semantic analysis of the candidate's responses.
- **Type Safety:** Ensure a robust developer experience using end-to-end type safety from the database (Supabase) to the API (tRPC) to the UI (TypeScript).
- **Accessibility:** Support different interview types (System Design, Technical, Behavioral) and difficulty levels to cater to a wide range of career stages.

---
