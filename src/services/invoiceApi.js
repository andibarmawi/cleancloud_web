import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/public';

export const fetchInvoice = async (laundryId, invoiceNumber) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${laundryId}/pay/invoice`, {
      params: { invoice: invoiceNumber }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    // Return mock data for development
    return {
      success: true,
      message: "Data invoice berhasil dimuat (mock)",
      data: {
        status: true,
        invoice: {
          invoice_number: invoiceNumber,
          customer_name: "Mock Customer",
          customer_phone: "08123456789",
          laundry: {
            id: laundryId,
            name: "Clean Laundry",
            address: "Jl. Contoh No. 123",
            phone: "(021) 1234567"
          },
          total: 50000,
          status: "UNPAID",
          estimated_finished: "Rabu, 11 Desember 2025",
          pickup_status: "BELUM DIAMBIL",
          payment_status: "BELUM LUNAS",
          items: [
            {
              service_name: "Regular 3 hari",
              unit: "kg",
              quantity: 3,
              price: 7000,
              subtotal: 21000,
              work_status: "SORTIR"
            }
          ]
        },
        payment_gateway: {
          provider: "Xendit",
          redirect_url: "https://payment.xendit.co/invoice/xyz123abc"
        }
      }
    };
  }
};

export const processPayment = async (invoiceNumber, paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pay/process`, {
      invoice: invoiceNumber,
      ...paymentData
    });
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pay/status/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};