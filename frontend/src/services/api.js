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
  return api.get(`/datasets/${id}`);
};

export const getSampleDataset = () => {
  return api.get('/sample-dataset');
};

export const getChartData = (datasetId, x, y, chartType) => {
  return api.get(
    `/datasets/${datasetId}/chart-data`,
    { params: { x, y, chart_type: chartType } }
  );
};

export const getChartImage = (
  datasetId, x, y, chartType,
  showForecast = false,
  showAnomalies = false,
  showClusters = false
) => {
  return api.get(
    `/datasets/${datasetId}/chart-image`,
    {
      params: {
        x, y,
        chart_type: chartType,
        show_forecast: showForecast,
        show_anomalies: showAnomalies,
        show_clusters: showClusters,
      }
    }
  );
};

export const recommendChart = (datasetId, x, y) => {
  return api.get(
    `/datasets/${datasetId}/recommend-chart`,
    { params: { x, y } }
  );
};

export const cleanDataset = (datasetId) => {
  return api.post(`/datasets/${datasetId}/clean`);
};

export const queryDataset = (datasetId, query) => {
  return api.post(
    `/datasets/${datasetId}/query`,
    { query }
  );
};

export const getInsightStory = (datasetId) => {
  return api.get(`/datasets/${datasetId}/story`);
};

export const getForecast = (datasetId, x, y, periods = 5) => {
  return api.get(
    `/datasets/${datasetId}/forecast`,
    { params: { x, y, periods } }
  );
};

export const getAnomalies = (datasetId) => {
  return api.get(`/datasets/${datasetId}/anomalies`);
};

export const getClusters = (datasetId, k = 3) => {
  return api.get(
    `/datasets/${datasetId}/clusters`,
    { params: { k } }
  );
};

export const listDatasets = () => {
  return api.get('/datasets');
};

export default api;
