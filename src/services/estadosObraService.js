import axios from 'axios';

const ESTADOSOBRA_RES_API_URL = "http://localhost:8060/api/estadosObra";

class estadosObraService {

    getAllEstadosObra(){
        return axios.get(ESTADOSOBRA_RES_API_URL);
    }

    getEstadosObraById(id) {
        return axios.get(`${ESTADOSOBRA_RES_API_URL}/buscarPorId/${id}`);
    }

    createEstadosObra(estadosObra){
        return axios.post(`${ESTADOSOBRA_RES_API_URL}/registrar`, estadosObra, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateEstadosObra(estadosObra){
        return axios.put(`${ESTADOSOBRA_RES_API_URL}/actualizar`, estadosObra, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteEstadosObra(id){
        return axios.delete(`${ESTADOSOBRA_RES_API_URL}/eliminar/${id}`);
    }

}

// export default new estadosObraService();
const EstadosObraServiceInstance = new estadosObraService();
export default EstadosObraServiceInstance;
