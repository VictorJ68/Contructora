import axios from 'axios';

const MATERIALES_RES_API_URL = "http://localhost:8060/api/materiales";

class materialesService {

    getAllMateriales(){
        return axios.get(MATERIALES_RES_API_URL);
    }

    getMaterialesById(id) {
        return axios.get(`${MATERIALES_RES_API_URL}/buscarPorId/${id}`);
    }

    createMateriales(formData){
        return axios.post(
            `${MATERIALES_RES_API_URL}/registrar`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    updateMateriales(formData){
        return axios.put(
            `${MATERIALES_RES_API_URL}/actualizar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    deleteMateriales(id){
        return axios.delete(`${MATERIALES_RES_API_URL}/eliminar/${id}`);
    }
    
    searchMateriales(params){
        return axios.get(`${MATERIALES_RES_API_URL}/search`, { params });
    }

}

const materialesServiceInstance = new materialesService();
export default materialesServiceInstance;
