
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import DocumentUploadForm from '../components/DocumentUploadForm';
import DocumentList from '../components/DocumentList';
import * as documentService from '../services/documentService';

jest.mock('../services/documentService');

const mockDocs = [
  { id: 1, documentTitle: 'Doc One', category: 'Cat A', uploadDate: '2025-08-01' },
  { id: 2, documentTitle: 'Doc Two', category: 'Cat B', uploadDate: '2025-08-02' }
];

describe('Digital Document Vault - Easy Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  test('React_BuildUIComponents_renders app title', () => {
    documentService.getDocuments.mockResolvedValue({ data: [] });
    render(<App />);
    expect(screen.getByText(/Digital Document Vault System/i)).toBeInTheDocument();
  });

  
  test('React_APIIntegration_TestingAndAPIDocumentation_fetches and displays documents', async () => {
    documentService.getDocuments.mockResolvedValueOnce({ data: mockDocs });
    render(<App />);
    expect(await screen.findByText('Doc One')).toBeInTheDocument();
    expect(screen.getByText('Doc Two')).toBeInTheDocument();
  });

  
  test('React_APIIntegration_TestingAndAPIDocumentation_shows empty table if no documents', async () => {
    documentService.getDocuments.mockResolvedValueOnce({ data: [] });
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Doc One')).not.toBeInTheDocument();
    });
  });

  
  test('React_UITestingAndResponsivenessFixes_handles fetch error gracefully', async () => {
    documentService.getDocuments.mockRejectedValueOnce(new Error('Error fetching'));
    render(<App />);
    expect(await screen.findByText(/Digital Document Vault System/i)).toBeInTheDocument();
  });

  
  test('React_BuildUIComponents_renders upload form inputs', () => {
    render(<DocumentUploadForm onUpload={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Document Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument();
  });

  
  test('React_APIIntegration_TestingAndAPIDocumentation_handles delete API error', async () => {
    documentService.deleteDocument.mockRejectedValueOnce(new Error('Delete error'));
    render(<DocumentList documents={mockDocs} onDelete={jest.fn()} />);
    fireEvent.click(screen.getAllByText(/Delete/i)[0]);
    await waitFor(() => expect(documentService.deleteDocument).toHaveBeenCalled());
  });

  
  test('React_APIIntegration_TestingAndAPIDocumentation_calls download API on download', async () => {
    documentService.downloadDocument.mockResolvedValueOnce({ data: new Blob(['content']) });
    render(<DocumentList documents={mockDocs} onDelete={jest.fn()} />);
    fireEvent.click(screen.getAllByText(/Download/i)[0]);
    await waitFor(() => expect(documentService.downloadDocument).toHaveBeenCalledWith(1));
  });

  
  test('React_APIIntegration_TestingAndAPIDocumentation_handles download API error', async () => {
    documentService.downloadDocument.mockRejectedValueOnce(new Error('Download error'));
    render(<DocumentList documents={mockDocs} onDelete={jest.fn()} />);
    fireEvent.click(screen.getAllByText(/Download/i)[0]);
    await waitFor(() => expect(documentService.downloadDocument).toHaveBeenCalled());
  });

  
  test('React_BuildUIComponents_displays correct category for documents', () => {
    render(<DocumentList documents={mockDocs} onDelete={jest.fn()} />);
    expect(screen.getByText('Cat A')).toBeInTheDocument();
    expect(screen.getByText('Cat B')).toBeInTheDocument();
  });

  
  test('React_BuildUIComponents_displays correct upload date for documents', () => {
    render(<DocumentList documents={mockDocs} onDelete={jest.fn()} />);
    expect(screen.getByText('2025-08-01')).toBeInTheDocument();
    expect(screen.getByText('2025-08-02')).toBeInTheDocument();
  });
});
