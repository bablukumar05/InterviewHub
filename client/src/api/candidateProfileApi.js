import api from './axios';

export const getMyCandidateProfile = async () => {
  const response = await api.get('/candidate-profiles/me');
  return response.data;
};

export const createCandidateProfile = async (profileData) => {
  const response = await api.post('/candidate-profiles', profileData);
  return response.data;
};

export const updateCandidateProfile = async (profileData) => {
  const response = await api.put('/candidate-profiles/me', profileData);
  return response.data;
};

export const uploadCandidateResume = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/candidate-profiles/resume', formData, {
    headers: {
      'Content-Type': undefined,
    },
    onUploadProgress,
  });

  return response.data;
};

export const uploadResume = uploadCandidateResume;

export const deleteCandidateResume = async () => {
  const response = await api.delete('/candidate-profiles/resume');
  return response.data;
};

export const deleteResume = deleteCandidateResume;

export const getProfileById = async (id) => {
  const response = await api.get(`/candidate-profiles/${id}`);
  return response.data;
};

export const getMyProfile = getMyCandidateProfile;
export const updateMyProfile = updateCandidateProfile;
