import axios from 'axios';

const CLIENTES_RES_API_URL = "http://localhost:8060/api/clientes";

class clientesService {

    getAllClientes(){
        return axios.get(CLIENTES_RES_API_URL);
    }

    getClientesById(id) {
        return axios.get(`${CLIENTES_RES_API_URL}/buscarPorId/${id}`);
    }

    createClientes(clientes){
        return axios.post(`${CLIENTES_RES_API_URL}/registrar`, clientes, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateClientes(clientes){
        return axios.put(`${CLIENTES_RES_API_URL}/actualizar`, clientes, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteClientes(id){
        return axios.delete(`${CLIENTES_RES_API_URL}/eliminar/${id}`);
    }

    searchClientes(params){
        return axios.get(`${CLIENTES_RES_API_URL}/search`, { params });
    }

}

export default new clientesService();
