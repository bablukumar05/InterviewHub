import api from "./axios";

export const createEvaluation =
  async (payload) => {
    const response =
      await api.post(
        "/evaluations",
        payload
      );

    return response.data;
  };

export const getEvaluationById =
  async (evaluationId) => {
    const response =
      await api.get(
        `/evaluations/${evaluationId}`
      );

    return response.data;
  };

export const getMyEvaluations =
  async (params = {}) => {
    const response =
      await api.get(
        "/evaluations/my",
        {
          params,
        }
      );

    return response.data;
  };

export const getInterviewEvaluations =
  async (interviewId) => {
    const response =
      await api.get(
        `/evaluations/interview/${interviewId}`
      );

    return response.data;
  };

export const getApplicationEvaluations =
  async (applicationId) => {
    const response =
      await api.get(
        `/evaluations/application/${applicationId}`
      );

    return response.data;
  };

export const updateEvaluation =
  async (
    evaluationId,
    payload
  ) => {
    const response =
      await api.patch(
        `/evaluations/${evaluationId}`,
        payload
      );

    return response.data;
  };

export const submitEvaluation =
  async (
    evaluationId,
    payload = {}
  ) => {
    const response =
      await api.patch(
        `/evaluations/${evaluationId}/submit`,
        payload
      );

    return response.data;
  };

export const reviewEvaluation =
  async (evaluationId) => {
    const response =
      await api.patch(
        `/evaluations/${evaluationId}/review`
      );

    return response.data;
  };
