import axiosClient from "./axoisClient";

const getResourceList = async (path, params = {}) => {
  const response = await axiosClient.get(path, { params });
  return response.data;
};

const updateResource = async (path, id, data) => {
  const response = await axiosClient.put(`${path}/${id}`, data);
  return response.data;
};

const deleteResource = async (path, id) => {
  const response = await axiosClient.delete(`${path}/${id}`);
  return response.data;
};

export const getCourts = (params) => getResourceList("/courts", params);
export const createCourt = async (data) => {
  const response = await axiosClient.post("/courts", data);
  return response.data;
};
export const createFloor = async (data) => {
  const response = await axiosClient.post("/floors", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const updateCourt = (id, data) => updateResource("/courts", id, data);
export const deleteCourt = (id) => deleteResource("/courts", id);
export const getCourtById = async (id) => {
  const response = await axiosClient.get(`/courts/${id}`);
  return response.data;
};
export const getCourtTypes = (params) => getResourceList("/courtypes", params);
export const updateCourtType = (id, data) => updateResource("/courtypes", id, data);
export const deleteCourtType = (id) => deleteResource("/courtypes", id);
export const getFloors = (params) => getResourceList("/floors", params);
export const updateFloor = async (id, data) => {
  const response = await axiosClient.put(`/floors/${id}`, data, data instanceof FormData ? {
    headers: { "Content-Type": "multipart/form-data" },
  } : undefined);
  return response.data;
};
export const deleteFloor = (id) => deleteResource("/floors", id);
export const getFloorNames = (params) => getResourceList("/floorNames", params);
export const updateFloorName = (id, data) => updateResource("/floorNames", id, data);
export const deleteFloorName = (id) => deleteResource("/floorNames", id);
export const getOffices = (params) => getResourceList("/offices", params);
export const updateOffice = (id, data) => updateResource("/offices", id, data);
export const deleteOffice = (id) => deleteResource("/offices", id);
export const updateGovernorate = (id, data) => updateResource("/governorates", id, data);
export const deleteGovernorate = (id) => deleteResource("/governorates", id);
export const getPayments = (params) => getResourceList("/payment/", params);

export const createOffice = async (data) => (await axiosClient.post("/offices", data)).data;
export const getOfficeTypes = (params) => getResourceList("/officeTypes", params);

export const createOfficeType = async (data) => (await axiosClient.post("/officeTypes", data)).data;
export const updateOfficeType = (id, data) => updateResource("/officeTypes", id, data);
export const deleteOfficeType = (id) => deleteResource("/officeTypes", id);
export const getCourtActivity = (params) => getResourceList("/courts/activity", params);
