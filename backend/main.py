from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerRequest(BaseModel):
    answer: str

@app.get("/")
def home():
    return {"message": "AI Mock Interview Backend Running"}

@app.post("/feedback")
def get_feedback(data: AnswerRequest):

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical interviewer. Give short interview feedback and a score out of 10."
                },
                {
                    "role": "user",
                    "content": data.answer
                }
            ]
        )

        feedback_text = response.choices[0].message.content

        return {
            "feedback": feedback_text,
            "score": 8
        }

    except Exception as e:
        return {
            "feedback": f"ERROR: {str(e)}",
            "score": 0
        }