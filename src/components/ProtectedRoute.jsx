import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const params = useParams();

  // === DEBUG LOG ===
  console.group('🛡️ ProtectedRoute DEBUG');
  console.log('Path:', location.pathname);
  console.log('Params:', params);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('User:', user);
  console.log('Required Role:', requiredRole);
  console.log('User Role:', user?.role);
  console.groupEnd();

  // === DEBUG VIEW (TIDAK REDIRECT) ===
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-6 rounded shadow max-w-lg w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            ❌ DEBUG: User belum terautentikasi
          </h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify({
  isAuthenticated,
  user,
  requiredRole,
  path: location.pathname,
}, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="bg-white p-6 rounded shadow max-w-lg w-full">
          <h2 className="text-xl font-bold text-yellow-600 mb-4">
            ⚠️ DEBUG: Role tidak sesuai
          </h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify({
  requiredRole,
  userRole: user?.role,
  user,
}, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // === PASS ===
  return children;
};

export default ProtectedRoute;
