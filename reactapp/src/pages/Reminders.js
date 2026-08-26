import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import * as reminderService from '../services/reminderService';
import * as documentService from '../services/documentService';

const Reminders = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedDocId, setSelectedDocId] = useState('');
  const [message, setMessage] = useState('');
  const [remindDays, setRemindDays] = useState('7');
  const [customDate, setCustomDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [remRes, docRes] = await Promise.all([
        reminderService.getRemindersByUser(currentUser.userId),
        documentService.getDocuments({ ownerId: currentUser.userId }),
      ]);
      setReminders(remRes.data || []);
      const docList = docRes.data?.content || (Array.isArray(docRes.data) ? docRes.data : []);
      setDocuments(docList);
    } catch (e) {
      toastError('Could not load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toastError('Please enter a reminder description');
      return;
    }

    let targetDateStr;
    if (customDate) {
      targetDateStr = new Date(customDate).toISOString();
    } else {
      const d = new Date();
      d.setDate(d.getDate() + Number(remindDays));
      targetDateStr = d.toISOString();
    }

    setCreating(true);
    try {
      await reminderService.createReminder(
        currentUser.userId,
        selectedDocId ? Number(selectedDocId) : null,
        message.trim(),
        targetDateStr
      );
      success('Reminder scheduled successfully');
      setMessage('');
      setSelectedDocId('');
      setCustomDate('');
      loadData();
    } catch (err) {
      toastError('Failed to create reminder');
    } finally {
      setCreating(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await reminderService.dismissReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      success('Reminder dismissed');
    } catch (err) {
      toastError('Failed to dismiss reminder');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ⏰ Document Reminders & Expirations
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Set proactive expiration warnings for Passports, Insurance, Contracts, and Certificates
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Active Reminders List */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Active Reminders ({reminders.length})
          </h3>

          {loading ? (
            <Loader text="Loading reminders..." />
          ) : reminders.length === 0 ? (
            <EmptyState
              icon="⏰"
              title="No active reminders"
              description="Schedule a reminder on the right to receive timely expiration warnings."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: '4px solid #fbbf24',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {rem.message}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due Date:{' '}
                      <strong>
                        {rem.reminderDate ? new Date(rem.reminderDate).toLocaleDateString() : 'Upcoming'}
                      </strong>
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleDismiss(rem.id)}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Form */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Schedule New Reminder
          </h3>

          <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Select Document (Optional)
              </label>
              <select
                className="form-input"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">(No specific document)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    📄 {d.documentTitle || d.originalFileName || d.fileName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Reminder Note / Subject <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Passport renewal required, Insurance expires"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Reminder Horizon
              </label>
              <select
                className="form-input"
                value={remindDays}
                onChange={(e) => setRemindDays(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="7">7 Days Ahead</option>
                <option value="15">15 Days Ahead</option>
                <option value="30">30 Days Ahead</option>
                <option value="60">60 Days Ahead</option>
                <option value="90">90 Days Ahead</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Or Custom Expiration Date
              </label>
              <input
                type="date"
                className="form-input"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={creating}
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            >
              Save Reminder Schedule
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
