import { useState, useCallback } from 'react'
import ChatSidebar from './components/ChatSidebar'
import LogForm from './components/LogForm'
import './App.css'

const initialFormData = {
  hcp_name: '',
  interaction_type: 'Meeting',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  attendees: '',
  topics_discussed: '',
  materials_shared: [],
  samples_distributed: [],
  sentiment: '',
  interest_level: '',
  follow_up_required: false,
  follow_up_date: '',
  follow_up_notes: '',
  summary: '',
  key_concerns: [],
  products_discussed: [],
}

export default function App() {
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleDataExtracted = useCallback((data) => {
    const { ai_message, ...fields } = data
    setFormData(prev => {
      const updated = { ...prev }
      if (fields.doctor_name) updated.hcp_name = fields.doctor_name
      if (fields.date) updated.date = fields.date
      if (fields.summary) updated.topics_discussed = fields.summary
      if (fields.sentiment) updated.sentiment = fields.sentiment
      if (fields.interest_level) updated.interest_level = fields.interest_level
      if (fields.follow_up_required !== undefined) updated.follow_up_required = fields.follow_up_required
      if (fields.follow_up_date) updated.follow_up_date = fields.follow_up_date
      if (fields.products_discussed?.length) updated.products_discussed = fields.products_discussed
      if (fields.key_concerns?.length) updated.key_concerns = fields.key_concerns
      if (fields.hospital) updated.attendees = fields.hospital
      return updated
    })
    return ai_message
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setFormData(initialFormData)
    setSavedSuccess(false)
  }, [])

  const handleSave = useCallback(() => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }, [])

  return (
    <div className="app-shell">
      <main className="app-main">
        <LogForm
          data={formData}
          onChange={handleFormChange}
          onReset={handleReset}
          onSave={handleSave}
          savedSuccess={savedSuccess}
          isLoading={isLoading}
        />
        <ChatSidebar
          onDataExtracted={handleDataExtracted}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          formData={formData}
        />
      </main>
    </div>
  )
}
