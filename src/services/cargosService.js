import axios from 'axios';

const CARGOS_RES_API_URL = "http://localhost:8060/api/cargos";

class cargosService {

    getAllCargos(){
        return axios.get(CARGOS_RES_API_URL);
    }

    getCargosById(id) {
        return axios.get(`${CARGOS_RES_API_URL}/buscarPorId/${id}`);
    }

    createCargos(cargos){
        return axios.post(`${CARGOS_RES_API_URL}/registrar`, cargos, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateCargos(cargos){
        return axios.put(`${CARGOS_RES_API_URL}/actualizar`, cargos, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteCargos(id){
        return axios.delete(`${CARGOS_RES_API_URL}/eliminar/${id}`);
    }

}

export default new cargosService();
