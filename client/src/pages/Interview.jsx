import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { jsPDF } from "jspdf"
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
  const [questionScores, setQuestionScores] = useState(
    Array(questions.length).fill(null)
  )
  const [history, setHistory] = useState(
    questions.map((question) => ({
      question,
      answer: "",
      feedback: "",
      score: null,
    }))
  )

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
        body: JSON.stringify({
          answer: answer,
        }),
      })

      const data = await response.json()
      const parsedScore =
        typeof data.score === "number" && !Number.isNaN(data.score)
          ? data.score
          : null

      setFeedback(data.feedback)
      setScore(parsedScore !== null ? `${parsedScore}/10` : "")
      setQuestionScores((prevScores) => {
        const nextScores = [...prevScores]
        nextScores[currentQuestion] = parsedScore
        return nextScores
      })
      setHistory((prevHistory) => {
        const nextHistory = [...prevHistory]
        nextHistory[currentQuestion] = {
          question: questions[currentQuestion],
          answer: answer.trim(),
          feedback: data.feedback,
          score: parsedScore,
        }
        return nextHistory
      })
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

    setCurrentQuestion((prev) => prev + 1)
    setFeedback("")
    setScore("")
    setAnswer("")
  }

  const resetInterview = () => {
    navigate("/")
  }

  const totalScore = questionScores.reduce(
    (sum, item) => sum + (typeof item === "number" ? item : 0),
    0
  )

  const downloadPdfReport = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" })
    const margin = 40
    const maxLineWidth = 520
    let y = 60

    doc.setFontSize(20)
    doc.text(`Interview Report - ${role.toUpperCase()}`, margin, y)
    y += 30

    doc.setFontSize(12)
    doc.text(`Total Score: ${totalScore} / ${questions.length * 10}`, margin, y)
    y += 18
    doc.text(`Average Score: ${averageScore}`, margin, y)
    y += 28

    history.forEach((entry, index) => {
      const questionLabel = `Question ${index + 1}: ${entry.question}`
      const answerLabel = `Your Answer: ${entry.answer || "No answer provided"}`
      const feedbackLabel = `AI Feedback: ${entry.feedback || "No feedback"}`
      const scoreLabel = `Score: ${typeof entry.score === "number" ? `${entry.score} / 10` : "Not scored"}`

      const textLines = doc.splitTextToSize(questionLabel, maxLineWidth)
      if (y + textLines.length * 14 > 750) {
        doc.addPage()
        y = margin
      }
      doc.setFontSize(12)
      doc.text(textLines, margin, y)
      y += textLines.length * 14 + 6

      const answerLines = doc.splitTextToSize(answerLabel, maxLineWidth)
      if (y + answerLines.length * 14 > 750) {
        doc.addPage()
        y = margin
      }
      doc.text(answerLines, margin, y)
      y += answerLines.length * 14 + 6

      const feedbackLines = doc.splitTextToSize(feedbackLabel, maxLineWidth)
      if (y + feedbackLines.length * 14 > 750) {
        doc.addPage()
        y = margin
      }
      doc.text(feedbackLines, margin, y)
      y += feedbackLines.length * 14 + 6

      if (y + 18 > 750) {
        doc.addPage()
        y = margin
      }
      doc.text(scoreLabel, margin, y)
      y += 24

      if (index < history.length - 1) {
        if (y + 12 > 750) {
          doc.addPage()
          y = margin
        }
        doc.setDrawColor(200)
        doc.setLineWidth(0.5)
        doc.line(margin, y, margin + maxLineWidth, y)
        y += 18
      }
    })

    doc.save(`Interview_Report_${role}.pdf`)
  }
  const averageScore = questions.length
    ? (totalScore / questions.length).toFixed(1)
    : "0.0"

  if (completed) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-4xl shadow-2xl">
          <h1 className="text-5xl font-bold mb-4 text-center">
            Interview Completed 🎉
          </h1>

          <p className="text-zinc-400 mb-8 text-center">
            Review your performance summary and use it to improve for next time.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div className="bg-zinc-800 p-6 rounded-3xl">
              <p className="text-sm uppercase text-zinc-400 mb-2">
                Total Score
              </p>
              <p className="text-4xl font-bold text-blue-400">
                {totalScore} / {questions.length * 10}
              </p>
            </div>

            <div className="bg-zinc-800 p-6 rounded-3xl">
              <p className="text-sm uppercase text-zinc-400 mb-2">
                Average Score
              </p>
              <p className="text-4xl font-bold text-green-400">
                {averageScore}
              </p>
            </div>
          </div>

          <div className="bg-zinc-800 p-6 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-4">
              Question Score Breakdown
            </h2>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900"
                >
                  <p className="font-medium">Question {index + 1}</p>
                  <p className="text-sm text-zinc-400">{question}</p>
                  <p className="text-lg font-semibold">
                    Score:{" "}
                    {typeof questionScores[index] === "number"
                      ? `${questionScores[index]} / 10`
                      : "Not scored"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800 p-6 rounded-3xl mt-8">
            <h2 className="text-2xl font-semibold mb-4">Interview History</h2>
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 p-4 rounded-2xl"
                >
                  <p className="font-medium mb-2">Question {index + 1}</p>
                  <p className="text-sm text-zinc-400 mb-2">
                    {entry.question}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Your answer:</span>{" "}
                    {entry.answer || "No answer provided"}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">AI feedback:</span>{" "}
                    {entry.feedback || "No feedback"}
                  </p>
                  <p className="font-semibold">
                    Score: {typeof entry.score === "number" ? `${entry.score} / 10` : "Not scored"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadPdfReport}
              className="bg-emerald-500 px-6 py-3 rounded-xl hover:bg-emerald-600 transition"
            >
              Download PDF Report
            </button>

            <button
              onClick={resetInterview}
              className="bg-blue-500 px-6 py-3 rounded-xl hover:bg-blue-600 transition"
            >
              Start Again
            </button>
          </div>
        </div>
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

        <p className="mb-4 text-lg font-medium">{questions[currentQuestion]}</p>

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
            <h2 className="text-xl font-semibold mb-2">AI Feedback</h2>
            <p>{feedback}</p>
          </div>
        )}

        {score && (
          <div className="mt-4 bg-blue-600 p-3 rounded-xl">
            <h2 className="text-lg font-semibold">Score: {score}</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default Interview