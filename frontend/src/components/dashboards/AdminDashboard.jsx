import { useState, useEffect } from 'react';
import api from '../../axiosConfig';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalCompanies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, auditRes] = await Promise.all([
        api.get('/auth/admin/users'),
        api.get('/auth/admin/audit-logs')
      ]);
      
      setUsers(usersRes.data || []);
      setAuditLogs(auditRes.data || []);
      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalJobs: 0, // Would fetch from jobs service
        totalCompanies: 0 // Would fetch from company service
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.put(`/auth/admin/users/${userId}/${action}`);
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">System Administration</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <span className="text-green-600 text-xl">💼</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-gray-600">Total Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded">
              <span className="text-purple-600 text-xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              <p className="text-gray-600">Total Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'RECRUITER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {user.enabled ? (
                      <button
                        onClick={() => handleUserAction(user.id, 'disable')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user.id, 'enable')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Audit Logs</h2>
        </div>
        <div className="p-6">
          {auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {auditLogs.slice(0, 10).map((log, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{log.action}</div>
                    <div className="text-xs text-gray-600">User: {log.username}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No audit logs available</p>
          )}
        </div>
      </div>
    </div>
  );
}