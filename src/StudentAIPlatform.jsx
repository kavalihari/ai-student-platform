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
        alert("⚠️ Could not get an explanat
