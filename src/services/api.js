// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/public';

export const fetchLandingPageData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/landingpage`);
    return response.data;
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    // Fallback data jika API gagal
    return {
      success: false,
      data: {
        app_name: "CleanCloud",
        description: "Platform manajemen laundry terintegrasi",
        features: ["Fitur dasar 1", "Fitur dasar 2"],
        cta: {
          login: "#",
          whatsapp: "#"
        }
      }
    };
  }
};