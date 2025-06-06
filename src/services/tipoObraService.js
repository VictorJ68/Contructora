import axios from 'axios';

const TIPOOBRA_RES_API_URL = "http://localhost:8060/api/tipoObra";

class tipoObraService {

    getAllTipoObra(){
        return axios.get(TIPOOBRA_RES_API_URL);
    }

    getTipoObraById(id) {
        return axios.get(`${TIPOOBRA_RES_API_URL}/buscarPorId/${id}`);
    }

    createTipoObra(tipoObra){
        return axios.post(`${TIPOOBRA_RES_API_URL}/registrar`, tipoObra, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateTipoObra(tipoObra){
        return axios.put(`${TIPOOBRA_RES_API_URL}/actualizar`, tipoObra, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteTipoObra(id){
        return axios.delete(`${TIPOOBRA_RES_API_URL}/eliminar/${id}`);
    }

}

// export default new tipoObraService();
const tipoObraServiceInstance = new tipoObraService();
export default tipoObraServiceInstance;
