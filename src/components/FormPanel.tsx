import React from 'react';
import type { InteractionState } from '../types';
import { FileText, Calendar, Clock, Users, Pill, Stethoscope, ChevronDown } from 'lucide-react';

interface FormPanelProps {
  state: InteractionState;
}

export const FormPanel: React.FC<FormPanelProps> = ({ state }) => {
  return (
    <div className="left-panel">
      <div className="glass-panel" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
          <Stethoscope className="text-accent" />
          Log HCP Interaction
        </h2>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="form-label">HCP Name</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="input-glass" 
              value={state.hcpName} 
              disabled 
              placeholder="e.g. Dr. Jane Smith" 
            />
            <ChevronDown style={{ position: 'absolute', right: '1rem', top: '0.8rem', color: 'var(--text-secondary)' }} size={16} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }} className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div>
            <label className="form-label">Date</label>
            <div style={{ position: 'relative' }}>
              <input type="text" className="input-glass" value={state.date} disabled placeholder="YYYY-MM-DD" />
              <Calendar style={{ position: 'absolute', right: '1rem', top: '0.8rem', color: 'var(--text-secondary)' }} size={16} />
            </div>
          </div>
          <div>
            <label className="form-label">Time</label>
            <div style={{ position: 'relative' }}>
              <input type="text" className="input-glass" value={state.time} disabled placeholder="HH:MM" />
              <Clock style={{ position: 'absolute', right: '1rem', top: '0.8rem', color: 'var(--text-secondary)' }} size={16} />
            </div>
          </div>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <label className="form-label">Interaction Type</label>
          <input type="text" className="input-glass" value={state.interactionType} disabled />
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <label className="form-label">Attendees</label>
          <div style={{ position: 'relative' }}>
            <input type="text" className="input-glass" value={state.attendees} disabled placeholder="Other attendees..." />
            <Users style={{ position: 'absolute', right: '1rem', top: '0.8rem', color: 'var(--text-secondary)' }} size={16} />
          </div>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <label className="form-label">Topics Discussed</label>
          <textarea 
            className="input-glass" 
            value={state.topicsDiscussed} 
            disabled 
            rows={3}
            placeholder="Main discussion points..."
          ></textarea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }} className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', width: '100%' }}>
            Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <label className="form-label">Materials Shared</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '40px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            {state.materialsShared.length > 0 ? (
              state.materialsShared.map((material, idx) => (
                <span key={idx} className="badge">
                  <FileText size={12} style={{ marginRight: '0.25rem' }} /> {material}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No materials shared...</span>
            )}
          </div>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <label className="form-label">Samples Distributed</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '40px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
             {state.samplesDistributed.length > 0 ? (
              state.samplesDistributed.map((sample, idx) => (
                <span key={idx} className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <Pill size={12} style={{ marginRight: '0.25rem' }} /> {sample}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No samples distributed...</span>
            )}
          </div>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <label className="form-label">Observed/Inferred HCP Sentiment</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" checked={state.sentiment === 'Positive'} disabled /> Positive
            </label>
            <label className="radio-label">
              <input type="radio" checked={state.sentiment === 'Neutral'} disabled /> Neutral
            </label>
            <label className="radio-label">
              <input type="radio" checked={state.sentiment === 'Negative'} disabled /> Negative
            </label>
          </div>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '1.0s' }}>
          <label className="form-label">Outcomes</label>
          <textarea className="input-glass" value={state.outcomes} disabled rows={2} placeholder="Key outcomes..."></textarea>
        </div>

        <div className="form-group animate-fade-in" style={{ animationDelay: '1.1s' }}>
          <label className="form-label">Follow-up Actions</label>
          <textarea className="input-glass" value={state.followUpActions} disabled rows={2} placeholder="Any follow-up tasks..."></textarea>
        </div>

      </div>
    </div>
  );
};
