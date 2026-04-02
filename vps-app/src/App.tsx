import { HashRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { PublishingOverview } from './pages/PublishingOverview'
import { DailyWork } from './pages/DailyWork'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0A0F1E]">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublishingOverview />} />
          <Route path="/daily-work" element={<DailyWork />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
