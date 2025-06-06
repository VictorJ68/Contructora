import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import empleadosService from '../services/empleadosService';
import cargosService from '../services/cargosService';
import obrasService from '../services/obrasService';

export const AddEmpleadosComponent = () => {
    const [nombre , setNombre] = useState("");
    const [apePaterno , setApePaterno] = useState("");
    const [apeMaterno , setApeMaterno ] = useState("");
    const [correo , setCorreo] = useState("");
    const [telefono , setTelefono] = useState("");
    const [sexoEmp, setSexoEmp] = useState("");
    const [fechaNac, setFechaNac] = useState("");
    const [estadoEmp, setEstadoEmp] = useState("");
    const [idCargo, setIdCargo] = useState("");
    const { id } = useParams();
    const { idobra } = useParams();


    const [listarCargos, setListaCargos] = useState([]);
    

    const navigate = useNavigate();

    useEffect(() => {
        console.log("ID de la URL:", id); // Verifica que se esté obteniendo correctamente el id
        if (id) {
            empleadosService.getEmpleadosById(id).then((response) => {
                const empleados = response.data;
                setNombre(empleados.nombre);
                setApePaterno(empleados.apePaterno);
                setApeMaterno(empleados.apeMaterno);
                setCorreo(empleados.correo);
                setTelefono(empleados.telefono);
                setSexoEmp(empleados.sexoEmp);
                setFechaNac(empleados.fechaNac);
                setEstadoEmp(empleados.estadoEmp);
                setIdCargo(empleados.cargos?.id || "");
            }).catch(error => {
                console.log("Error al obtener material:", error);
            });
        }

        cargosService.getAllCargos().then(response => {
            setListaCargos(response.data);
        }).catch(error => {
            console.log("Error al obtener cargos:", error);
        });
        
    }, [id, idobra]);
    
    const saveEmpleados = (e) => {
        e.preventDefault();
        const empleados = {
            id: id ? parseInt(id) : null,  
            nombre,
            apePaterno,
            apeMaterno,
            correo,
            telefono,
            sexoEmp,
            fechaNac,
            estadoEmp,
            cargos: {
                id: parseInt(idCargo)
            },
        };
    
        // console.log(empleados);
        if (id) {
            empleadosService.updateEmpleados(empleados).then((response) => {
                console.log(response);
                alert("Se actualizó correctamente");
                navigate(opciones);
            }).catch(error => {
                console.log(error);
            });
        } else {
            empleadosService.createEmpleados(empleados).then((response) => {
                console.log("Respuesta completa:", response.data);
                const idEmpleado = response.data.id;
                console.log("ID del Empleado creado:", idEmpleado);
                console.log("ID de la obra:", idobra);

                if (idobra) {
                    const obraEmpleado = {
                        obras: { id: parseInt(idobra) },
                        empleados: { id: parseInt(idEmpleado) }
                    };

                    obrasService.createObraEmpleado(obraEmpleado).then(response => {
                        console.log("ObraEmpleado creado:", response.data);
                        navigate(opciones);
                    }).catch(error => {
                        console.log("Error guardar la Obra del Empleado:", error);
                    });
                } else {
                    navigate(opciones);
                }
            }).catch(error => {
                console.log(error);
            });
        }
    }
    const saveEmpleadoExxistente = (e) => {}
    
    

    const title = id ? 'Actualizar Empleados' : 'Registro de Empleados';
    const opciones = idobra ? '/obras/empleados/'+idobra : '/empleados';

    return (
        <div class="app-content">
            <div class="app-content-header">
                <h1 class="app-content-headerText">{title}</h1>
                <button class="mode-switch" title="Switch Theme">
                    <svg class="moon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="24" height="24" viewBox="0 0 24 24">
                    <defs></defs>
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                    </svg>
                </button>
            </div>
            <div class="app-content-actions">
                <div class="app-content-actions-wrapper">
                    {/* <button className='btn btn-danger' onClick={() => deleteMateriales(material.id)}>Eliminar</button> */}
                </div>
            </div>
            <div class="products-area-wrapper tableView">
                <div class="container">
                    <div class="content">
                        <form onSubmit={saveEmpleados}>
                            <div class="user-details">
                                <div class="input-box">
                                    <span class="details">Nombre</span>
                                    <input type="text" placeholder="Escribe el nombre" 
                                        name='nombre'
                                        className='form-control'
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Apellido Paterno</span>
                                    <input type="text" placeholder="Escribe el apellido paterno" 
                                        name='apePaterno'
                                        className='form-control'
                                        value={apePaterno}
                                        onChange={(e) => setApePaterno(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Apellido Materno</span>
                                    <input type="text" placeholder="Escribe el apellido materno" 
                                        name='apeMaternp'
                                        className='form-control'
                                        value={apeMaterno}
                                        onChange={(e) => setApeMaterno(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Correo</span>
                                    <input type="text" placeholder="Escribe el correo" 
                                        name='correo'
                                        className='form-control'
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Telefono</span>
                                    <input type="text" placeholder="Escribe el Telefono" 
                                        name='telefono'
                                        className='form-control'
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Sexo</span>
                                    <select 
                                        name='sexoEmp'
                                        className='form-control estado'
                                        value={sexoEmp}
                                        onChange={(e) => setSexoEmp(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecciona el sexo</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                </div>
                                <div class="input-box">
                                    <span class="details">Fecha de Nacimiento</span>
                                    <input type="date" placeholder="Seleccion la fecha de nacimiento" 
                                        name='fechaNac'
                                        className='form-control'
                                        value={fechaNac}
                                        onChange={(e) => setFechaNac(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Estado</span>
                                    <select 
                                        name='estadoEmp'
                                        className='form-control estado'
                                        value={estadoEmp}
                                        onChange={(e) => setEstadoEmp(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecciona el estado</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                        <option value="Suspendido">Suspendido</option>
                                        <option value="De baja">De baja</option>
                                    </select>
                                </div>
                                <div className="input-box">
                                    <span className="details">Cargo</span>
                                    <select name="cargo" className="form-control estado" value={idCargo} onChange={(e) => setIdCargo(e.target.value)} required>
                                        <option value="" disabled>Selecciona un cargo</option>
                                        {listarCargos.map(Item => (
                                            <option key={Item.id} value={Item.id}>
                                                {Item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='button'>

                                    <button type="submit" onClick={(e) => saveEmpleados(e)}  className="app-content-headerButton space-button">
                                        <div class="btnfrom">
                                            {id ? 'Actualizar ' : 'Guardar '}
                                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <Link to={opciones}>
                                        <button class="app-content-headerButton">
                                            <div class="btnfrom">
                                                Cancelar
                                                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                                </svg>
                                            </div>
                                        </button>
                                    </Link>
                                </div>
                            </div>  
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEmpleadosComponent;
