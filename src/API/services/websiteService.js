import axiosClient from "../axiosClient";

const websiteService = {
  getSection: async (section) => {
    try {
      const res = await axiosClient.get(`/api/website/${section}`);
      return { success: true, data: res.data || [] }; 
    } catch (error) {
      console.error(`Error getting website section ${section}:`, error);
      throw error;
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosClient.post(`/api/website/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (res) {
        if (typeof res.url === 'string') res.url = res.url.replace(/^http:\/\/api\.longwedding\.vn/i, 'https://api.longwedding.vn');
        if (typeof res.path === 'string') res.path = res.path.replace(/^http:\/\/api\.longwedding\.vn/i, 'https://api.longwedding.vn');
        if (res.data) {
          if (typeof res.data.url === 'string') res.data.url = res.data.url.replace(/^http:\/\/api\.longwedding\.vn/i, 'https://api.longwedding.vn');
          if (typeof res.data.path === 'string') res.data.path = res.data.path.replace(/^http:\/\/api\.longwedding\.vn/i, 'https://api.longwedding.vn');
        }
      }
      return res;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  uploadAudio: async (file) => {
    try {
      const formData = new FormData();
      formData.append("audio", file);
      const res = await axiosClient.post(`/api/website/upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res;
    } catch (error) {
      console.error("Error uploading audio:", error);
      throw error;
    }
  },

  updateSection: async (section, data) => {
    try {
      const res = await axiosClient.post(`/api/website/${section}`, { data });
      return res;
    } catch (error) {
      console.error(`Error updating website section ${section}:`, error);
      throw error;
    }
  },

  addSectionItem: async (section, item) => {
    try {
      const res = await axiosClient.post(`/api/website/${section}/item`, { item });
      return res;
    } catch (error) {
      console.error(`Error adding item to ${section}:`, error);
      throw error;
    }
  },

  updateSectionItem: async (section, id, item) => {
    try {
      const res = await axiosClient.put(`/api/website/${section}/item/${id}`, { item });
      return res;
    } catch (error) {
      console.error(`Error updating item ${id} in ${section}:`, error);
      throw error;
    }
  },

  deleteSectionItem: async (section, id) => {
    try {
      const res = await axiosClient.delete(`/api/website/${section}/item/${id}`);
      return res;
    } catch (error) {
      console.error(`Error deleting item ${id} in ${section}:`, error);
      throw error;
    }
  },
};

export default websiteService;

