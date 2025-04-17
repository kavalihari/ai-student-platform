import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Sparkles, Youtube, BookOpen, Brain, FileText, ArrowLeft, FolderOpen } from 'lucide-react';
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
    if (!selectedText.trim()) {
      alert("Please enter or highlight a concept.");
      return;
    }

    try {
      const response = await fetch("https://ai-student-platform.onrender.com/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, goal })
      });

      const data = await response.json();
      if (data.explanation) {
        setNotes(`🧠 Explanation:\n${data.explanation}\n\n🎥 YouTube Shorts: [Link1](#) [Link2](#)\n📘 Research Papers: [Paper1](#) [Paper2](#)\n🧪 Quiz Questions: Q1, Q2...\n📄 PYQs: 2018, 2019...`);
      } else {
        alert("⚠️ Could not get an explanation from the assistant.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error contacting the AI assistant.");
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
          placeholder="📝 Explanation + Resources will appear here..."
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

      <div className="bg-white p-6 rounded-xl shadow-lg border border-green-300">
        <div className="mb-4 flex gap-2">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="📁 Folder name (e.g. Class 10 Science)"
            className="w-full p-3 rounded border border-green-400 bg-green-50"
          />
          <button onClick={handleCreateFolder} className="bg-green-500 text-white px-6 py-2 rounded font-semibold hover:bg-green-600">
            ➕ Create Folder
          </button>
        </div>

        {Object.keys(folders).length > 0 && (
          <div className="mb-4">
            <p className="text-green-700 font-semibold mb-2 flex items-center gap-1">📚 Your Folders:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(folders).map((folder, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectFolder(folder)}
                  className={`text-sm px-4 py-1 rounded font-semibold ${selectedFolder === folder ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                >
                  📂 {folder}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedFolder && (
          <div>
            <input
              type="file"
              accept=".pdf,.txt"
              multiple
              onChange={handlePageUpload}
              className="mb-4"
            />
            <p className="text-green-700 font-semibold mb-2">📄 Uploaded Files:</p>
            <ul className="space-y-2">
              {uploadedPages.map((file, index) => (
                <li key={index} onClick={() => handlePageClick(file)} className="bg-green-100 text-green-800 p-2 rounded-lg cursor-pointer hover:bg-green-200 text-sm shadow-sm">
                  📄 {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {pdfUrl && (
        <div className="bg-white p-4 rounded-xl shadow-xl mt-6">
          <button onClick={handleBackClick} className="text-blue-600 font-semibold flex items-center mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <Document file={pdfUrl} onLoadSuccess={handleDocumentLoadSuccess} onLoadError={() => setPdfError("❌ Failed to load PDF")}>
            {Array.from(new Array(numPages), (el, i) => (
              <Page key={`page_${i + 1}`} pageNumber={i + 1} width={600} />
            ))}
          </Document>
        </div>
      )}

      <div className="mt-10 bg-white bg-opacity-80 shadow-xl rounded-2xl border border-purple-200">
        <div className="flex justify-around border-b border-pink-200 text-lg font-semibold text-pink-800 py-2 bg-pink-50 rounded-t-2xl">
          <button className="flex gap-1 items-center cursor-pointer">
            <Youtube className="w-4 h-4" /> Videos
          </button>
          <button className="flex gap-1 items-center cursor-pointer">
            <BookOpen className="w-4 h-4" /> Research
          </button>
          <button className="flex gap-1 items-center cursor-pointer">
            <Brain className="w-4 h-4" /> Quiz
          </button>
          <button className="flex gap-1 items-center cursor-pointer">
            <FileText className="w-4 h-4" /> PYQs
          </button>
        </div>
        <div className="p-6 text-center text-pink-700 font-medium text-lg space-y-3">
          <div>🎥 <span className="text-pink-600 font-semibold">Curated YouTube videos will appear here.</span></div>
          <div>📘 <span className="text-purple-600 font-semibold">Research papers will be listed based on your topic.</span></div>
          <div>🧠 <span className="text-blue-600 font-semibold">Quiz questions generated from your content.</span></div>
          <div>📄 <span className="text-green-600 font-semibold">Previous year questions (PYQs) relevant to your goal.</span></div>
        </div>
      </div>
    </div>
  );
}
