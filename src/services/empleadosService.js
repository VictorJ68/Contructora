import axios from 'axios';

const EMPLEADOS_RES_API_URL = "http://localhost:8060/api/empleados";

class empleadosService {

    getAllEmpleados(){
        return axios.get(EMPLEADOS_RES_API_URL);
    }

    getEmpleadosById(id) {
        return axios.get(`${EMPLEADOS_RES_API_URL}/buscarPorId/${id}`);
    }

    createEmpleados(empleados){
        return axios.post(`${EMPLEADOS_RES_API_URL}/registrar`, empleados, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateEmpleados(empleados){
        return axios.put(`${EMPLEADOS_RES_API_URL}/actualizar`, empleados, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    deleteEmpleados(id){
        return axios.delete(`${EMPLEADOS_RES_API_URL}/eliminar/${id}`);
    }

    searchEmpleados(params){
        return axios.get(`${EMPLEADOS_RES_API_URL}/search`, { params });
    }

}

const empleadosServiceInstance = new empleadosService();
export default empleadosServiceInstance;
