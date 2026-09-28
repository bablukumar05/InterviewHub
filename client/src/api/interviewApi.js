import api from './axios';

export const createInterview = async (data) => {
  const response = await api.post('/interviews', data);
  return response.data;
};

export const getInterviewById = async (id) => {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
};

export const getMyCandidateInterviews = async (params = {}) => {
  const response = await api.get('/interviews/my', { params });
  return response.data;
};

export const getMyInterviewerInterviews = async (params = {}) => {
  const response = await api.get('/interviews/assigned', { params });
  return response.data;
};

export const getAssignedInterviews = async (params = {}) => {
  const response = await api.get('/interviews/assigned', { params });
  return response.data;
};

export const getInterviewCandidate = async (interviewId) => {
  const response = await api.get(`/interviews/${interviewId}/candidate`);
  return response.data;
};

export const getCandidateResumeUrl = (interviewId) => {
  return `/api/v1/interviews/${interviewId}/candidate-resume`;
};

export const downloadCandidateResume = async (interviewId) => {
  const response = await api.get(`/interviews/${interviewId}/candidate-resume`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getRecruiterInterviews = async (params = {}) => {
  const response = await api.get('/interviews/recruiter', { params });
  return response.data;
};

export const updateInterview = async (id, data) => {
  const response = await api.patch(`/interviews/${id}`, data);
  return response.data;
};

export const rescheduleInterview = async (id, data) => {
  const response = await api.patch(`/interviews/${id}/reschedule`, data);
  return response.data;
};

export const getInterviewerOptions = async (interviewId) => {
  const response = await api.get(`/interviews/${interviewId}/interviewer-options`);
  return response.data;
};

export const assignInterviewers = async (id, interviewerIds) => {
  const response = await api.patch(`/interviews/${id}/interviewers`, {
    interviewerIds: Array.isArray(interviewerIds) ? interviewerIds : [interviewerIds],
  });
  return response.data;
};

export const confirmInterview = async (id) => {
  const response = await api.patch(`/interviews/${id}/confirm`, );
  return response.data;
};

export const startInterview = async (id) => {
  const response = await api.patch(`/interviews/${id}/start`, );
  return response.data;
};

export const completeInterview = async (id, note = '') => {
  const response = await api.patch(`/interviews/${id}/complete`, { note });
  return response.data;
};

export const markInterviewNoShow = async (id) => {
  const response = await api.patch(`/interviews/${id}/no-show`, );
  return response.data;
};

export const cancelInterview = async (id, { reason }) => {
  const response = await api.patch(`/interviews/${id}/cancel`, { reason });
  return response.data;
};

export const updateInterviewStatus = async (id, { status, note, reason }) => {
  switch (status) {
    case 'CONFIRMED':
      return confirmInterview(id);
    case 'IN_PROGRESS':
      return startInterview(id);
    case 'COMPLETED':
      return completeInterview(id, note || reason);
    case 'NO_SHOW':
      return markInterviewNoShow(id);
    case 'CANCELLED':
      return cancelInterview(id, { reason: reason || note });
    default:
      throw new Error(`Unsupported status action: ${status}`);
  }
};

export const getAvailableInterviewers = async (params = {}) => {
  const response = await api.get('/users', {
    params: {
      role: 'INTERVIEWER',
      ...params,
    },
  });
  return response.data;
};
