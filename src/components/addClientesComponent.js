import React, { useState, useEffect } from 'react';
import clientesService from '../services/clientesService';
import { Link, useNavigate, useParams } from 'react-router-dom';


export const AddClientesComponent = () => {
    const [nombre , setNombre] = useState("");
    const [direccion , setDireccion] = useState("");
    const [telefono , setTelefono ] = useState("");
    const [correo , setCorreo ] = useState("");
    const [contacto , setContacto ] = useState("");
    const { id } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        console.log("ID de la URL:", id); // Verifica que se esté obteniendo correctamente el id
        if (id) {
            clientesService.getClientesById(id).then((response) => {
                const clientes = response.data;
                setNombre(clientes.nombre);
                setDireccion(clientes.direccion);
                setTelefono(clientes.telefono);
                setCorreo(clientes.correo);
                setContacto(clientes.contacto);
            }).catch(error => {
                console.log("Error al obtener clientes:", error);
            });
        }
    }, [id]);

    const saveClientes = (e) => {
        e.preventDefault();
        const clientes = {
            id: id ? parseInt(id) : null,  
            nombre,
            direccion,
            telefono,
            correo,
            contacto,
        };
    
        if (id) {
            clientesService.updateClientes(clientes).then((response) => {
                console.log(response);
                alert("Se actualizó correctamente");
                navigate("/clientes");
            }).catch(error => {
                console.log(error);
            });
        } else {
            clientesService.createClientes(clientes).then((response) => {
                console.log(response);
                navigate("/clientes");
            }).catch(error => {
                console.log(error);
            });
        }
    }
    
    

    const title = id ? 'Actualizar Cliente' : 'Registro de Cliente';

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
                        <form onSubmit={saveClientes}>
                            <div class="user-details">
                                <div class="input-box">
                                    <span class="details">Nombre</span>
                                    <input type="text" placeholder="Escribe el nombre del Cliente" 
                                        name='nombre'
                                        className='form-control'
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)} 
                                        required
                                    />
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
                                    <span class="details">Telefono</span>
                                    <input type="text" placeholder="Escribe el telefono" 
                                        name='telefono'
                                        className='form-control'
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)} 
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
                                    <span class="details">Contacto</span>
                                    <input type="text" placeholder="Escribe el contacto" 
                                        name='contacto'
                                        className='form-control'
                                        value={contacto}
                                        onChange={(e) => setContacto(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className='button'>
                                    {/* <button type="submit" onClick={(e) => saveClientes(e)}  className="btn btn-primary mb-2">{id ? 'Actualizar' : 'Registrar'}</button>
                                    <Link to="/clientes" className='btn btn-danger mb-2'>Cancelar</Link> */}

                                    <button type="submit" onClick={(e) => saveClientes(e)}  className="app-content-headerButton space-button">
                                        <div class="btnfrom">
                                            {id ? 'Actualizar ' : 'Guardar '}
                                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <Link to={`/clientes`}>
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

export default AddClientesComponent;
