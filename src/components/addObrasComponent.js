import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import obrasService from '../services/obrasService';
import clientesService from '../services/clientesService';
import empleadosService from '../services/empleadosService';
import tipoObraService from '../services/tipoObraService';
import estadosObraService from '../services/estadosObraService';

export const AddObrasComponent = () => {
    const [nombre , setNombre] = useState("");
    const [idCliente  , setIdCliente] = useState("");
    const [direccion , setDireccion] = useState("");
    const [fecha , setFecha ] = useState("");
    const [idEstadoObra , setIdEstadoObra] = useState("");
    const [presupuesto_total , setPresupuesto_total] = useState("");
    const [costo_real , setCosto_real] = useState("");
    const [fecha_inicio, setFecha_inicio] = useState("");
    const [fecha_fin_estimada, setFecha_fin_estimada] = useState("");
    const [idTipoObra  , setIdTipoObra] = useState("");
    const [idSupervisor  , setIdSupervisor] = useState("");
    const [imagen, setImagen] = useState(null); // Cambiado a null para File
    const [preview, setPreview] = useState(""); // Nueva estado para previsualización
    const { id } = useParams();
    const costo_final = 0;

    const [listarCliente, setListaClientes] = useState([]);
    const [listarEmpleados, setListaEmpleados] = useState([]);
    const [listarTipoObra, setListaTipoObra] = useState([]);
    const [listarEstadoObra, setListaEstadoObra] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        console.log("ID de la URL:", id); // Verifica que se esté obteniendo correctamente el id
        if (id) {
            obrasService.getObrasById(id).then((response) => {
                const obras = response.data;
                setNombre(obras.nombre);
                setIdCliente(obras.clientes?.id || "");
                setDireccion(obras.direccion);
                setFecha(obras.fecha);
                setIdEstadoObra(obras.estadosObra?.id || "");
                setPresupuesto_total(obras.presupuesto_total);
                setCosto_real(obras.costo_real);
                setFecha_inicio(obras.fecha_inicio);
                setFecha_fin_estimada(obras.fecha_fin_estimada);
                setIdTipoObra(obras.tipoObra?.id || "");
                setIdSupervisor(obras.empleados?.id || "");
                if (obras.imagen) {
                    setPreview(`http://localhost:8060/Imagenes-contructora/${obras.imagen}`);
                }
            }).catch(error => {
                console.log("Error al obtener obra:", error);
            });
        }

        clientesService.getAllClientes().then(response => {
            setListaClientes(response.data);
        }).catch(error => {
            console.log("Error al obtener clientes:", error);
        });
        empleadosService.getAllEmpleados().then(response => {
            setListaEmpleados(response.data);
        }).catch(error => {
            console.log("Error al obtener empleados:", error);
        });
        tipoObraService.getAllTipoObra().then(response => {
            setListaTipoObra(response.data);
        }).catch(error => {
            console.log("Error al obtener tipo de obra:", error);
        });
        estadosObraService.getAllEstadosObra().then(response => {
            setListaEstadoObra(response.data);
        }).catch(error => {
            console.log("Error al obtener estado de la obra:", error);
        });
    }, [id]);

    // Nuevo: Manejar archivo y previsualización
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveObras = (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('nombre', nombre);
        formData.append('idCliente', idCliente);
        formData.append('direccion', direccion);
        formData.append('fecha', fecha);
        formData.append('idEstadoObra', idEstadoObra);
        formData.append('presupuesto_total', presupuesto_total);
        formData.append('costo_real', costo_final);
        formData.append('fecha_inicio', fecha_inicio);
        formData.append('fecha_fin_estimada', fecha_fin_estimada);
        formData.append('idTipoObra', idTipoObra);
        
        formData.append('idSupervisor', idSupervisor);

        if (imagen) formData.append('imagen', imagen);
        if (id) formData.append('id', id);

        if (id) {
            obrasService.updateObras(formData).then(() => {
                alert("¡Obra actualizado!");
                navigate(`/`);
            }).catch(error => {
                console.error("Error al actualizar:", error);
                alert("Error al actualizar: " + error.message);
            });
        } else {
            obrasService.createObras(formData).then(() => {
                alert("¡Obra creado!");
                navigate(`/`);
            }).catch(error => {
                console.error("Error al crear:", error);
                alert("Error al crear: " + error.message);
            });
        }

        // const obras = {
        //     id: id ? parseInt(id) : null,  
        //     nombre,
        //     clientes: {
        //         id: parseInt(idCliente)
        //     },
        //     direccion,
        //     fecha,
        //     estadosObra: {
        //         id: parseInt(idEstadoObra)
        //     },
        //     presupuesto_total,
        //     costo_real,
        //     fecha_inicio,
        //     fecha_fin_estimada,
        //     tipoObra: {
        //         id: parseInt(idTipoObra)
        //     },
        //     empleados: {
        //         id: parseInt(idSupervisor)
        //     }
        // };
        
        //         console.log(obras);
    
        // if (id) {
        //     obrasService.updateObras(obras).then((response) => {
        //         console.log(response);
        //         alert("Se actualizó correctamente");
        //         navigate("/obras");
        //     }).catch(error => {
        //         console.log(error);
        //     });
        // } else {
        //     obrasService.createObras(obras).then((response) => {
        //         console.log("Create: "+response);
        //         navigate("/obras");
        //     }).catch(error => {
        //         console.log(error);
        //     });
        // }
    }
    
    

    const title = id ? 'Actualizar Obras' : 'Registro de Obras';

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
                        <form onSubmit={saveObras}>
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
                                <div className="input-box">
                                    <span className="details">Cliente</span>
                                    <select name="cliente" className="form-control estado" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
                                        <option value="" disabled>Selecciona el Cliente</option>
                                        {listarCliente.map(Item => (
                                            <option key={Item.id} value={Item.id}>
                                                {Item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div class="input-box">
                                    <span class="details">Direccion</span>
                                    <input type="text" placeholder="Escribe la direccion" 
                                        name='direccion'
                                        className='form-control'
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Fecha actual</span>
                                    <input type="date" placeholder="Seleccion la fecha actual" 
                                        name='fecha'
                                        className='form-control'
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="input-box">
                                    <span className="details">Estado de la Obra</span>
                                    <select name="estadosObra" className="form-control estado" value={idEstadoObra} onChange={(e) => setIdEstadoObra(e.target.value)} required>
                                        <option value="" disabled>Selecciona el Estado de la Obra</option>
                                        {listarEstadoObra.map(Item => (
                                            <option key={Item.id} value={Item.id}>
                                                {Item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div class="input-box">
                                    <span class="details">Presupuesto Total</span>
                                    <input type="number" placeholder="Escribe el Presupuesto Total" 
                                        name='presupuesto_total'
                                        className='form-control'
                                        value={presupuesto_total}
                                        onChange={(e) => setPresupuesto_total(e.target.value)}
                                    />
                                </div>
                                {/* <div class="input-box">
                                    <span class="details">Costo final</span>
                                    <input type="number" placeholder="Escribe el costo real" 
                                        name='costo_real'
                                        className='form-control'
                                        value={costo_real}
                                        onChange={(e) => setCosto_real(e.target.value)}
                                    />
                                </div> */}
                                <div class="input-box">
                                    <span class="details">Fecha de Inicio de la Obra</span>
                                    <input type="date" placeholder="Seleccion la fecha de Inicio de la Obra" 
                                        name='fecha_inicio'
                                        className='form-control'
                                        value={fecha_inicio}
                                        onChange={(e) => setFecha_inicio(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Fecha de Fin estimada de la Obra</span>
                                    <input type="date" placeholder="Seleccion la fecha de fin estimada de la Obra" 
                                        name='fecha_fin_estimada'
                                        className='form-control'
                                        value={fecha_fin_estimada}
                                        onChange={(e) => setFecha_fin_estimada(e.target.value)} 
                                    />
                                </div>
                                <div className="input-box">
                                    <span className="details">Tipo de Obra</span>
                                    <select name="tipoObra" className="form-control estado" value={idTipoObra} onChange={(e) => setIdTipoObra(e.target.value)} required>
                                        <option value="" disabled>Selecciona un Tipo de obra</option>
                                        {listarTipoObra.map(Item => (
                                            <option key={Item.id} value={Item.id}>
                                                {Item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-box">
                                    <span className="details">Supervisor</span>
                                    <select name="empleados" className="form-control estado" value={idSupervisor} onChange={(e) => setIdSupervisor(e.target.value)} required>
                                        <option value="" disabled>Selecciona el supervisor</option>
                                        {listarEmpleados.map(Item => (
                                            <option key={Item.id} value={Item.id}>
                                                {Item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div class="input-box">
                                    <span class="details">Imagen de la obra</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!id} // Hacer requerido solo en creación
                                    />
                                    {preview && (
                                        <img 
                                            src={preview} 
                                            alt="Vista previa" 
                                            style={{ width: '200px', marginTop: '10px' }} 
                                        />
                                    )}
                                </div>

                                <div className='button'>
                                    <button type="submit" onClick={(e) => saveObras(e)}  className="app-content-headerButton space-button">
                                        <div class="btnfrom">
                                            {id ? 'Actualizar ' : 'Guardar '}
                                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <Link to={`/`}>
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

export default AddObrasComponent;
