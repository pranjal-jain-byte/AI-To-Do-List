# Chronos AI — Intelligent Collaborative To-Do Application

Chronos AI is an AI-enhanced productivity platform designed for both individuals and teams. It is built on a serverless architecture using Next.js, Firebase, and Google GenAI (via Genkit). The application supports real-time task management, collaborative teams, intelligent note processing, and natural-language task creation.

---

## Key Features

### Authentication
- Email/password authentication via Firebase.
- Protected routes and session handling.

### Task Management
- Create, view, update, and delete tasks.
- Categorized task views (Upcoming, Completed).
- AI-assisted task creation and daily prioritization.

### Team Collaboration
- Create teams/projects with descriptions.
- Invite members using a shareable link.
- Real-time updates to team members and team tasks.
- Option for any member to leave a team.

### Intelligent Notes
- Rich-text note editor.
- AI-powered summarization.
- Automatic task extraction from note content.

### AI Capabilities
- Task prioritization using Genkit flows.
- Natural language to structured task parsing.
- Speech-to-text based task creation.

### User Experience
- Responsive interface with Next.js and shadcn/ui.
- Real-time UI updates without page reload.
- User profile editing and account deletion.

---

## Technology Stack

**Frontend:** Next.js 15, React 18, TypeScript  
**Styling:** Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons  
**Backend:** Firebase Authentication, Firestore, Firebase Hosting  
**AI:** Genkit, @genkit-ai/google-genai (Gemini)  
**Utilities:** React Hook Form, Zod, date-fns  

---

## System Architecture

### Architecture Details
- Client-driven UI with Firestore real-time listeners.
- AI workflows handled through Next.js Server Actions.
- No traditional backend or Cloud Functions.

---

## Database Structure

### `/users/{userId}`
```json
{ "id": "...", "name": "...", "email": "...", "createdAt": "...", "summary": {} }


