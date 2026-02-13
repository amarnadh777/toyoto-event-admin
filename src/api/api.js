import axiosInstance from "./apiInstance";

export const createParticipant = async (participantData) => {

    try {
        const response = await axiosInstance.post("/participants/create", participantData);
         return response.data;
    } catch (error) {
        console.error("Error creating participant:", error);
    }
  
 
}

export const getParticipants = async () => {
  const response = await axiosInstance.get("/participants/list-all");
  return response.data;
}

export const generatdPdf = async (participantsId) => {
  try {
    
    const response = await axiosInstance.get(`/participants/pdf/${participantsId}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'participants.pdf');
    document.body.appendChild(link);
    link.click(); 
  } catch (error) {
    console.error("Error generating PDF:", error);  
    
  }
}

export const deleteParticipant = async (participantId) => {

    try {

        const response = await axiosInstance.delete(
            `/participants/${participantId}`
        );

        return response.data;

    } catch (error) {

        console.error("Error deleting participant:", error);

        // ⭐ Throw backend message properly
        throw error.response?.data || {
            message: "Failed to delete participant"
        };

    }

};

export const updateParticipant = async (participantId, updatedData) => {
    try {
        const response = await axiosInstance.put(`/participants/${participantId}`, updatedData); 
        return response.data;
    }
        catch (error) {
        console.error("Error updating participant:", error);
        throw error;
    }   

}