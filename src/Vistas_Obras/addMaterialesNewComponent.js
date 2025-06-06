import React, { useState, useEffect } from 'react';
import MaterialService from '../services/materialService';
import { Link, useNavigate, useParams } from 'react-router-dom';
import unidadesService from '../services/unidadesService';
import TransaccionesMaterialesService from '../services/transaccionesMaterialesService';
import empleadosService from '../services/empleadosService';

export const AddMaterialesNewComponent = () => {
    const [nombre , setNombre] = useState("");
    const [descripcion , setDescripcion] = useState("");
    const [cantidad , setCantidad ] = useState("");
    const [idUnidad , setIdUnidad] = useState("");
    const [costo_unitario , setCosto_unitario] = useState("");
    const [imagen, setImagen] = useState(null); // Cambiado a null para File
    const [preview, setPreview] = useState(""); // Nueva estado para previsualización
    const { idObra } = useParams(); // Ahora recibes idObra de la URL

    const [listaUnidades, setListaUnidades] = useState([]);
    
    const [empleados, setEmpleados] = useState([]);
    const [idEmpleado, setIdEmpleado] = useState("");
    const [fecha, setFecha] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        unidadesService.getAllUnidades().then(response => {
            setListaUnidades(response.data);
        }).catch(error => {
            console.log("Error al obtener unidades:", error);
        });

        empleadosService.getAllEmpleados().then(response => {
            setEmpleados(response.data);
        }).catch(error => {
            console.log("Error al obtener empleados:", error);
        });
    }, [idObra]);
    
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

    const saveMateriales = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('cantidad', 0); // Siempre guarda 0 en Materiales
        formData.append('idUnidad', idUnidad);
        formData.append('costo_unitario', costo_unitario);
        if (imagen) formData.append('imagen', imagen);

        if (!idEmpleado || Number(idEmpleado) === 0) {
        alert("Selecciona un empleado válido.");
        return;
    }

        try {
            const res = await MaterialService.createMateriales(formData);
            console.log("Respuesta de createMateriales:", res.data);
            const materialId = res.data.id; // <-- Solo esto

            alert("¡Material creado!");

            // Guardar en TransaccionesMateriales
            const transaccion = {
                cantidad: Number(cantidad),
                fecha: fecha,
                materiales: { id: materialId },
                obras: { id: Number(idObra) },
                empleados: { id: Number(idEmpleado) }
            };
            console.log("Transacción a enviar:", transaccion);
            try {
                await TransaccionesMaterialesService.createTransaccionesMateriales(transaccion);
                alert("¡Transacción registrada!");
            } catch (err) {
                console.error("Error al guardar transacción:", err.response ? err.response.data : err);
                alert("Error al guardar la transacción: " + (err.response?.data?.message || err.message));
            }

            // Redirige si quieres
            navigate(`/obras/materiales/${idObra}`);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar: " + error.message);
        }
    };


    return (
        <div class="app-content">
            <div class="app-content-header">
                <h1 class="app-content-headerText">Agregar Nuevo Material a la Obra</h1>
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
                        <form onSubmit={saveMateriales}>
                            <div class="user-details">
                                <div class="input-box">
                                    <span class="details">Nombre</span>
                                    <input type="text" placeholder="Escribe el nombre del material" 
                                        name='nombre'
                                        className='form-control'
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Descripcion</span>
                                    <input type="text" placeholder="Escribe la descripcion del material" 
                                        name='descripcion'
                                        className='form-control'
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Cantidad</span>
                                    <input type="number" placeholder="Escribe la cantidad de Materiales" 
                                        name='cantidad'
                                        className='form-control'
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="input-box">
                                    <span className="details">Unidad</span>
                                    <select name="unidad" className="form-control estado" value={idUnidad} onChange={(e) => setIdUnidad(e.target.value)} required>
                                        <option value="" disabled>Selecciona una unidad</option>
                                        {listaUnidades.map(unidadItem => (
                                            <option key={unidadItem.id} value={unidadItem.id}>
                                                {unidadItem.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div class="input-box">
                                    <span class="details">Costo Unitario</span>
                                    <input type="number" placeholder="Escribe el costo unitario del Material" 
                                        name='costo_unitario'
                                        className='form-control'
                                        value={costo_unitario}
                                        onChange={(e) => setCosto_unitario(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div class="input-box">
                                    <span class="details">Imagen del material</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {preview && (
                                        <img 
                                            src={preview} 
                                            alt="Vista previa" 
                                            style={{ width: '200px', marginTop: '10px' }} 
                                        />
                                    )}
                                </div>

                                {/* Campos para la transacción */}
                                <div className="input-box">
                                    <span className="details">Empleado que ingresa el material</span>
                                    <select
                                        className="form-control estado"
                                        value={idEmpleado}
                                        onChange={e => setIdEmpleado(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecciona un empleado</option>
                                        {empleados.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.nombre} {emp.apePaterno} {emp.apeMaterno}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-box">
                                    <span className="details">Fecha de ingreso</span>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fecha}
                                        onChange={e => setFecha(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className='button'>
                                    <button type="submit" onClick={(e) => saveMateriales(e)}  className="app-content-headerButton space-button">
                                        <div class="btnfrom">
                                            Guardar
                                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>

                                    <Link to={`/obras/materiales/${idObra}`}>
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

export default AddMaterialesNewComponent;
