import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaBuilding,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowLeft,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const KosanOwnerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  /* =======================
     TEST API CONNECTION
  ======================= */
  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/public/landingpage');
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  /* =======================
     HANDLE LOGIN
  ======================= */
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:8080/api/kosan-owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    // SIMPAN AUTH
    login(data.data.user, data.data.token);

    // REDIRECT KE KOSAN MILIKNYA
    navigate(`/kosan/${data.data.user.mitras_id}/owner`, { replace: true });

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">

        <div className="text-center mb-4">
          <FaBuilding className="mx-auto text-4xl text-blue-600" />
          <h2 className="text-2xl font-bold mt-2">Login Mitra Kosan</h2>
        </div>

        {apiStatus !== 'connected' && (
          <div className="bg-yellow-100 p-2 rounded text-sm mb-3">
            <FaExclamationCircle className="inline mr-2" />
            Backend tidak terhubung
          </div>
        )}

        {error && (
          <div className="bg-red-100 p-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Login'}
          </button>
        </form>

        <Link to="/" className="block text-center mt-4 text-sm text-gray-500">
          <FaArrowLeft className="inline mr-1" /> Kembali
        </Link>
      </div>
    </div>
  );
};

export default KosanOwnerLogin;
