import { useState } from 'react'
import { Search, Plus, Mic, ChevronDown, Check, RotateCcw, Save } from 'lucide-react'
import './LogForm.css'

const INTERACTION_TYPES = ['Meeting', 'Call', 'Email', 'Conference', 'Virtual Meeting', 'Site Visit']
const SENTIMENT_OPTIONS = ['Positive', 'Neutral', 'Negative']
const INTEREST_OPTIONS = ['High', 'Medium', 'Low', 'Not Specified']

export default function LogForm({ data, onChange, onReset, onSave, savedSuccess, isLoading }) {
  const [materialsInput, setMaterialsInput] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const handleAddMaterial = () => {
    if (!materialsInput.trim()) return
    onChange('materials_shared', [...(data.materials_shared || []), materialsInput.trim()])
    setMaterialsInput('')
  }

  const handleRemoveMaterial = (idx) => {
    onChange('materials_shared', data.materials_shared.filter((_, i) => i !== idx))
  }

  return (
    <div className="log-form-wrapper">
      <div className="log-form-scroll">
        {/* Page title */}
        <div className="form-page-header">
          <h1 className="form-page-title">Log HCP Interaction</h1>
          <div className="form-header-actions">
            <button className="btn-secondary" onClick={onReset}>
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              className={`btn-primary ${savedSuccess ? 'btn-success' : ''}`}
              onClick={onSave}
            >
              {savedSuccess ? <Check size={14} /> : <Save size={14} />}
              {savedSuccess ? 'Saved!' : 'Log Interaction'}
            </button>
          </div>
        </div>

        {/* Section: Interaction Details */}
        <div className="form-card">
          <div className="form-section-label">Interaction Details</div>

          {/* HCP Name + Interaction Type */}
          <div className="form-row two-col">
            <div className="form-field">
              <label className="field-label">HCP Name</label>
              <div className="input-with-icon">
                <Search size={15} className="input-icon" />
                <input
                  type="text"
                  className={`form-input ${isLoading ? 'input-loading' : ''}`}
                  placeholder="Search or select HCP..."
                  value={data.hcp_name}
                  onChange={e => onChange('hcp_name', e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Interaction Type</label>
              <div className="custom-select-wrapper">
                <button
                  className="custom-select"
                  onClick={() => setShowTypeDropdown(v => !v)}
                  type="button"
                >
                  <span>{data.interaction_type}</span>
                  <ChevronDown size={15} className={`select-chevron ${showTypeDropdown ? 'open' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="dropdown-menu fade-in">
                    {INTERACTION_TYPES.map(t => (
                      <button
                        key={t}
                        className={`dropdown-item ${data.interaction_type === t ? 'active' : ''}`}
                        onClick={() => { onChange('interaction_type', t); setShowTypeDropdown(false) }}
                      >
                        {data.interaction_type === t && <Check size={13} />}
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date + Time */}
          <div className="form-row two-col">
            <div className="form-field">
              <label className="field-label">Date</label>
              <input
                type="date"
                className={`form-input ${isLoading ? 'input-loading' : ''}`}
                value={data.date}
                onChange={e => onChange('date', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={data.time}
                onChange={e => onChange('time', e.target.value)}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Attendees</label>
              <div className="input-with-icon">
                <Search size={15} className="input-icon" />
                <input
                  type="text"
                  className={`form-input ${isLoading ? 'input-loading' : ''}`}
                  placeholder="Enter names or search..."
                  value={data.attendees}
                  onChange={e => onChange('attendees', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Topics Discussed */}
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Topics Discussed</label>
              <textarea
                className={`form-textarea ${isLoading ? 'input-loading' : ''}`}
                placeholder="Enter key discussion points..."
                value={data.topics_discussed}
                onChange={e => onChange('topics_discussed', e.target.value)}
                rows={4}
              />
              <button className="voice-note-btn">
                <Mic size={13} />
                Summarize from Voice Note (Requires Consent)
              </button>
            </div>
          </div>
        </div>

        {/* Section: Materials Shared / Samples */}
        <div className="form-card">
          <div className="form-section-label">Materials Shared / Samples Distributed</div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Materials Shared</label>

              {data.materials_shared?.length === 0 && (
                <p className="empty-list-text">No materials added.</p>
              )}

              {data.materials_shared?.map((m, i) => (
                <div key={i} className="material-tag slide-up">
                  <span>{m}</span>
                  <button onClick={() => handleRemoveMaterial(i)} className="tag-remove">×</button>
                </div>
              ))}

              <div className="add-material-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add material name..."
                  value={materialsInput}
                  onChange={e => setMaterialsInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
                />
                <button className="btn-search-add" onClick={handleAddMaterial}>
                  <Search size={13} />
                  Search/Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: AI Analysis */}
        <div className="form-card">
          <div className="form-section-label">AI Analysis</div>

          <div className="form-row two-col">
            <div className="form-field">
              <label className="field-label">Sentiment</label>
              <div className="radio-group">
                {SENTIMENT_OPTIONS.map(s => (
                  <label key={s} className={`radio-pill ${data.sentiment === s.toLowerCase() ? 'selected-' + s.toLowerCase() : ''}`}>
                    <input
                      type="radio"
                      name="sentiment"
                      value={s.toLowerCase()}
                      checked={data.sentiment === s.toLowerCase()}
                      onChange={() => onChange('sentiment', s.toLowerCase())}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Interest Level</label>
              <div className="radio-group">
                {INTEREST_OPTIONS.map(level => (
                  <label
                    key={level}
                    className={`radio-pill ${data.interest_level === level.toLowerCase().replace(' ', '_') ? 'selected-interest' : ''}`}
                  >
                    <input
                      type="radio"
                      name="interest_level"
                      value={level.toLowerCase().replace(' ', '_')}
                      checked={data.interest_level === level.toLowerCase().replace(' ', '_')}
                      onChange={() => onChange('interest_level', level.toLowerCase().replace(' ', '_'))}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products discussed - auto-filled tags */}
          {data.products_discussed?.length > 0 && (
            <div className="form-row">
              <div className="form-field">
                <label className="field-label">Products Discussed</label>
                <div className="tags-row">
                  {data.products_discussed.map((p, i) => (
                    <span key={i} className="product-chip slide-up">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key concerns */}
          {data.key_concerns?.length > 0 && (
            <div className="form-row">
              <div className="form-field">
                <label className="field-label">Key Concerns / Objections</label>
                <div className="concerns-list">
                  {data.key_concerns.map((c, i) => (
                    <div key={i} className="concern-row slide-up">
                      <span className="concern-bullet" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Follow-up */}
        <div className="form-card">
          <div className="form-section-label">Follow-up</div>

          <div className="form-row">
            <div className="form-field">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={data.follow_up_required}
                  onChange={e => onChange('follow_up_required', e.target.checked)}
                />
                <span className="field-label" style={{ margin: 0 }}>Follow-up Required</span>
              </label>
            </div>
          </div>

          {data.follow_up_required && (
            <div className="form-row two-col slide-up">
              <div className="form-field">
                <label className="field-label">Follow-up Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={data.follow_up_date}
                  onChange={e => onChange('follow_up_date', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">Follow-up Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add follow-up notes..."
                  value={data.follow_up_notes}
                  onChange={e => onChange('follow_up_notes', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
