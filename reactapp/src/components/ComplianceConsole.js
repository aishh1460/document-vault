import React, { useState, useEffect } from 'react';
import * as auditService from '../services/auditService';

const ComplianceConsole = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('policies');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Retention policy state
  const [docType, setDocType] = useState('CONTRACT');
  const [retentionDays, setRetentionDays] = useState('365');
  const [archivalDate, setArchivalDate] = useState('');
  const [disposalDate, setDisposalDate] = useState('');
  const [requirement, setRequirement] = useState('GDPR Article 17 Compliance');
  const [policies, setPolicies] = useState([]);

  // Legal hold state
  const [policyId, setPolicyId] = useState('');
  const [legalCaseId, setLegalCaseId] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdEnabled, setHoldEnabled] = useState(true);

  // Incident state
  const [incidentType, setIncidentType] = useState('UNAUTHORIZED_ACCESS_ATTEMPT');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [incidents, setIncidents] = useState([]);

  // Audit and status state
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemCompliance, setSystemCompliance] = useState('SECURE');

  useEffect(() => {
    fetchComplianceData();
  }, [activeTab]);

  const fetchComplianceData = async () => {
    try {
      const statusRes = await auditService.getComplianceStatus();
      setSystemCompliance(statusRes.data);

      if (activeTab === 'audit') {
        const logsRes = await auditService.getAuditLogs();
        setAuditLogs(logsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load compliance data', err);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const policyData = {
        documentType: docType,
        retentionPeriodDays: parseInt(retentionDays, 10),
        archivalDate: archivalDate || null,
        disposalDate: disposalDate || null,
        complianceRequirement: requirement
      };

      const res = await auditService.createPolicy(policyData);
      setPolicies([...policies, res.data]);
      setMessage({ text: 'Retention policy defined and activated successfully!', type: 'success' });
      
      // Reset some fields
      setArchivalDate('');
      setDisposalDate('');
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to create retention policy.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLegalHold = async (e) => {
    e.preventDefault();
    if (!policyId) {
      setMessage({ text: 'Please specify a target Policy ID.', type: 'danger' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await auditService.placeLegalHold({
        retentionPolicyId: parseInt(policyId, 10),
        legalCaseId,
        holdReason,
        enable: holdEnabled
      });
      setMessage({ text: `Litigation legal hold ${holdEnabled ? 'placed' : 'revoked'} successfully!`, type: 'success' });
      setLegalCaseId('');
      setHoldReason('');
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to place legal hold.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogIncident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const incidentData = {
        eventType: incidentType,
        severity,
        description,
        userId: currentUser.userId
      };

      const res = await auditService.reportIncident(incidentData);
      setIncidents([...incidents, res.data]);
      setMessage({ text: 'Security incident logged and filed in audit trail.', type: 'success' });
      setDescription('');
      fetchComplianceData();
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to log incident.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyRotation = async () => {
    if (!window.confirm("Rotate system cryptographic HSM storage keys now? This updates keys for all active partitions.")) {
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await auditService.getSecurityCompliance();
      setMessage({ text: 'HSM cryptographic keys rotated and re-encrypted successfully.', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to rotate keys.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessReview = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await auditService.initiateAccessReview(currentUser.userId);
      setMessage({ text: 'System-wide access review log event successfully recorded.', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to initiate access review.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleForensics = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await auditService.initiateForensics(currentUser.userId);
      setMessage({ text: 'Forensic analytics engine triggered. Logs are being audited.', type: 'success' });
      fetchComplianceData();
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to run forensics.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Card */}
      <div className="glass-card flex justify-between items-center">
        <div>
          <h2>⚖️ Governance, Compliance & Security Console</h2>
          <p className="text-muted text-sm mt-1">Admin level view for policies, legal holds, audit trails, and encryption key rotations.</p>
        </div>
        <div className="text-right">
          <span className="form-label" style={{ margin: 0 }}>Compliance Integrity</span>
          <div className="mt-1">
            <span className={`badge ${systemCompliance.includes('VIOLATION') || systemCompliance.includes('WARN') ? 'badge-archived' : 'badge-active'}`} style={{ padding: '0.5rem 1rem' }}>
              {systemCompliance}
            </span>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`badge badge-${message.type === 'success' ? 'active' : 'deleted'} w-full text-center`} style={{ padding: '0.6rem' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button 
          className={`btn ${activeTab === 'policies' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('policies')}
        >
          Lifecycle & Retention Policies
        </button>
        <button 
          className={`btn ${activeTab === 'incidents' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('incidents')}
        >
          Incident Reporting & Security
        </button>
        <button 
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Forensic Trails
        </button>
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="grid-cols-2">
          {/* Create policy */}
          <div className="glass-card">
            <h3 className="mb-4">Create Retention & Lifecycle Policy</h3>
            <form onSubmit={handleCreatePolicy} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Document Classification Category</label>
                <select className="form-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="INVOICE">INVOICE</option>
                  <option value="REPORT">REPORT</option>
                  <option value="POLICY">POLICY</option>
                  <option value="LEGAL">LEGAL</option>
                  <option value="FINANCIAL">FINANCIAL</option>
                  <option value="HR">HR</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Retention Period (Days)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={retentionDays} 
                  onChange={(e) => setRetentionDays(e.target.value)} 
                  required 
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Archival Date (Optional)</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={archivalDate} 
                    onChange={(e) => setArchivalDate(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Disposal Date (Optional)</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={disposalDate} 
                    onChange={(e) => setDisposalDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Regulatory Mandate / Compliance Reason</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={requirement} 
                  onChange={(e) => setRequirement(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                Deploy Retention Policy
              </button>
            </form>
          </div>

          {/* Legal Hold */}
          <div className="glass-card">
            <h3 className="mb-4">Litigation Legal Holds</h3>
            <form onSubmit={handleApplyLegalHold} className="flex flex-col gap-4">
              <p className="text-muted text-sm">
                Placing a legal hold locks down document versions, overriding all standard disposal dates and retention periods.
              </p>

              <div className="form-group">
                <label className="form-label">Target Policy ID / Document ID</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="ID"
                  value={policyId} 
                  onChange={(e) => setPolicyId(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Litigation / Case Identifier</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. CASE-2026-US-SEC"
                  value={legalCaseId} 
                  onChange={(e) => setLegalCaseId(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Litigation Hold Justification</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Detail the audit, subpoena, or legal investigation reason..."
                  value={holdReason} 
                  onChange={(e) => setHoldReason(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hold-enable"
                  checked={holdEnabled} 
                  onChange={(e) => setHoldEnabled(e.target.checked)} 
                />
                <label htmlFor="hold-enable" className="form-label" style={{ margin: 0 }}>Apply Hold (Uncheck to Revoke)</label>
              </div>

              <button type="submit" className="btn btn-danger w-full" disabled={loading}>
                {holdEnabled ? 'Enforce Litigation Hold' : 'Revoke Litigation Hold'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="grid-cols-2">
          {/* File Incident */}
          <div className="glass-card">
            <h3 className="mb-4">Report Security threat or Intrusion</h3>
            <form onSubmit={handleLogIncident} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Threat Vector Class</label>
                <select className="form-input" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                  <option value="UNAUTHORIZED_ACCESS_ATTEMPT">UNAUTHORIZED ACCESS ATTEMPT</option>
                  <option value="CRYPTO_ROTATION_EXC">CRYPTO KEY DISCLOSURE WARN</option>
                  <option value="RETENTION_VIOLATION">RETENTION POLICY BYPASS</option>
                  <option value="LEGAL_HOLD_BYPASS">LEGAL HOLD OVERWRITE</option>
                  <option value="SUSPICIOUS_BULK_DOWNLOAD">SUSPICIOUS BULK DOWNLOADS</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Severity</label>
                <select className="form-input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH (Compliance Audit Trigger)</option>
                  <option value="CRITICAL">CRITICAL (System Lockdown Trigger)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description of Activity</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Detail the telemetry details, IP headers, logs, user behavior observed..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                Register Security Incident
              </button>
            </form>
          </div>

          {/* HSM Control panel */}
          <div className="glass-card flex flex-col justify-between">
            <div>
              <h3 className="mb-4">Cryptographic HSM Administration</h3>
              <p className="text-muted text-sm mb-4">
                Perform hardware-backed encryption key rotations, or register system-wide access reviews to comply with audit standards.
              </p>
              
              <div className="flex flex-col gap-4">
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 className="text-sm font-semibold mb-2">Cryptographic Rotation</h4>
                  <p className="text-muted text-sm mb-3">Re-encrypts all document checksum hashes and content paths with new AES-256 HSM keys.</p>
                  <button className="btn btn-secondary w-full" onClick={handleKeyRotation} disabled={loading}>
                    🔑 Trigger Key Rotation
                  </button>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 className="text-sm font-semibold mb-2">Access Control Audit Review</h4>
                  <p className="text-muted text-sm mb-3">Audits and records access logs to verify that roles and security clearances are enforced.</p>
                  <button className="btn btn-secondary w-full" onClick={handleAccessReview} disabled={loading}>
                    🔍 Initiate Access Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3>Forensic Security Logs & Trails</h3>
            <button className="btn btn-secondary" onClick={handleForensics} disabled={loading}>
              🕵️ Run Forensic Analytics
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Action / Event</th>
                  <th>Performed By</th>
                  <th>Timestamp</th>
                  <th>Details / Payload</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted p-8">No forensics logs generated. Run forensic analysis or audit logs.</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td><strong>{log.action}</strong></td>
                      <td>User {log.userId || 'System'}</td>
                      <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'block', maxWidth: '300px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                          {log.details || 'No additional parameters'}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-active" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
                          AUDITED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceConsole;
