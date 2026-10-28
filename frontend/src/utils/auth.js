export const ROLES = { CANDIDATE: 'CANDIDATE', RECRUITER: 'RECRUITER', ADMIN: 'ADMIN' };

export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('userRole');
export const getUserName = () => localStorage.getItem('userName') || 'User';
export const getUserEmail = () => localStorage.getItem('userEmail') || '';
export const getUserId = () => localStorage.getItem('userId');
export const getUserStatus = () => localStorage.getItem('userStatus');
export const getCompanyId = () => localStorage.getItem('companyId');
export const getCompanyName = () => localStorage.getItem('companyName');
export const isAuthenticated = () => !!localStorage.getItem('token');

export const setRole = (role) => {
  localStorage.setItem('userRole', role);
};

export const setAuth = ({ token, userId, email, name, role, status, companyId, companyName }) => {
  localStorage.setItem('token', token);
  if (userId) localStorage.setItem('userId', String(userId));
  if (email) localStorage.setItem('userEmail', email);
  if (name) localStorage.setItem('userName', name);
  if (companyId) localStorage.setItem('companyId', String(companyId));
  if (companyName) localStorage.setItem('companyName', companyName);
  if (role) {
    const roleValue = typeof role === 'string' ? role : (role?.name || String(role));
    console.log('Setting role in localStorage:', roleValue, 'from input:', role);
    localStorage.setItem('userRole', roleValue);
  }
  if (status) {
    const statusValue = typeof status === 'string' ? status : (status?.name || String(status));
    localStorage.setItem('userStatus', statusValue);
  }
  console.log('Auth set. Current localStorage userRole:', localStorage.getItem('userRole'));
};

export const clearAuth = () => {
  ['token', 'userId', 'userEmail', 'userName', 'userRole', 'userStatus', 'companyId', 'companyName'].forEach((k) =>
    localStorage.removeItem(k)
  );
};

export const APPLICATION_STATUS = {
  APPLIED: { label: 'Applied', color: 'info' },
  UNDER_REVIEW: { label: 'Under Review', color: 'warning' },
  SHORTLISTED: { label: 'Shortlisted', color: 'success' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'secondary' },
  REJECTED: { label: 'Rejected', color: 'error' },
  OFFER_EXTENDED: { label: 'Offer', color: 'primary' },
  ACCEPTED: { label: 'Accepted', color: 'success' },
  DECLINED: { label: 'Declined', color: 'default' },
};

export const ROLE_META = {
  CANDIDATE: { label: 'Candidate', color: '#6366f1' },
  RECRUITER: { label: 'Recruiter', color: '#10b981' },
  ADMIN: { label: 'Admin', color: '#f59e0b' },
};
