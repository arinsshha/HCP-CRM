from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HCP CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an AI assistant for a pharmaceutical CRM system that helps log interactions with Healthcare Professionals (HCPs).

Your task is to extract structured information from natural language descriptions of HCP interactions.

Always respond with a valid JSON object containing these fields:
- doctor_name: Full name of the doctor (string or null)
- hospital: Hospital or clinic name (string or null)
- specialty: Medical specialty if mentioned (string or null)
- date: Date of interaction in YYYY-MM-DD format (string or null). If "yesterday" use yesterday's date, "today" use today's date, etc.
- location: City or location if mentioned (string or null)
- products_discussed: List of products/medicines discussed (array of strings, empty array if none)
- sentiment: Overall sentiment of the interaction - one of: "positive", "neutral", "negative" (string)
- interest_level: Doctor's interest level - one of: "high", "medium", "low", "not_specified" (string)
- follow_up_required: Whether a follow-up is needed (boolean)
- follow_up_date: Suggested follow-up date if mentioned (string or null)
- summary: A concise 1-2 sentence summary of the interaction (string)
- key_concerns: Any concerns or objections raised by the doctor (array of strings, empty if none)
- ai_message: A helpful, conversational response acknowledging what was logged and suggesting any follow-up actions (string)

Today's date is: """ + __import__('datetime').date.today().isoformat() + """

Extract information carefully. If something is not mentioned, use null or empty arrays. Always return valid JSON only, no other text."""


class ChatMessage(BaseModel):
    message: str
    conversation_history: List[dict] = []


class InteractionData(BaseModel):
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    specialty: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    products_discussed: Optional[list] = []
    sentiment: Optional[str] = None
    interest_level: Optional[str] = None
    follow_up_required: Optional[bool] = False
    follow_up_date: Optional[str] = None
    summary: Optional[str] = None
    key_concerns: Optional[list] = []
    ai_message: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "HCP CRM API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/extract", response_model=InteractionData)
async def extract_interaction(chat: ChatMessage):
    """Extract structured HCP interaction data from natural language input."""
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history for context
        for msg in chat.conversation_history[-6:]:  # Keep last 6 messages for context
            messages.append(msg)

        messages.append({"role": "user", "content": chat.message})

        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.1,
                max_tokens=1000,
            )
            response_text = completion.choices[0].message.content.strip()
        except Exception as api_error:
            raise HTTPException(
                status_code=500,
                detail=f"Groq API error: {str(api_error)}"
            )

        # Clean up response - remove markdown code blocks if present
        response_text = re.sub(r'^```(?:json)?\s*\n?', '', response_text)
        response_text = re.sub(r'\n?```$', '', response_text)
        response_text = response_text.strip()

        extracted_data = json.loads(response_text)
        return InteractionData(**extracted_data)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse AI response as JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )


@app.post("/api/chat")
async def chat_endpoint(chat: ChatMessage):
    """General chat endpoint for follow-up questions and edits."""
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in chat.conversation_history[-10:]:
            messages.append(msg)

        messages.append({"role": "user", "content": chat.message})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.1,
            max_tokens=1000,
        )

        response_text = completion.choices[0].message.content.strip()
        response_text = re.sub(r'^```(?:json)?\s*\n?', '', response_text)
        response_text = re.sub(r'\n?```$', '', response_text)
        response_text = response_text.strip()

        extracted_data = json.loads(response_text)
        return InteractionData(**extracted_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
