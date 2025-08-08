import React, { useState, useEffect } from 'react';

// Real API client for backend integration
const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  post: async (url, data, options = {}) => {
    console.log(`API POST to ${API_BASE_URL}${url}:`, data);
    
    try {
      const response = await fetch(API_BASE_URL + url, {
        method: 'POST',
        headers: {
          'Content-Type': options.headers?.['Content-Type'] || 'application/json',
          ...options.headers
        },
        body: data instanceof FormData ? data : JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      console.error('API Error:', error);
      if (error.message.includes('Failed to fetch')) {
        const connectionError = new Error('ECONNREFUSED: Connection refused');
        connectionError.code = 'ECONNREFUSED';
        throw connectionError;
      }
      throw error;
    }
  },
  
  get: async (url) => {
    console.log(`API GET to ${API_BASE_URL}${url}`);
    
    try {
      const response = await fetch(API_BASE_URL + url);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      // For file download/view endpoints, return as blob
      if (url.includes('/view/') || url.includes('/download/')) {
        const blob = await response.blob();
        return { data: blob };
      }
      
      // For regular JSON responses
      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      console.error('API Error:', error);
      if (error.message.includes('Failed to fetch')) {
        const connectionError = new Error('ECONNREFUSED: Connection refused');
        connectionError.code = 'ECONNREFUSED';
        throw connectionError;
      }
      throw error;
    }
  },
  
  delete: async (url) => {
    console.log(`API DELETE to ${API_BASE_URL}${url}`);
    
    try {
      const response = await fetch(API_BASE_URL + url, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      // Handle both JSON and text responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        return { data: responseData };
      } else {
        const responseText = await response.text();
        return { data: { success: true, message: responseText } };
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.message.includes('Failed to fetch')) {
        const connectionError = new Error('ECONNREFUSED: Connection refused');
        connectionError.code = 'ECONNREFUSED';
        throw connectionError;
      }
      throw error;
    }
  }
};

// Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);
    
    // If name is provided, this is a new user registration
    if (name.trim()) {
      try {
        console.log('Creating new user:', email);
        const createRes = await api.post('/users', {
          name: name.trim(),
          email: email.trim(),
          password
        });
        
        console.log('Create user response:', createRes.data);
        const userId = createRes.data.id;
        
        if (userId) {
          onLogin(userId);
        } else {
          setError('Failed to create user: No user ID received');
        }
      } catch (createError) {
        console.error('Create user error:', createError);
        if (createError.message.includes('HTTP 409') || createError.message.includes('already exists')) {
          setError('User already exists with this email. Try logging in without filling the name field.');
        } else {
          setError('Failed to create user: ' + createError.message);
        }
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // If no name provided, this is an existing user login
    try {
      console.log('Attempting to authenticate existing user:', email);
      const response = await api.post('/users/authenticate', {
        email: email.trim(),
        password
      });
      
      console.log('Auth response:', response.data);
      const userId = response.data.userId;
      
      if (userId) {
        onLogin(userId);
      } else {
        setError('Authentication failed: No user ID received');
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      
      if (authError.message.includes('HTTP 404')) {
        setError('User not found. Please fill in the name field to create a new account.');
      } else if (authError.message.includes('HTTP 401')) {
        setError('Invalid email or password');
      } else if (authError.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8080');
      } else {
        setError('Login failed: ' + authError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(e);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>
          Login
        </h2>
        
        {error && (
          <div style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Name (required for new accounts)"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: loading ? '#6c757d' : (name.trim() ? '#28a745' : '#007bff'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading 
              ? (name.trim() ? 'Creating Account...' : 'Logging in...') 
              : (name.trim() ? 'Create Account' : 'Login')
            }
          </button>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#6c757d'
        }}>
          <strong>How to use:</strong>
          <br />• <strong>Existing user:</strong> Enter email and password only (leave name blank)
          <br />• <strong>New user:</strong> Fill in all three fields to create a new account
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// FileManager Component
const FileManager = ({ userId, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [userId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/files?userId=${userId}`);
      setFiles(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

 const uploadFile = async () => {
  if (!file) {
    setError('Please select a file first');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId); // make sure userId is defined

  setLoading(true);
  try {
    const response = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    setFile(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';

    await fetchFiles(); // reload files list
    setError('');
  } catch (err) {
    console.error('Error uploading file:', err);
    setError('Failed to upload file: ' + err.message);
  } finally {
    setLoading(false);
  }
};

const viewFile = (id) => {
  const url = `${API_BASE_URL}/view/${id}?userId=${userId}`;
  window.open(url, '_blank');
};

  const downloadFile = async (id, fileName) => {
    try {
      const res = await api.get(`/download/${id}?userId=${userId}`);
      
      // Create blob and download link
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file: ' + err.message);
    }
  };

  const deleteFile = async (id, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/delete/${id}?userId=${userId}`);
      await fetchFiles();
      setError('');
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Your Files</h2>
        <button 
          onClick={onLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, color: '#495057' }}>Upload File</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
            style={{
              padding: '0.5rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          />
          <button
            onClick={uploadFile}
            disabled={loading || !file}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !file) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#495057', marginBottom: '1rem' }}>Files ({files.length})</h3>
        
        {loading && files.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#6c757d'
          }}>
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            No files uploaded yet. Upload your first file above!
          </div>
        ) : (
          <div style={{ 
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {files.map((f, index) => (
              <div 
                key={f.id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index < files.length - 1 ? '1px solid #dee2e6' : 'none',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                }}
              >
                <div style={{ fontWeight: '500', color: '#495057' }}>
                  {f.originalFileName || f.fileName || 'Unknown file'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => viewFile(f.id, f.originalFileName)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => downloadFile(f.id, f.originalFileName)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(f.id, f.originalFileName)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [userId, setUserId] = useState(null);

  const handleLogin = (id) => {
    setUserId(id);
  };

  const handleLogout = () => {
    setUserId(null);
  };

  return (
    <div>
      {userId ? (
        <FileManager userId={userId} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;