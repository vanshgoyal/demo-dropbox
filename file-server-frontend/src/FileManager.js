import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axios';

export default function FileManager() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/');
    } else {
      fetchFiles();
    }
    // eslint-disable-next-line
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`/files?userId=${userId}`);
      setFiles(res.data);
    } catch (err) {
      // handle error
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    try {
      await axios.post('/upload', formData);
      setFile(null);
      fetchFiles();
    } catch (err) {
      // handle error
    }
  };

  const viewFile = async (id) => {
    try {
      const res = await axios.get(`/view/${id}?userId=${userId}`, {
        responseType: 'arraybuffer',
      });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      // handle error
    }
  };

  const downloadFile = async (id, fileName) => {
    try {
      const res = await axios.get(`/download/${id}?userId=${userId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'file';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // handle error
    }
  };

  const deleteFile = async (id) => {
    try {
      await axios.delete(`/delete/${id}?userId=${userId}`);
      fetchFiles();
    } catch (err) {
      // handle error
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Files</h2>
        <button onClick={logout} className="text-red-500">Logout</button>
      </div>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="block"
      />
      <button
        onClick={uploadFile}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>

      <ul className="divide-y border rounded p-4">
        {files.map((f) => (
          <li key={f.id} className="flex justify-between py-2">
            <span>{f.originalFileName}</span>
            <div className="space-x-2">
              <button onClick={() => viewFile(f.id)} className="text-blue-600">View</button>
              <button onClick={() => downloadFile(f.id, f.originalFileName)} className="text-green-600">Download</button>
              <button onClick={() => deleteFile(f.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}