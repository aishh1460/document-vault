import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import * as reminderService from '../services/reminderService';
import * as documentService from '../services/documentService';
import './Reminders.css';

const Reminders = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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
        documentService.getDocuments({
          ownerId: currentUser.userId,
        }),
      ]);

      const reminderList = Array.isArray(remRes.data)
        ? remRes.data
        : remRes.data?.content || [];

      const docList = Array.isArray(docRes.data)
        ? docRes.data
        : docRes.data?.content || [];

      setReminders(reminderList);
      setDocuments(docList);
    } catch (error) {
      console.error('Reminder loading error:', error);
      toastError('Could not load reminders');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentName = (reminder) => {
    if (
      reminder.documentName &&
      reminder.documentName !== 'string'
    ) {
      return reminder.documentName;
    }

    if (!reminder.documentId) {
      return null;
    }

    const document = documents.find(
      (doc) =>
        Number(doc.id) === Number(reminder.documentId)
    );

    if (!document) {
      return null;
    }

    return (
      document.documentTitle ||
      document.originalFileName ||
      document.fileName ||
      `Document #${document.id}`
    );
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toastError('Please enter a reminder description');
      return;
    }

    let targetDateStr;

    if (customDate) {
      const selectedDate = new Date(
        `${customDate}T00:00:00`
      );

      targetDateStr = selectedDate.toISOString();
    } else {
      const date = new Date();

      date.setDate(
        date.getDate() + Number(remindDays)
      );

      targetDateStr = date.toISOString();
    }

    setCreating(true);

    try {
      await reminderService.createReminder(
        currentUser.userId,
        selectedDocId
          ? Number(selectedDocId)
          : null,
        message.trim(),
        targetDateStr
      );

      success('Reminder scheduled successfully');

      setMessage('');
      setSelectedDocId('');
      setCustomDate('');

      await loadData();
    } catch (error) {
      console.error(
        'Create reminder error:',
        error
      );

      toastError(
        error.response?.data?.message ||
        'Failed to create reminder'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await reminderService.dismissReminder(id);

      setReminders((previous) =>
        previous.filter(
          (reminder) =>
            reminder.id !== id
        )
      );

      success('Reminder dismissed');
    } catch (error) {
      console.error(
        'Dismiss reminder error:',
        error
      );

      toastError(
        'Failed to dismiss reminder'
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Upcoming';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Upcoming';
    }

    return parsedDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const getDaysRemaining = (date) => {
    if (!date) {
      return null;
    }

    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const difference =
      target.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="reminders-page">

      <div className="reminders-header">

        <div>
          <div className="reminders-eyebrow">
            MONITOR
          </div>

          <h2 className="reminders-title">
            Document Reminders & Expirations
          </h2>

          <p className="reminders-subtitle">
            Stay ahead of important expiration dates
            and never miss a renewal.
          </p>
        </div>

        <div className="reminders-count">
          {reminders.length}
        </div>

      </div>

      <div className="reminders-layout">

        <section className="active-reminders-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                MONITOR
              </span>

              <h3>
                Active Reminders
              </h3>
            </div>

          </div>

          {loading ? (

            <Loader text="Loading reminders..." />

          ) : reminders.length === 0 ? (

            <EmptyState
              icon="⏰"
              title="No active reminders"
              description="Schedule a reminder to receive timely expiration warnings."
            />

          ) : (

            <div className="reminders-list">

              {reminders.map((reminder) => {

                const documentName =
                  getDocumentName(reminder);

                const daysRemaining =
                  getDaysRemaining(
                    reminder.reminderDate
                  );

                return (

                  <div
                    key={reminder.id}
                    className="reminder-card"
                  >

                    <div className="reminder-icon">
                      ⏰
                    </div>

                    <div className="reminder-info">

                      <div className="reminder-message">
                        {reminder.description ||
                          reminder.message ||
                          'Reminder'}
                      </div>

                      {documentName && (

                        <div className="reminder-document">

                          <span className="document-icon">
                            📄
                          </span>

                          <span>
                            {documentName}
                          </span>

                        </div>

                      )}

                      <div className="reminder-meta">

                        <span>
                          Due{' '}
                          {formatDate(
                            reminder.reminderDate
                          )}
                        </span>

                        {daysRemaining !== null && (

                          <span
                            className={
                              daysRemaining <= 0
                                ? 'days-danger'
                                : daysRemaining <= 7
                                ? 'days-warning'
                                : 'days-normal'
                            }
                          >
                            {daysRemaining < 0
                              ? `${Math.abs(
                                  daysRemaining
                                )} days overdue`
                              : daysRemaining === 0
                              ? 'Due today'
                              : daysRemaining === 1
                              ? '1 day remaining'
                              : `${daysRemaining} days remaining`}
                          </span>

                        )}

                      </div>

                    </div>

                    <button
                      className="reminder-dismiss"
                      onClick={() =>
                        handleDismiss(
                          reminder.id
                        )
                      }
                    >
                      Dismiss
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </section>

        <section className="schedule-card">

          <div className="schedule-card-header">

            <div className="schedule-icon">
              ⏰
            </div>

            <div>

              <span className="section-eyebrow">
                SCHEDULE
              </span>

              <h3>
                New Reminder
              </h3>

            </div>

          </div>

          <form
            className="reminder-form"
            onSubmit={handleCreateReminder}
          >

            <div className="form-group">

              <label className="form-label">
                Select Document

                <span className="optional">
                  Optional
                </span>
              </label>

              <select
                className="form-input"
                value={selectedDocId}
                onChange={(e) =>
                  setSelectedDocId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  No specific document
                </option>

                {documents.map((document) => (

                  <option
                    key={document.id}
                    value={document.id}
                  >
                    {document.documentTitle ||
                      document.originalFileName ||
                      document.fileName ||
                      `Document #${document.id}`}
                  </option>

                ))}

              </select>

            </div>

            <div className="form-group">

              <label className="form-label">

                Reminder Note / Subject

                <span className="required">
                  *
                </span>

              </label>

              <input
                type="text"
                className="form-input"
                placeholder="e.g. Passport renewal required"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label className="form-label">
                Reminder Horizon
              </label>

              <select
                className="form-input"
                value={remindDays}
                onChange={(e) =>
                  setRemindDays(
                    e.target.value
                  )
                }
              >

                <option value="7">
                  7 Days Ahead
                </option>

                <option value="15">
                  15 Days Ahead
                </option>

                <option value="30">
                  30 Days Ahead
                </option>

                <option value="60">
                  60 Days Ahead
                </option>

                <option value="90">
                  90 Days Ahead
                </option>

              </select>

            </div>

            <div className="form-group">

              <label className="form-label">
                Custom Expiration Date
              </label>

              <div className="calendar-input-wrapper">

                <input
                  type="date"
                  className="form-input calendar-input"
                  value={customDate}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={(e) =>
                    setCustomDate(
                      e.target.value
                    )
                  }
                />

                <span
                  className="calendar-icon"
                  onClick={(e) => {

                    const input =
                      e.currentTarget
                        .previousElementSibling;

                    if (input?.showPicker) {
                      input.showPicker();
                    } else {
                      input?.focus();
                    }

                  }}
                >
                  📅
                </span>

              </div>

              {customDate && (

                <div className="selected-date-preview">

                  <span>
                    Selected expiration:
                  </span>

                  <strong>
                    {formatDate(
                      `${customDate}T00:00:00`
                    )}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setCustomDate('')
                    }
                  >
                    Clear
                  </button>

                </div>

              )}

            </div>

            <Button
              type="submit"
              variant="primary"
              loading={creating}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '6px',
              }}
            >
              Save Reminder Schedule
            </Button>

          </form>

        </section>

      </div>

    </div>
  );
};

export default Reminders;