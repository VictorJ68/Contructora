import axios from 'axios';

const HERRAMIENTAS_RES_API_URL = "http://localhost:8060/api/herramientas";

class herramientaService {

    getAllHerramientas(){
        return axios.get(HERRAMIENTAS_RES_API_URL);
    }

    getHerramientasById(id) {
        return axios.get(`${HERRAMIENTAS_RES_API_URL}/buscarPorId/${id}`);
    }

    createHerramientas(formData) {
        return axios.post(
            `${HERRAMIENTAS_RES_API_URL}/registrar`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    updateHerramientas(formData) {
        return axios.put(
            `${HERRAMIENTAS_RES_API_URL}/actualizar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    deleteHerramientas(id){
        return axios.delete(`${HERRAMIENTAS_RES_API_URL}/eliminar/${id}`);
    }

}
const herramientaServiceInstance = new herramientaService();
export default herramientaServiceInstance;
