import React, { useEffect } from 'react';
import Folder from '../common/Folder';
import './FolderTransition.css';

const FolderTransition = ({ onComplete, duration = 1450 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <div className="folder-transition">
      <div className="folder-transition-content">
        <Folder size={2.15} color="#8FE3CF" autoOpen items={[<div className="folder-paper-content" key="documents">DOCUMENTS</div>, <div className="folder-paper-content" key="secure">SECURE</div>, <div className="folder-paper-content" key="vault">VAULT</div>]} />
        <div className="folder-transition-title">Opening Vault</div>
        <div className="folder-transition-subtitle">Preparing your folders...</div>
        <div className="folder-transition-loader"><span /></div>
      </div>
    </div>
  );
};

export default FolderTransition;