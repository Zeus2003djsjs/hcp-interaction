# Log HCP Interaction

An AI-powered web application for logging Health Care Professional (HCP) interactions via a natural language chat interface. 

The application utilizes a split-screen layout. On the right, an AI assistant built with **LangGraph** and **FastAPI** processes the user's natural language descriptions of their HCP meetings. On the left, a beautiful **React (Vite)** frontend instantly populates a read-only form based on the AI's intelligent entity extraction and tool-calling.

## Features
- **Natural Language Parsing**: Just tell the AI what happened, and it fills the form automatically.
- **Smart Corrections**: Correct the AI naturally ("Sorry, I meant Dr. House, not Dr. Smith") and it will selectively edit fields without wiping out existing data.
- **Compliance Checking**: Automatically warns you if you attempt to log distributing more samples than allowed.
- **Follow-up Scheduling**: Mentions of future dates or follow-ups are extracted and logged in the "Follow-up Actions" field.
- **Premium UI**: Built with glassmorphism aesthetics, subtle micro-animations, and a sleek dark mode.

## Architecture
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: Python, FastAPI, Uvicorn, LangGraph, Langchain, Pydantic.
- **LLM**: Groq (`llama-3.3-70b-versatile` recommended for optimal tool-calling performance).

---

## Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- A **Groq API Key**

---

## Setup Instructions

### 1. Backend Setup (FastAPI & LangGraph)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install fastapi "uvicorn[standard]" langgraph langchain-groq python-dotenv pydantic
   ```
4. Configure the environment variables:
   - Open the `backend/.env` file.
   - Insert your Groq API Key:
     ```env
     GROQ_API_KEY="your_groq_api_key_here"
     ```

### 2. Frontend Setup (React & Vite)
1. Navigate to the project root directory (if you are in `backend`, go up one level):
   ```bash
   cd ..
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

Because this project utilizes a separate frontend and backend, you will need to run **two terminal windows**.

### Terminal 1: Start the Python Backend
```bash
cd backend
# Make sure your virtual environment is activated
uvicorn main:app --reload
```
*The backend will run on `http://localhost:8000`.*

### Terminal 2: Start the React Frontend
```bash
# In the root project directory (hcp-interaction)
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## Usage
1. Open your browser and navigate to `http://localhost:5173`.
2. In the AI Assistant chat panel on the right, type a description of your meeting.
   - *Example:* "I met with Dr. Jane Smith today at 2pm. We discussed the efficiency of Product X. I gave her 3 samples. She seemed very positive about it."
3. Watch the form on the left populate instantly as the AI processes your interaction!
