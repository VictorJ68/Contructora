import React, { useState, useEffect } from 'react';
import herramientaService from '../services/herramientaService';
import entradaHerramientasService from '../services/entradaHerramientasService';
import empleadosService from '../services/empleadosService';
import { Link, useNavigate, useParams } from 'react-router-dom';


export const AddHerramientaNewComponent = () => {
    const [nombre , setNombre] = useState("");
    const [descripcion , setDescripcion] = useState("");
    const [cantidad , setCantidad ] = useState("");
    const [estado , setEstado ] = useState("");
    const [costo_unitario , setCosto_unitario ] = useState("");
    //const [imagen, setImagen] = useState("");
    const [imagen, setImagen] = useState(null); // Cambiado a null para File
    const [preview, setPreview] = useState(""); // Nueva estado para previsualización
    const [empleados, setEmpleados] = useState([]);
    const [empleadoId, setEmpleadoId] = useState("");
    const [fecha, setFecha] = useState("");
    const { idObra } = useParams(); // Cambia a idObra si tu ruta es /obras/:idObra/herramienta/nueva
    const { id } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        empleadosService.getAllEmpleados().then(res => setEmpleados(res.data));
        console.log("ID de la URL:", idObra); // Verifica que se esté obteniendo correctamente el id
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
    }, [idObra, id]);

    // Manejar archivo y previsualización
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

    // Formatear fecha a dd-MM-yyyy
    function formatDate(fecha) {
        if (!fecha) return "";
        const [yyyy, mm, dd] = fecha.split("-");
        return `${dd}-${mm}-${yyyy}`;
    }

    const saveHerramientas = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!nombre || !descripcion || !cantidad || !estado || !costo_unitario || !empleadoId || !fecha) {
            alert("Todos los campos son obligatorios");
            return;
        }

        // 1. Guardar la herramienta con cantidad 0
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('cantidad', 0); // Siempre 0
        formData.append('estado', estado);
        formData.append('costo_unitario', costo_unitario);
        if (imagen) formData.append('imagen', imagen);

        try {
            const herramientaResp = await herramientaService.createHerramientas(formData);
            console.log("Respuesta de createHerramientas:", herramientaResp);
            const herramientaGuardada = herramientaResp.data.herramienta;
            console.log("Herramienta guardada:", herramientaGuardada);

            // 2. Guardar la entrada en EntradaHerramientas con la cantidad real
            const entradaData = {
                herramientas: { id: herramientaGuardada.id },
                obras: { id: Number(idObra) },
                empleados: { id: Number(empleadoId) },
                cantidad: Number(cantidad),
                fecha: formatDate(fecha)
            };

            console.log("Datos enviados a EntradaHerramientasService:", entradaData);

            await entradaHerramientasService.agregarHerramientaAObra(entradaData);

            alert("Herramienta y entrada guardadas correctamente");
            navigate(`/obras/herramientas/${idObra}`);
        } catch (error) {
            alert("Error al guardar la herramienta o la entrada");
            console.error("Error detallado:", error.response ? error.response.data : error);
        }
    };
    
    

    const title = 'Registrar y Asignar Herramienta a Obra';

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
                            <div className="user-details">
                                <div className="input-box">
                                    <span className="details">Nombre</span>
                                    <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                </div>
                                <div className="input-box">
                                    <span className="details">Descripción</span>
                                    <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
                                </div>
                                <div className="input-box">
                                    <span className="details">Cantidad</span>
                                    <input type="number" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} required min={1} />
                                </div>
                                <div className="input-box">
                                    <span className="details">Estado</span>
                                    <select value={estado} onChange={e => setEstado(e.target.value)} className="form-control estado" required>
                                        <option value="">Selecciona un estado</option>
                                        <option value="Operativa">Operativa</option>
                                        <option value="En mantenimiento">En mantenimiento</option>
                                        <option value="Dañada">Dañada</option>
                                    </select>
                                </div>
                                <div className="input-box">
                                    <span className="details">Costo Unitario</span>
                                    <input type="number" placeholder="Costo Unitario" value={costo_unitario} onChange={e => setCosto_unitario(e.target.value)} required min={0} />
                                </div>
                                <div className="input-box">
                                    <span className="details">Imagen de la herramienta</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} required />
                                    {preview && (
                                        <img src={preview} alt="Vista previa" style={{ width: '200px', marginTop: '10px' }} />
                                    )}
                                </div>
                                <div className="input-box">
                                    <span className="details">Empleado responsable</span>
                                    <select value={empleadoId} className="form-control estado" onChange={e => setEmpleadoId(e.target.value)} required>
                                        <option value="">Seleccione empleado</option>
                                        {empleados.map(e => (
                                            <option key={e.id} value={e.id}>{`${e.nombre} ${e.apePaterno} ${e.apeMaterno}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-box">
                                    <span className="details">Fecha de asignación</span>
                                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
                                </div>
                                <div className='button'>
                                    <button type="submit" className="app-content-headerButton space-button">
                                        <div className="btnfrom">
                                            Guardar y Asignar
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <Link to={idObra ? `/obras/herramientas/${idObra}` : "/obras/herramientas"}>
                                        <button type="button" className="app-content-headerButton">
                                            <div className="btnfrom">
                                                Cancelar
                                                {/* ...icon... */}
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

export default AddHerramientaNewComponent;
