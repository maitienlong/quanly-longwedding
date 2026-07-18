import axios from "axios";

// Connect to the specific back-end-website
const WEBSITE_BACKEND_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/website` : "http://localhost:8386/api/website";

const websiteService = {
  getSection: async (section) => {
    try {
      const response = await axios.get(`${WEBSITE_BACKEND_URL}/${section}`);
      return { success: true, data: response.data.data || [] }; 
    } catch (error) {
      console.error(`Error getting website section ${section}:`, error);
      throw error;
    }
  },



  uploadImage: async (file, token) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(`${WEBSITE_BACKEND_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  updateSection: async (section, data, token) => {
    try {
      const response = await axios.post(`${WEBSITE_BACKEND_URL}/${section}`, { data }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating website section ${section}:`, error);
      throw error;
    }
  },

  addSectionItem: async (section, item, token) => {
    try {
      const response = await axios.post(`${WEBSITE_BACKEND_URL}/${section}/item`, { item }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding item to ${section}:`, error);
      throw error;
    }
  },

  updateSectionItem: async (section, id, item, token) => {
    try {
      const response = await axios.put(`${WEBSITE_BACKEND_URL}/${section}/item/${id}`, { item }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating item ${id} in ${section}:`, error);
      throw error;
    }
  },

  deleteSectionItem: async (section, id, token) => {
    try {
      const response = await axios.delete(`${WEBSITE_BACKEND_URL}/${section}/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting item ${id} in ${section}:`, error);
      throw error;
    }
  },

};

export default websiteService;
