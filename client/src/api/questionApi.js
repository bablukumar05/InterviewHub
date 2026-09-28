import api from "./axios";

export const getQuestions = async (
  params = {}
) => {
  const response =
    await api.get(
      "/questions",
      {
        params,
      }
    );

  return response.data;
};

export const getQuestionById =
  async (questionId) => {
    const response =
      await api.get(
        `/questions/${questionId}`
      );

    return response.data;
  };

export const getQuestionFilters =
  async () => {
    const response =
      await api.get(
        "/questions/filters"
      );

    return response.data;
  };

export const createQuestion =
  async (payload) => {
    const response =
      await api.post(
        "/questions",
        payload
      );

    return response.data;
  };

export const updateQuestion =
  async (
    questionId,
    payload
  ) => {
    const response =
      await api.patch(
        `/questions/${questionId}`,
        payload
      );

    return response.data;
  };

export const activateQuestion =
  async (questionId) => {
    const response =
      await api.patch(
        `/questions/${questionId}/activate`
      );

    return response.data;
  };

export const deactivateQuestion =
  async (questionId) => {
    const response =
      await api.patch(
        `/questions/${questionId}/deactivate`
      );

    return response.data;
  };
