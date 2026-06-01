from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Mock Interview Backend Running"}

@app.post("/feedback")
def get_feedback():
    return {
        "feedback": "Great answer! Try adding more technical examples.",
        "score": "8/10"
    }