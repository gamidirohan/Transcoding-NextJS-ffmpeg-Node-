// app/video-list/page.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get('http://localhost:5000/videos');
        setVideos(response.data.videos);
      } catch (error) {
        console.error(error);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div>
      <h1>Available Videos</h1>
      <ul>
        {videos.map((video, index) => (
          <li key={index}>
            <video controls src={`http://localhost:5000/videos/${video}`} width="600" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoList;
