import axios from 'axios';

const OBRASHERRAMIENTAS_RES_API_URL = "http://localhost:8060/api/obras/herramientas";

class entradaHerramientasService {

    getHerramientasDisponiblesPorObra(idObra){
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/${idObra}`);
    }

    agregarHerramientaAObra(data){
        return axios.post(`${OBRASHERRAMIENTAS_RES_API_URL}/registrar`, data);
    }

    
    getHerramientasNoEnObra(idObra){
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/no-en-obra/${idObra}`);
    }

    updateEntradaHerramienta(data) {
        return axios.put(`${OBRASHERRAMIENTAS_RES_API_URL}/actualizar`, data);
    }

    getEntradaPorObraYHerramienta(idObra, idHerramienta) {
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/buscar/${idObra}/${idHerramienta}`);
    }

    getCantidadHerramientaEnObra(idObra, idHerramienta) {
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/cantidad/${idObra}/${idHerramienta}`);
    }

    deleteEntradaHerramienta(id){
        return axios.delete(`${OBRASHERRAMIENTAS_RES_API_URL}/eliminar/${id}`);
    }

    searchVistaEntradaHerramienta(idObra, params) {
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/search/${idObra}`, { params });
    }
    
    searchAddHerramientaexist(idObra, params) {
        return axios.get(`${OBRASHERRAMIENTAS_RES_API_URL}/no-en-obra/search/${idObra}`, { params });
    }

}
const herramientaServiceInstance = new entradaHerramientasService();
export default herramientaServiceInstance;
