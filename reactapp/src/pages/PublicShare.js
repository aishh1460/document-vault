import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import * as shareService from '../services/shareService';

const PublicShare = ({ token: tokenProp, onExit }) => {
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const token = tokenProp || tokenParam;

  const handleExit = () => {
    if (onExit) onExit();
    else navigate('/dashboard');
  };
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (token) {
      loadShareDetails();
    }
  }, [token]);

  const loadShareDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shareService.getShareByToken(token);
      setShareInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired share link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await shareService.downloadSharedDocument(token);
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', shareInfo?.documentTitle || 'shared-document');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed or limit reached');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <Loader text="Verifying cryptographic share token..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '4rem auto', width: '90%' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '18px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
          {error ? '⚠️' : '🔐'}
        </div>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
          {error ? 'Access Restricted' : 'Secure Shared Document'}
        </h2>

        {error ? (
          <div>
            <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>
            <Button variant="secondary" onClick={handleExit}>
              Back to Vault
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Document Title</div>
              <h3 style={{ margin: '4px 0 10px 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                {shareInfo?.documentTitle}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Permission: <strong>{shareInfo?.permissions}</strong></span>
                <span>
                  Expires: {shareInfo?.expiryDate ? new Date(shareInfo.expiryDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleDownload}
              loading={downloading}
              style={{ width: '100%', padding: '12px' }}
            >
              📥 Download Decrypted Document
            </Button>

            <Button variant="secondary" onClick={handleExit} style={{ width: '100%' }}>
              Go to Vault Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicShare;
