import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Sparkles, Youtube, BookOpen, Brain, FileText, FolderOpen, ArrowLeft } from 'lucide-react';
import './index.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

export default function StudentAIPlatform() {
  const [notes, setNotes] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [goal, setGoal] = useState('');
  const [folders, setFolders] = useState({});
  const [selectedFolder, setSelectedFolder] = useState('');
  const [uploadedPages, setUploadedPages] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState('');

  const handleExplainClick = async () => {
    console.log("🧠 Button clicked"); // Add this for debug
  
    if (!selectedText.trim()) {
      alert("Please enter or highlight a concept.");
      return;
    }
  
    try {
      const response = await fetch("https://ai-student-platform.onrender.com/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: selectedText,
          goal: goal,
        }),
      });
  
      const data = await response.json();
      console.log("✅ Backend response:", data);
  
      if (data.explanation) {
        setNotes(data.explanation);
      } else {
        alert("⚠️ Could not get an explanation from the assistant.");
      }
    } catch (err) {
      console.error("❌ Error fetching from backend:", err);
      alert("❌ Failed to connect to AI assistant.");
    }
  };

  const handleCreateFolder = () => {
    const folderName = newFolderName.trim();
    if (!folderName) return alert("Folder name cannot be empty.");
    if (!folders[folderName]) {
      const updated = { ...folders, [folderName]: [] };
      setFolders(updated);
      setSelectedFolder(folderName);
      setUploadedPages([]);
      setNewFolderName('');
      alert(`📁 Folder '${folderName}' created and selected.`);
    } else {
      alert("📂 Folder already exists. Please select it from the list.");
    }
  };

  const handleSelectFolder = (folderName) => {
    setSelectedFolder(folderName);
    setUploadedPages(folders[folderName]);
  };

  const handlePageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFolder) {
      const updated = { ...folders };
      updated[selectedFolder] = [...updated[selectedFolder], ...files];
      setFolders(updated);
      setUploadedPages(updated[selectedFolder]);
    }
  };

  const handlePageClick = (file) => {
    try {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfError('');
    } catch (error) {
      console.error(error);
      setPdfUrl(null);
      setPdfError("❌ Failed to load PDF. Please try a different file.");
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError('');
  };

  const handleBackClick = () => {
    setPdfUrl(null);
    setNumPages(null);
    setPdfError('');
  };

  return (
    <div className="p-6 md:p-10 max-w-full mx-auto space-y-10 bg-gradient-to-br from-yellow-200 via-rose-100 to-pink-100 rounded-3xl shadow-2xl min-h-screen">
      <h1 className="text-5xl font-extrabold text-center text-pink-600 drop-shadow-lg animate-pulse">🌈 AI-Powered Learning Playground</h1>

      <div className="bg-white bg-opacity-80 shadow-lg p-6 rounded-2xl border border-pink-300">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="🎯 Your goal (e.g. Crack JEE, Become a Data Scientist)"
          className="w-full p-3 border border-pink-300 rounded text-base bg-pink-50 mb-4"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="📝 Paste or write your notes here..."
          className="w-full p-4 h-32 border border-yellow-300 rounded text-base bg-yellow-50 mb-4"
        />

        <input
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)}
          placeholder="🔍 Highlight and paste the part you want explained..."
          className="w-full p-3 border border-blue-300 rounded text-base bg-blue-50 mb-4"
        />

        <button onClick={handleExplainClick} className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold rounded-lg text-lg hover:from-pink-600 hover:to-fuchsia-600">
          <Sparkles className="inline-block w-5 h-5 mr-2 -mt-1" /> Simplify & Explain
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 bg-white bg-opacity-90 p-6 rounded-xl shadow-xl border border-green-300">
        <div className="w-full lg:w-1/4">
          <div className="flex flex-col gap-2">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="📁 Folder name (e.g. Class 10 Science)"
              className="bg-green-50 border border-green-400 p-2 rounded"
            />
            <button onClick={handleCreateFolder} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              ➕ Create Folder
            </button>

            {Object.keys(folders).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-green-700 mb-2">📚 Your Folders:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(folders).map((folderName, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectFolder(folderName)}
                      className={`text-sm px-4 py-1 rounded border ${selectedFolder === folderName ? 'bg-green-400 text-white' : 'border-green-400 text-green-600'}`}
                    >
                      {folderName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedFolder && (
              <div className="mt-6">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  multiple
                  onChange={handlePageUpload}
                  className="w-full mb-4"
                />
                <p className="text-green-600 font-semibold mb-2">📄 Uploaded Files:</p>
                <ul className="space-y-2">
                  {uploadedPages.map((file, index) => (
                    <li
                      key={index}
                      onClick={() => handlePageClick(file)}
                      className="bg-green-100 p-2 rounded-lg cursor-pointer hover:bg-green-200 text-sm shadow-sm"
                    >
                      📄 {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          {pdfError && <p className="text-red-600 font-semibold mt-2">{pdfError}</p>}
          {pdfUrl && !pdfError && (
            <div className="bg-white p-4 rounded-lg shadow-inner max-h-[500px] overflow-auto">
              <button onClick={handleBackClick} className="mb-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <Document file={pdfUrl} onLoadSuccess={handleDocumentLoadSuccess} onLoadError={(err) => setPdfError("❌ Failed to load PDF file.")}>
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={600}
                    onClick={() => setNotes(`📖 You clicked on page ${index + 1}. Explanation will appear here...`)}
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
