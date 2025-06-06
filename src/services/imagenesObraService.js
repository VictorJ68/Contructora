import axios from 'axios';

const IMAGENESOBRA_RES_API_URL = "http://localhost:8060/api/obras/imagenes";

class imagenesObraService {

    getAllImagenesObra(id){
        return axios.get(`${IMAGENESOBRA_RES_API_URL}/${id}`);
    }

    getImagenesObraById(id) {
        return axios.get(`${IMAGENESOBRA_RES_API_URL}/buscarPorId/${id}`);
    }

    createImagenesObra(formData) {
        return axios.post(
            `${IMAGENESOBRA_RES_API_URL}/registrar`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    updateImagenesObra(formData) {
        return axios.put(
            `${IMAGENESOBRA_RES_API_URL}/actualizar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    deleteImagenesObra(id){
        return axios.delete(`${IMAGENESOBRA_RES_API_URL}/eliminar/${id}`);
    }

    searchImagenesObraByExample(idObra, params) {
        return axios.get(`${IMAGENESOBRA_RES_API_URL}/search/${idObra}`, { params });
    }

    async descargarImagen(fileName) {
        const url = `${IMAGENESOBRA_RES_API_URL}/descargar/${fileName}`;
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
const imagenesObraServiceServiceInstance = new imagenesObraService();
export default imagenesObraServiceServiceInstance;
