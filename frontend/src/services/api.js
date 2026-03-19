import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
});

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getRecentDatasets = () => {
  return api.get('/recent-datasets');
};

export const getDatasetInfo = (id) => {
  return api.get(`/dataset-info/${id}`);
};

export const getSampleDataset = () => {
  return api.get('/sample-dataset');
};

export const generateChart = (params) => {
  return api.post('/generate-chart', params);
};

export const generateInsight = (params) => {
  return api.post('/generate-insight', params);
};

export const runForecast = (params) => {
  return api.post('/forecast', params);
};

export const runAnomalyDetection = (params) => {
  return api.post('/detect-anomalies', params);
};

export const runClustering = (params) => {
  return api.post('/cluster-data', params);
};

export const runNLQuery = (query, datasetId) => {
  return api.post('/nlq-query', { query, datasetId });
};

export default api;
