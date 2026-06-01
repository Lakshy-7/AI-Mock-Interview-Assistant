import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { useState } from "react"
import Interview from "./pages/Interview"

function Home() {
  const [role, setRole] = useState("frontend")
  const navigate = useNavigate()

  const startInterview = () => {
    navigate("/interview", { state: { role } })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-6 text-center">
        AI Mock Interview Assistant
      </h1>

      <p className="text-zinc-400 mb-6 text-center">
        Practice technical interviews with AI-powered feedback
      </p>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="bg-white text-black px-4 py-3 rounded-lg mb-4 w-[300px]"
      >
        <option value="frontend">Frontend Developer</option>
        <option value="python">Python Developer</option>
        <option value="java">Java Developer</option>
      </select>

      <button
        onClick={startInterview}
        className="bg-blue-500 px-6 py-3 rounded-xl hover:bg-blue-600 transition"
      >
        Start Interview
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App