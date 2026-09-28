import api from './axios';

export const getMyApplications = async (params = {}) => {
  const response = await api.get('/applications/my', {
    params,
  });

  return response.data;
};

export const getCandidateApplications = getMyApplications;

export const createApplication = async ({ jobId, coverLetter }) => {
  const response = await api.post('/applications', {
    jobId,
    coverLetter,
  });

  return response.data;
};

export const applyForJob = createApplication;

export const getMyCandidateProfile = async () => {
  const response = await api.get('/candidate-profiles/me');

  return response.data;
};

export const getApplicationById = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data;
};

export const respondToOffer = async (applicationId, { accept, note = '' }) => {
  const response = await api.put(`/applications/${applicationId}/respond-offer`, {
    accept,
    note,
  });
  return response.data;
};

export const getJobApplications = async (jobId, params = {}) => {
  const response = await api.get(`/applications/job/${jobId}`, {
    params,
  });
  return response.data;
};

export const updateApplicationStatus = async (
  applicationId,
  { status, note = '', rejectionReason = '', recruiterNotes = '', currentRound }
) => {
  const response = await api.put(`/applications/${applicationId}/status`, {
    status,
    note,
    rejectionReason,
    recruiterNotes,
    currentRound,
  });
  return response.data;
};

export const generateOffer = async (
  applicationId,
  { position, salaryPackage, joiningDate, benefits = '', offerLetterUrl = '' }
) => {
  const response = await api.post(`/applications/${applicationId}/generate-offer`, {
    position,
    salaryPackage: Number(salaryPackage),
    joiningDate,
    benefits,
    offerLetterUrl,
  });
  return response.data;
};
