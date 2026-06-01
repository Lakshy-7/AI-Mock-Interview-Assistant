import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { interviewQuestions } from "./questions"

function Interview() {
  const location = useLocation()
  const navigate = useNavigate()

  const role = location.state?.role || "frontend"
  const questions = interviewQuestions[role]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async () => {
    if (answer.trim() === "") {
      setFeedback("Please enter an answer before submitting.")
      setScore("")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      setFeedback(data.feedback)
      setScore(data.score)
    } catch (error) {
      setFeedback("Backend connection failed.")
      setScore("")
    }

    setLoading(false)
  }

  const handleNextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setCompleted(true)
      return
    }

    setCurrentQuestion(currentQuestion + 1)
    setFeedback("")
    setScore("")
    setAnswer("")
  }

  const resetInterview = () => {
    navigate("/")
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl font-bold mb-4">
          Interview Completed 🎉
        </h1>

        <p className="text-zinc-400 mb-6">
          Great work! Keep practicing to improve your interview skills.
        </p>

        <button
          onClick={resetInterview}
          className="bg-blue-500 px-6 py-3 rounded-xl hover:bg-blue-600 transition"
        >
          Start Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        {role.toUpperCase()} Interview
      </h1>

      <div className="bg-zinc-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="w-full bg-zinc-700 rounded-full h-3 mb-6">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="mb-4 text-sm text-zinc-400">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <p className="mb-4 text-lg font-medium">
          {questions[currentQuestion]}
        </p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full h-36 p-3 rounded-lg text-black outline-none resize-none"
          placeholder="Type your answer..."
        />

        <div className="flex gap-4 mt-4 flex-wrap">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 px-5 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Submit Answer
          </button>

          <button
            onClick={handleNextQuestion}
            className="bg-green-500 px-5 py-2 rounded-xl hover:bg-green-600 transition"
          >
            Next Question
          </button>
        </div>

        {loading && (
          <div className="mt-6 text-blue-400 font-semibold animate-pulse">
            AI is analyzing your answer...
          </div>
        )}

        {feedback && (
          <div className="mt-6 bg-zinc-700 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">
              AI Feedback
            </h2>
            <p>{feedback}</p>
          </div>
        )}

        {score && (
          <div className="mt-4 bg-blue-600 p-3 rounded-xl">
            <h2 className="text-lg font-semibold">
              Score: {score}
            </h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default Interview