import React, { useState, useEffect } from 'react';
import herramientaService from '../services/herramientaService';
import { Link, useNavigate, useParams } from 'react-router-dom';


export const AddHerramientasComponent = () => {
    const [nombre , setNombre] = useState("");
    const [descripcion , setDescripcion] = useState("");
    const [cantidad , setCantidad ] = useState("");
    const [estado , setEstado ] = useState("");
    const [costo_unitario , setCosto_unitario ] = useState("");
    //const [imagen, setImagen] = useState("");
    const [imagen, setImagen] = useState(null); // Cambiado a null para File
    const [preview, setPreview] = useState(""); // Nueva estado para previsualización
    const { id } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        console.log("ID de la URL:", id); // Verifica que se esté obteniendo correctamente el id
        if (id) {
            herramientaService.getHerramientasById(id).then((response) => {
                const herramienta = response.data;
                setNombre(herramienta.nombre);
                setDescripcion(herramienta.descripcion);
                setCantidad(herramienta.cantidad);
                setEstado(herramienta.estado);
                setCosto_unitario(herramienta.costo_unitario);
                //setImagen(herramienta.imagen);
                // Mostrar imagen existente si hay
                if (herramienta.imagen) {
                    setPreview(`http://localhost:8060/Imagenes-contructora/${herramienta.imagen}`);
                }
            }).catch(error => {
                console.log("Error al obtener herramienta:", error);
            });
        }
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

    // Modificado: Enviar con FormData
    const saveHerramientas = (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('cantidad', cantidad);
        formData.append('estado', estado);
        formData.append('costo_unitario', costo_unitario);
        if (imagen) formData.append('imagen', imagen);
        if (id) formData.append('id', id);

        if (id) {
            herramientaService.updateHerramientas(formData).then(() => {
                alert("Se actualizó correctamente");
                navigate("/herramientas");
            }).catch(console.error);
        } else {
            herramientaService.createHerramientas(formData).then(() => {
                navigate("/herramientas");
            }).catch(console.error);
        }
    }

    /*const saveHerramientas = (e) => {
        e.preventDefault();
        const herramientas = {
            id: id ? parseInt(id) : null,  
            nombre,
            descripcion,
            cantidad,
            estado,
            costo_unitario,
            imagen,
        };
    
        if (id) {
            herramientaService.updateHerramientas(herramientas).then((response) => {
                console.log(response);
                alert("Se actualizó correctamente");
                navigate("/herramientas");
            }).catch(error => {
                console.log(error);
            });
        } else {
            herramientaService.createHerramientas(herramientas).then((response) => {
                console.log(response);
                navigate("/");
            }).catch(error => {
                console.log(error);
            });
        }
    }*/
    
    

    const title = id ? 'Actualizar Herramienta' : 'Registro de Herramienta';

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
                        <form onSubmit={saveHerramientas}>
                            <div class="user-details">
                                <div class="input-box">
                                    <span class="details">Nombre</span>
                                    <input type="text" placeholder="Escribe el nombre de la herramientas" 
                                        name='nombre'
                                        className='form-control'
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">descripcion</span>
                                    <input type="text" placeholder="Escribe el nombre de la descripcion" 
                                        name='descripcion'
                                        className='form-control'
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Cantidad</span>
                                    <input type="number" placeholder="Escribe la cantidad de herramientas" 
                                        name='cantidad'
                                        className='form-control'
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="input-box">
                                    <span className="details">Estado</span>
                                    <select 
                                        name="estado"
                                        className="form-control estado"
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona un estado</option>
                                        <option value="Operativa">Operativa</option>
                                        <option value="En mantenimiento">En mantenimiento</option>
                                        <option value="Dañada">Dañada</option>
                                    </select>
                                </div>
                                <div class="input-box">
                                    <span class="details">Costo Unitario</span>
                                    <input type="number" placeholder="Escribe la cantidad de herramientas" 
                                        name='costo_unitario'
                                        className='form-control'
                                        value={costo_unitario}
                                        onChange={(e) => setCosto_unitario(e.target.value)} 
                                        required
                                    />
                                </div>
                                {/* <div class="input-box">
                                    <span class="details">Imagen de la herramienta</span>
                                    <input type="file" accept="image/*"
                                        name='imagen'
                                        onChange={(e) => setImagen(e.target.value)} 
                                        required
                                    />
                                </div> */}
                                <div class="input-box">
                                    <span class="details">Imagen de la herramienta</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        // value={imagen}
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
                                {/* <div class="image-preview">
                                    <img id="preview" src="" alt="Vista previa de la imagen" style="width: 200px; display: none; margin-top: 10px;"/>
                                </div> */}
                                <div className='button'>
                                    <button type="submit" onClick={(e) => saveHerramientas(e)}  className="app-content-headerButton space-button">
                                        <div class="btnfrom">
                                            {id ? 'Actualizar ' : 'Guardar '}
                                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    {/* <Link to="/herramientas" className='btn btn-danger mb-2'>Cancelar</Link> */}
                                    <Link to={`/herramientas`}>
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

export default AddHerramientasComponent;
