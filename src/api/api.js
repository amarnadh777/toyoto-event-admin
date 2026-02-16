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
export const generatdPdf = async (participantId) => {
  try {

    const response = await axiosInstance.get(
      `/participants/pdf/${participantId}`,
      {
        responseType: "blob",
      }
    );

    const contentDisposition = response.headers["content-disposition"];

    let fileName = "ticket.pdf";

    if (contentDisposition) {

      // ✅ FIRST priority → filename* (Arabic support)
      const utf8Match = contentDisposition.match(/filename\*\=UTF-8''([^;]+)/i);

      if (utf8Match && utf8Match[1]) {
        fileName = decodeURIComponent(utf8Match[1]);
      }

      // ✅ fallback → filename
      else {
        const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (normalMatch && normalMatch[1]) {
          fileName = normalMatch[1];
        }
      }

    }

    console.log("Arabic filename:", fileName);

    const blob = new Blob([response.data], {
      type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download error:", error);
  }
};









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