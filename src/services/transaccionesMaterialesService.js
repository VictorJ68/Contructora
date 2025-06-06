import axios from 'axios';

const TRANSACCIONES_MATERIALES_RES_API_URL = "http://localhost:8060/api/obras/materiales";

class transaccionesMaterialesService {

    getAllTransaccionesMateriales(idObra){
        return axios.get(`${TRANSACCIONES_MATERIALES_RES_API_URL}/${idObra}`);
    }

    createTransaccionesMateriales(data) {
        return axios.post(
            `${TRANSACCIONES_MATERIALES_RES_API_URL}/registrar`,
            data
        );
    }

    updateTransaccionesMateriales(data){
        return axios.put(`${TRANSACCIONES_MATERIALES_RES_API_URL}/actualizar`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteTransaccionesMateriales(id){
        return axios.delete(`${TRANSACCIONES_MATERIALES_RES_API_URL}/eliminar/${id}`);
    }

    searchMaterialesPorObra(idObra, texto) {
        return axios.get(`${TRANSACCIONES_MATERIALES_RES_API_URL}/search/${idObra}`, {
            params: { texto }
        });
    }

    getAllMaterialesNoEnObra(idObra){
        return axios.get(`${TRANSACCIONES_MATERIALES_RES_API_URL}/no-en-obra/${idObra}`);
    }

    searchMaterialesNoEnObra(idObra, params) {
        return axios.get(`${TRANSACCIONES_MATERIALES_RES_API_URL}/no-en-obra/search/${idObra}`, { params });
    }

}
const transaccionesMaterialesServiceInstance = new transaccionesMaterialesService();
export default transaccionesMaterialesServiceInstance;
