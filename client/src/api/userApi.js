import axiosClient from './axiosClient';

const userApi = {
  createUser: (data) => {
    const url = 'user/create';
    return axiosClient.post(url, data);
  },
  getUserProfile: (params) => {
    const url = 'user/profile';
    return axiosClient.get(url, { params });
  },

  editUserProfile: (data) => {
    const url = 'user/edit/profile';
    return axiosClient.post(url, data);
  },
  editUserAvatar: (data) => {
    const url = 'user/edit/avatar';
    return axiosClient.put(url, data);
  },
  getAllUser: () => {
    const url = 'user/get/all';
    return axiosClient.get(url);
  },
  checkUserExist: (params) => {
    const url = 'user/check';
    return axiosClient.get(url, { params });
  },
};

export default userApi;
