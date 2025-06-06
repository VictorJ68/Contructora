import axios from 'axios';

const UNIDADES_RES_API_URL = "http://localhost:8060/api/unidades";

class unidadesService {

    getAllUnidades(){
        return axios.get(UNIDADES_RES_API_URL);
    }

    getUnidadesById(id) {
        return axios.get(`${UNIDADES_RES_API_URL}/buscarPorId/${id}`);
    }

    createUnidades(unidades){
        return axios.post(`${UNIDADES_RES_API_URL}/registrar`, unidades, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateUnidades(unidades){
        return axios.put(`${UNIDADES_RES_API_URL}/actualizar`, unidades, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteUnidades(id){
        return axios.delete(`${UNIDADES_RES_API_URL}/eliminar/${id}`);
    }

}

export default new unidadesService();
