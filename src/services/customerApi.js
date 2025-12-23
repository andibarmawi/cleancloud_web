import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/public';

export const fetchKosanCustomers = async (laundryId, kosanId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${laundryId}/kosan/${kosanId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching kosan customers:', error);
    // Return mock data for development
    return {
      success: true,
      message: "Data pelanggan kosan berhasil dimuat (mock)",
      data: {
        status: true,
        laundry: { id: laundryId, name: "Clean Laundry" },
        kosan: { 
          id: kosanId, 
          name: `Kosan ${kosanId}`, 
          address: "Jl. Contoh No. 123" 
        },
        customers: [
          {
            id: 1,
            name: "Pelanggan Contoh",
            room: "A1",
            total_unpaid: 50000,
            status: "UNPAID",
            url: "#",
            last_transaction: "2024-01-15",
            phone: "081234567890"
          }
        ],
        summary: {
          total_customers: 1,
          total_unpaid_all: 50000,
          total_paid: 0,
          total_unpaid: 1,
          total_partial: 0
        }
      }
    };
  }
};

export const updateCustomerStatus = async (customerId, status) => {
  try {
    const response = await axios.put(`/api/customers/${customerId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};