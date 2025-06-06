import axios from 'axios';

const OBRAS_RES_API_URL = "http://localhost:8060/api/obras";

class obrasService {

    getAllObras(){
        return axios.get(OBRAS_RES_API_URL);
    }

    getObrasById(id) {
        return axios.get(`${OBRAS_RES_API_URL}/buscarPorId/${id}`);
    }

    createObras(formData){
        return axios.post(
            `${OBRAS_RES_API_URL}/registrar`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    updateObras(formData){
        return axios.put(
            `${OBRAS_RES_API_URL}/actualizar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    }

    searchObras(params){
        return axios.get(`${OBRAS_RES_API_URL}/search`, { params });
    }

    deleteObras(id){
        return axios.delete(`${OBRAS_RES_API_URL}/eliminar/${id}`);
    }

    
    getAllObrasEmpleados(id){
        return axios.get(`${OBRAS_RES_API_URL}/empleados/${id}`);
    }
    
    searchObraEmpleadosByExample(idObra, params) {
        return axios.get(`${OBRAS_RES_API_URL}/empleados/buscar/${idObra}`, { params });
    }

    createObraEmpleado(obraEmpleado){
        return axios.post(`${OBRAS_RES_API_URL}/empleados/registrar`, obraEmpleado, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    deleteObrasEmpleados(id){
        return axios.delete(`${OBRAS_RES_API_URL}/empleados/eliminar/${id}`);
    }

    getAllObrasEmpleadosByObra(id) {
        return axios.get(`${OBRAS_RES_API_URL}/empleados/exist/${id}`);
    }
    searchEmpleadosNoEnObra(idObra, params) {
    return axios.get(`${OBRAS_RES_API_URL}/empleados/exist/${idObra}/search`, { params });
}

}

// export default new obrasService();
const ObraServiceInstance = new obrasService();
export default ObraServiceInstance;
