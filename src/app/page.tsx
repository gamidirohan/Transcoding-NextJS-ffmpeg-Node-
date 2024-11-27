"use client"; // This enables client-side features in the component

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const Home: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true, // Prevent default click behavior
  });

  const handleFormatChange = (format: string, checked: boolean) => {
    setFormats((prev) =>
      checked ? [...prev, format] : prev.filter((f) => f !== format)
    );
  };

  const handleFileRemove = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please upload a folder containing videos.");
      return;
    }
    if (formats.length === 0) {
      alert("Please select at least one output format.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("videos", file);
    });

    formData.append("formats", JSON.stringify(formats));

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            progressEvent.total
              ? (progressEvent.loaded * 100) / progressEvent.total
              : 0
          );
          setUploadProgress(percentCompleted);
        },
      });
      setStatusMessage(response.data.message);

      const intervalId = setInterval(async () => {
        const progressRes = await axios.get("http://localhost:5000/progress");
        setTranscodeProgress(progressRes.data.progress);
        if (progressRes.data.progress === 100) {
          clearInterval(intervalId);
          setStatusMessage("Transcoding completed!");
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      alert("An error occurred during the upload.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.header}>Video Transcoder</h1>

        <div {...getRootProps()} style={styles.dropzone}>
          <input
            {...getInputProps()}
            directory="true"
            webkitdirectory="true"
            mozdirectory="true"
          />
          <p style={styles.dropzoneText}>
            Drag and drop files here, or use the "Add More Files" button.
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.subHeader}>Selected Files:</h3>
          <div style={styles.fileList}>
            {files.map((file) => (
              <div key={file.name} style={styles.fileCard}>
                <span style={styles.fileName}>{file.name}</span>
                <button
                  style={styles.removeButton}
                  onClick={() => handleFileRemove(file.name)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            style={styles.addFilesButton}
            onClick={() => document.querySelector("input")?.click()}
          >
            Add More Files
          </Button>
        </div>

        <div style={styles.section}>
          <h3 style={styles.subHeader}>Select Output Formats:</h3>
          <div style={styles.formatOptions}>
            {["1080p", "720p", "480p", "360p"].map((format) => (
              <label key={format} style={styles.checkboxLabel}>
                <Checkbox
                  onCheckedChange={(checked) =>
                    handleFormatChange(format, checked)
                  }
                />{" "}
                {format}
              </label>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleUpload}
          style={styles.uploadButton}
        >
          Transcode
        </Button>

        <div style={styles.progressContainer}>
          <h3 style={styles.progressText}>
            Upload Progress: {uploadProgress}%
          </h3>
          <h3 style={styles.progressText}>
            Transcoding Progress: {transcodeProgress}%
          </h3>
          <h3 style={styles.statusMessage}>{statusMessage}</h3>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#121212",
  },
  container: {
    maxWidth: "650px",
    margin: "auto",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
    color: "#f5f5f5",
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.7)",
    textAlign: "center",
  },
  dropzone: {
    border: "2px dashed #76c7c0",
    padding: "25px",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#333333",
    transition: "background-color 0.3s ease",
  },
  dropzoneText: {
    color: "#76c7c0",
    fontWeight: "500",
    fontSize: "16px",
  },
  section: {
    marginTop: "30px",
  },
  subHeader: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: "15px",
  },
  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  fileCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2e2e2e",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
  },
  fileName: {
    color: "#ffffff",
    fontSize: "14px",
    wordBreak: "break-all",
  },
  removeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ff5c5c",
    fontSize: "16px",
    cursor: "pointer",
  },
  addFilesButton: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#76c7c0",
  },
  formatOptions: {
    display: "flex",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px 0",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    backgroundColor: "#333333",
    padding: "8px",
    borderRadius: "4px",
    color: "#76c7c0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    cursor: "pointer",
  },
  uploadButton: {
    marginTop: "30px",
    width: "100%",
    padding: "12px",
    fontSize: "18px",
    fontWeight: "600",
    backgroundColor: "#76c7c0",
    color: "#1e1e1e",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  progressContainer: {
    marginTop: "30px",
  },
  progressText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#f5f5f5",
    marginTop: "10px",
  },
  statusMessage: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#4caf50",
    marginTop: "15px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
  },
};

export default Home;
