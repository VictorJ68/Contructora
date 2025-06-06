import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import obrasService from '../services/obrasService';
import clientesService from '../services/clientesService';
import empleadosService from '../services/empleadosService';
import tipoObraService from '../services/tipoObraService';
import estadosObraService from '../services/estadosObraService';
import imagenesObraService from '../services/imagenesObraService';

export const VistaObrasComponent = () => {
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
    const [preview, setPreview] = useState(""); // Nueva estado para previsualización
    const { id } = useParams();

    const [listarCliente, setListaClientes] = useState([]);
    const [listarEmpleados, setListaEmpleados] = useState([]);
    const [listarTipoObra, setListaTipoObra] = useState([]);
    const [listarEstadoObra, setListaEstadoObra] = useState([]);

    const [imagenesObra, setImagenesObra] = useState([]);
    const [startIndex, setStartIndex] = useState(0); // Nuevo estado para el índice inicial

    const [showModal, setShowModal] = useState(false);


    // Usa useCallback para evitar la advertencia
    const listarImagenesObra = useCallback(() => {
        imagenesObraService.getAllImagenesObra(id)
            .then(response => {
                console.log("Datos recibidos:", response.data);
                setImagenesObra(response.data);
            })
            .catch(error => {
                console.error("Error al obtener obras:", error);
            });
    }, [id]); // depende de id

    useEffect(() => {
        listarImagenesObra();
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
    }, [id, listarImagenesObra]); // agrega listarImagenesObra a las dependencias

    const getNombreCliente = (id) => {
        const cliente = listarCliente.find(c => String(c.id) === String(id));
        return cliente ? cliente.nombre : id;
    };

    const getNombreEstadoObra = (id) => {
        const estadosObra = listarEstadoObra.find(c => String(c.id) === String(id));
        return estadosObra ? estadosObra.nombre : id;
    };

    const getNombreTipo = (id) => {
        const tipoObra = listarTipoObra.find(c => String(c.id) === String(id));
        return tipoObra ? tipoObra.nombre : id;
    };
    
    const getNombreSupervisor = (id) => {
        const empleados = listarEmpleados.find(c => String(c.id) === String(id));
        return empleados ? empleados.nombre : id;
    };

    const current = imagenesObra.slice(startIndex, startIndex + 3);
    const handlePrev = () => {
        setStartIndex(prev => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setStartIndex(prev => 
            Math.min(prev + 1, imagenesObra.length - 3)
        );
    };


    return (
        <div class="app-content">
            <div class="app-content-header">
                {/* <h1 class="app-content-headerText">{title}</h1> */}
                <h1 class="app-content-headerText">{nombre}</h1>
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
                    <div class="obra-flex-container">
                        {preview && ( <>
                            <div class="obra-img-preview" onClick={() => setShowModal(true)} style={{cursor: "zoom-in"}}>
                                <img src={preview} alt="Obra" />
                            </div>
                            {showModal && (
                                <div className="obra-modal" onClick={() => setShowModal(false)}>
                                    <img src={preview} alt="Obra grande" className="obra-modal-img" />
                                </div>
                            )}</>
                        )}
                    
                        <div class="vista-obras-content">
                            <div class="user-details">
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Nombre:</span> {nombre}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Cliente:</span> {getNombreCliente(idCliente)}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Direccion:</span> {direccion}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Fecha de creación:</span> {fecha}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Estado:</span> {getNombreEstadoObra(idEstadoObra)}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details">
                                        <span className="negrita-grande">Presupuesto total: </span> 
                                        ${Number(presupuesto_total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div class="input-box">
                                    <span class="details">
                                        <span className="negrita-grande">Costo final: </span> 
                                        ${Number(costo_real).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Fecha de inicio:</span> {fecha_inicio}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Fecha de finalizacion:</span> {fecha_fin_estimada}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Tipo:</span> {getNombreTipo(idTipoObra)}</span>
                                </div>
                                <div class="input-box">
                                    <span class="details"><span className="negrita-grande">Supervisor:</span> {getNombreSupervisor(idSupervisor)}</span>
                                </div>
                            </div>
                            <div className="botones-obras">
                                <Link to={`/obras/empleados/${id}`}>
                                    <button class="btn-simple" title='Ver Empleados'>
                                        Empleados
                                    </button>
                                </Link>
                                <Link to={`/obras/herramientas/${id}`}>
                                    <button class="btn-simple" title='Ver Herramientas'>
                                        Herramientas
                                    </button>
                                </Link>
                                <Link to={`/obras/materiales/${id}`}>
                                    <button class="btn-simple" title='Ver Materiales'>
                                        Materiales
                                    </button>
                                </Link>
                                <Link to={`/obras/pdf/${id}`}>
                                    <button class="btn-simple" title='Ver Materiales'>
                                        PDFs
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="imagenes-carrusel-container-wrapper" style={{position: "relative"}}>
                        <Link to={`/obras/imagenes/${id}`} className="ver-mas-carrusel">
                            Ver más
                        </Link>
                        <div className="imagenes-carrusel-container">
                            <button
                                className="carrusel-arrow left"
                                onClick={handlePrev}
                                aria-label="Anterior"
                                disabled={startIndex === 0}
                            >&#8592;</button>
                            <div className="imagenes-carrusel-lista" style={{overflow: "hidden"}}>
                                {current.map(imagenesObra => (
                                    <div key={imagenesObra.id} className="imagenes-carrusel-item">
                                        <div className="imagenes-carrusel-imgbox">
                                            <img 
                                                src={`http://localhost:8060/Imagenes-contructora/${imagenesObra.imagen}`} 
                                                alt={imagenesObra.imagen} 
                                            />
                                        </div>
                                        <div className="imagenes-carrusel-info">
                                            <div className="imagenes-carrusel-desc">{imagenesObra.descripcion}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="carrusel-arrow right"
                                onClick={handleNext}
                                aria-label="Siguiente"
                                disabled={startIndex >= imagenesObra.length - 3}
                            >&#8594;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VistaObrasComponent;
