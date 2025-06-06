import axios from 'axios';

const PDFOBRA_RES_API_URL = "http://localhost:8060/api/obras/pdf";

class pdfObraService {

    getAllPdfObra(id){
        return axios.get(`${PDFOBRA_RES_API_URL}/${id}`);
    }

    getPdfObraById(id) {
        return axios.get(`${PDFOBRA_RES_API_URL}/buscarPorId/${id}`);
    }

    createPdfObra(formData) {
        return axios.post(
            `${PDFOBRA_RES_API_URL}/registrar`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    updatePdfObra(formData) {
        return axios.put(
            `${PDFOBRA_RES_API_URL}/actualizar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    deletePdfObra(id){
        return axios.delete(`${PDFOBRA_RES_API_URL}/eliminar/${id}`);
    }

    searchPdfObraByExample(idObra, params) {
        return axios.get(`${PDFOBRA_RES_API_URL}/search/${idObra}`, { params });
    }

    async descargarPdf(fileName) {
        const url = `${PDFOBRA_RES_API_URL}/descargar/${fileName}`;
        const response = await axios.get(url, {
            responseType: 'blob'
        });
        // Crea un enlace temporal y fuerza la descarga
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }

}
const pdfObraServiceServiceInstance = new pdfObraService();
export default pdfObraServiceServiceInstance;
