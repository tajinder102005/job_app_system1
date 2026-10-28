// Mock data store for complete job application system
export const mockJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    description: 'We are looking for a senior software engineer to join our team. You will be responsible for designing and implementing scalable software solutions.',
    location: 'San Francisco, CA',
    salary: '$120,000 - $180,000',
    type: 'Full-time',
    companyId: 1,
    companyName: 'TechCorp Inc.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    postedDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: 2,
    title: 'Product Manager',
    description: 'Join our product team to drive product strategy and roadmap. You will work closely with engineering and design teams.',
    location: 'New York, NY',
    salary: '$100,000 - $150,000',
    type: 'Full-time',
    companyId: 2,
    companyName: 'InnovateTech',
    skills: ['Product Management', 'Agile', 'Data Analysis', 'User Research'],
    postedDate: '2024-01-14',
    status: 'Active'
  },
  {
    id: 3,
    title: 'Frontend Developer',
    description: 'Looking for an experienced frontend developer to build modern web applications using React and modern frameworks.',
    location: 'Remote',
    salary: '$80,000 - $120,000',
    type: 'Remote',
    companyId: 1,
    companyName: 'TechCorp Inc.',
    skills: ['React', 'TypeScript', 'CSS', 'HTML'],
    postedDate: '2024-01-13',
    status: 'Active'
  },
  {
    id: 4,
    title: 'Data Scientist',
    description: 'We need a data scientist to analyze large datasets and build machine learning models for business insights.',
    location: 'Boston, MA',
    salary: '$110,000 - $160,000',
    type: 'Full-time',
    companyId: 3,
    companyName: 'DataDriven Co.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    postedDate: '2024-01-12',
    status: 'Active'
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    description: 'Join our infrastructure team to manage cloud deployments and CI/CD pipelines.',
    location: 'Seattle, WA',
    salary: '$105,000 - $145,000',
    type: 'Full-time',
    companyId: 2,
    companyName: 'InnovateTech',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    postedDate: '2024-01-11',
    status: 'Active'
  }
];

export const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Inc.',
    description: 'Leading technology company specializing in software development and cloud solutions.',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: '500-1000',
    founded: '2010',
    status: 'Verified'
  },
  {
    id: 2,
    name: 'InnovateTech',
    description: 'Innovative startup focused on AI and machine learning solutions.',
    location: 'New York, NY',
    website: 'https://innovatetech.com',
    industry: 'Technology',
    size: '50-100',
    founded: '2018',
    status: 'Verified'
  },
  {
    id: 3,
    name: 'DataDriven Co.',
    description: 'Data analytics company helping businesses make data-driven decisions.',
    location: 'Boston, MA',
    website: 'https://datadriven.com',
    industry: 'Analytics',
    size: '100-200',
    founded: '2015',
    status: 'Pending'
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    jobTitle: 'Senior Software Engineer',
    companyName: 'TechCorp Inc.',
    candidateEmail: 'candidate@example.com',
    candidateName: 'John Doe',
    status: 'Under Review',
    appliedDate: '2024-01-16',
    resume: 'resume_john_doe.pdf',
    coverLetter: 'I am excited to apply for this position...'
  },
  {
    id: 2,
    jobId: 3,
    jobTitle: 'Frontend Developer',
    companyName: 'TechCorp Inc.',
    candidateEmail: 'candidate@example.com',
    candidateName: 'John Doe',
    status: 'Interview Scheduled',
    appliedDate: '2024-01-15',
    resume: 'resume_john_doe.pdf',
    coverLetter: 'I have extensive experience with React...'
  }
];

export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'candidate@example.com',
    role: 'CANDIDATE',
    status: 'Active',
    joinedDate: '2024-01-01'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'recruiter@example.com',
    role: 'RECRUITER',
    status: 'Active',
    joinedDate: '2024-01-05',
    companyId: 1
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'Active',
    joinedDate: '2024-01-01'
  },
  {
    id: 4,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'CANDIDATE',
    status: 'Active',
    joinedDate: '2024-01-10'
  }
];

export const mockReviews = [
  {
    id: 1,
    companyId: 1,
    companyName: 'TechCorp Inc.',
    userId: 1,
    userName: 'John Doe',
    rating: 4,
    title: 'Great company to work for',
    comment: 'Excellent work culture and good benefits. Management is supportive.',
    date: '2024-01-10'
  },
  {
    id: 2,
    companyId: 2,
    companyName: 'InnovateTech',
    userId: 4,
    userName: 'Bob Johnson',
    rating: 5,
    title: 'Innovative environment',
    comment: 'Very innovative and fast-paced environment. Great learning opportunities.',
    date: '2024-01-08'
  }
];

// Local storage helpers
export const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// Initialize data in localStorage if not present
export const initializeMockData = () => {
  if (!localStorage.getItem('jobs')) {
    saveToStorage('jobs', mockJobs);
  }
  if (!localStorage.getItem('companies')) {
    saveToStorage('companies', mockCompanies);
  }
  if (!localStorage.getItem('applications')) {
    saveToStorage('applications', mockApplications);
  }
  if (!localStorage.getItem('users')) {
    saveToStorage('users', mockUsers);
  }
  if (!localStorage.getItem('reviews')) {
    saveToStorage('reviews', mockReviews);
  }
  if (!localStorage.getItem('savedJobs')) {
    saveToStorage('savedJobs', []);
  }
};
