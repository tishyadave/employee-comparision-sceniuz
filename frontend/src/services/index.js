import api from "./api";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
};

export const userService = {
  getDashboard: () => api.get("/users/dashboard"),
};

export const selfAssessmentService = {
  submit: (ratings) => api.post("/self-assessment", ratings),
  getMine: () => api.get("/self-assessment/me"),
};

export const testService = {
  start: () => api.post("/test/start"),
  submit: (payload) => api.post("/test/submit", payload),
  getResults: () => api.get("/test/results"),
};

export const questionService = {
  getAll: (topic) => api.get("/questions", { params: topic ? { topic } : {} }),
  getById: (id) => api.get(`/questions/${id}`),
  getTopics: () => api.get("/questions/topics"),
  create: (data) => api.post("/questions", data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

export const leaderboardService = {
  get: () => api.get("/leaderboard"),
};

export const analyticsService = {
  getOverview: () => api.get("/analytics/overview"),
  getSelfVsActual: () => api.get("/analytics/self-vs-actual"),
  getGapAnalysis: () => api.get("/analytics/gap-analysis"),
  getQuestionDifficulty: () => api.get("/analytics/question-difficulty"),
  getTopPerformers: () => api.get("/analytics/top-performers"),
  exportCSV: () =>
    api.get("/analytics/export-csv", { responseType: "blob" }).then((res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "skill_assessment_results.csv";
      a.click();
      URL.revokeObjectURL(url);
    }),
};

export const adminService = {
  getEmployees: (params) => api.get("/admin/employees", { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  createEmployee: (data) => api.post("/admin/employees", data),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  // Helper: list of all admins for team-lead dropdown
  getAdminsList: () => api.get("/admin/admins-list"),
};

export const superAdminService = {
  getAdmins: (params) => api.get("/admin/admins", { params }),
  createAdmin: (data) => api.post("/admin/admins", data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
};

