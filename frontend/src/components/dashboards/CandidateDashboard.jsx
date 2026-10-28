import { useState, useEffect } from 'react';
import api from '../../axiosConfig';

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ appliedJobs: 0, savedJobs: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const [jobsRes, applicationsRes, savedJobsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/my-applications'),
        api.get('/jobs/saved')
      ]);
      
      setJobs(jobsRes.data || []);
      setMyApplications(applicationsRes.data || []);
      setSavedJobs(savedJobsRes.data || []);
      setStats({
        appliedJobs: applicationsRes.data?.length || 0,
        savedJobs: savedJobsRes.data?.length || 0,
        interviews: applicationsRes.data?.filter(app => app.status === 'SHORTLISTED').length || 0
      });
      
      // Fetch recommendations
      try {
        const recRes = await api.get('/recommendations');
        setRecommendations(recRes.data || []);
      } catch (error) {
        console.log('Recommendations service not available');
      }
    } catch (error) {
      console.error('Failed to fetch candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      fetchCandidateData();
    } catch (error) {
      console.error('Failed to apply for job:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      fetchCandidateData();
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading candidate dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
        <div className="text-sm text-gray-600">Find your dream job</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <span className="text-blue-600 text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.appliedJobs}</p>
              <p className="text-gray-600">Applications</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <span className="text-green-600 text-xl">❤️</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
              <p className="text-gray-600">Saved Jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
              <p className="text-gray-600">Interviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {recommendations.slice(0, 3).map((job) => (
                <div key={job.id} className="border rounded-lg p-4 border-green-200 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-sm text-gray-500 mt-2">{job.description?.substring(0, 150)}...</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleSaveJob(job.id)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Jobs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Available Jobs</h2>
        </div>
        <div className="p-6">
          {jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-sm text-gray-500 mt-2">{job.description?.substring(0, 150)}...</p>
                      {job.salary && <p className="text-green-600 font-medium mt-2">{job.salary}</p>}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleSaveJob(job.id)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No jobs available at the moment</p>
          )}
        </div>
      </div>

      {/* My Applications */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myApplications.length > 0 ? myApplications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{app.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{app.companyName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      app.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No applications yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}