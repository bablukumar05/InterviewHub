import api from './axios';

export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', {
    params,
  });
  return response.data;
};

export const getMyJobs = async (params = {}) => {
  const response = await api.get('/jobs/my', {
    params,
  });
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const publishJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/publish`);
  return response.data;
};

export const pauseJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/pause`);
  return response.data;
};

export const closeJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/close`);
  return response.data;
};
