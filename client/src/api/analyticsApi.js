import api from "./axios";

const getAdminAnalytics = async () => {
  const response = await api.get("/analytics/admin");

  return response.data;
};

const getRecruiterAnalytics = async () => {
  const response = await api.get("/analytics/recruiter");

  return response.data;
};

const getInterviewerAnalytics = async () => {
  const response = await api.get("/analytics/interviewer");

  return response.data;
};

const getCandidateAnalytics = async () => {
  const response = await api.get("/analytics/candidate");

  return response.data;
};

export {
  getAdminAnalytics,
  getRecruiterAnalytics,
  getInterviewerAnalytics,
  getCandidateAnalytics,
};
