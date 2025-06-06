import React, { useCallback, useEffect, useState } from 'react';
import entradaHerramientasService from '../services/entradaHerramientasService';
import empleadosService from '../services/empleadosService';
import herramientaService from '../services/herramientaService';
import { Link, useParams } from 'react-router-dom';


export const AddHerramientaexistComponent = () => {
    const [herramientas, setHerramientas] = useState([]);
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [selectedHerramienta, setSelectedHerramienta] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [form, setForm] = useState({
        empleados: { id: "" },
        cantidad: "",
        fecha: ""
    });
    const [errores, setErrores] = useState({});

    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const herramientasPerPage = 8;

    const listarHerramientas = useCallback(() => {
        entradaHerramientasService.getHerramientasNoEnObra(id)
            .then(response => setHerramientas(response.data))
            .catch(error => console.error("Error al obtener herramientas no en obra:", error));
    }, [id]); // agrega aquí las dependencias necesarias, por ejemplo 'id'

    useEffect(() => {
        listarHerramientas();
        empleadosService.getAllEmpleados().then(res => setEmpleados(res.data));

        
        const gridButton = document.querySelector(".grid");
        const listButton = document.querySelector(".list");
        const modeSwitch = document.querySelector(".mode-switch");

        if (gridButton && listButton) {
            gridButton.addEventListener("click", () => {
                document.querySelector(".list").classList.remove("active");
                document.querySelector(".grid").classList.add("active");
                document.querySelector(".products-area-wrapper").classList.add("gridView");
                document.querySelector(".products-area-wrapper").classList.remove("tableView");
            });

            listButton.addEventListener("click", () => {
                document.querySelector(".list").classList.add("active");
                document.querySelector(".grid").classList.remove("active");
                document.querySelector(".products-area-wrapper").classList.remove("gridView");
                document.querySelector(".products-area-wrapper").classList.add("tableView");
            });
    
            // --------> AQUÍ FORZAMOS EL INICIO EN GRID VIEW
            gridButton.click();
        }

        return () => {
            if (gridButton) gridButton.removeEventListener("click", () => {});
            if (listButton) listButton.removeEventListener("click", () => {});
            if (modeSwitch) modeSwitch.removeEventListener("click", () => {});
        };
    }, [id, listarHerramientas]);

    

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            listarHerramientas();
            return;
        }

        const filtrados = herramientas.filter(h =>
            (h.nombre && h.nombre.toLowerCase().includes(text.toLowerCase())) ||
            (h.descripcion && h.descripcion.toLowerCase().includes(text.toLowerCase()))
        );
        setHerramientas(filtrados);
    };

    // Paginación
    const indexOfLast = currentPage * herramientasPerPage;
    const indexOfFirst = indexOfLast - herramientasPerPage;
    const current = herramientas.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(herramientas.length / herramientasPerPage);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openModal = (herramienta) => {
        setSelectedHerramienta(herramienta);
        setShowModal(true);
        setForm({
            empleados: { id: "" },
            cantidad: "",
            fecha: ""
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedHerramienta(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "empleados") {
            setForm({ ...form, empleados: { id: value } });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    function formatDate(fecha) {
        if (!fecha) return "";
        const [yyyy, mm, dd] = fecha.split("-");
        return `${dd}-${mm}-${yyyy}`;
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        let nuevosErrores = {};

        if (!form.empleados.id) nuevosErrores.empleados = "Falta llenar este campo";
        if (!form.cantidad) nuevosErrores.cantidad = "Falta llenar este campo";
        if (!form.fecha) nuevosErrores.fecha = "Falta llenar este campo";
        if (form.cantidad && selectedHerramienta && Number(form.cantidad) > selectedHerramienta.cantidad) {
            nuevosErrores.cantidad = `No puede ser mayor a ${selectedHerramienta.cantidad}`;
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) return;
        
        const data = {
            herramientas: { id: Number(selectedHerramienta.id) },
            obras: { id: Number(id) },
            empleados: { id: Number(form.empleados.id) },
            cantidad: Number(form.cantidad),
            fecha: formatDate(form.fecha)
        };
        console.log(data);
        entradaHerramientasService.agregarHerramientaAObra(data)
            .then(() => {
                // Actualiza la herramienta restando la cantidad
                const nuevaCantidad = selectedHerramienta.cantidad - Number(form.cantidad);
                // Prepara el formData para updateHerramientas (ajusta los campos según tu backend)
                const formData = new FormData();
                formData.append("id", selectedHerramienta.id);
                formData.append("nombre", selectedHerramienta.nombre);
                formData.append("descripcion", selectedHerramienta.descripcion);
                formData.append("cantidad", nuevaCantidad);
                formData.append("estado", selectedHerramienta.estado);
                formData.append("costo_unitario", selectedHerramienta.costo_unitario);
                formData.append("imagen", selectedHerramienta.imagen);

                herramientaService.updateHerramientas(formData)
                    .then(() => {
                        closeModal();
                        listarHerramientas();
                        alert("Herramienta agregada a la obra");
                    })
                    .catch(() => alert("Error al actualizar la herramienta"));
            })
            .catch(() => alert("Error al agregar herramienta"));
    };

    return (
        <div class="app-content">
            <div class="app-content-header">
                <h1 class="app-content-headerText">Agregar Herramienta a la Obra</h1>
                <button class="mode-switch" title="Switch Theme">
                    <svg class="moon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="24" height="24" viewBox="0 0 24 24">
                    <defs></defs>
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                    </svg>
                </button>
            </div>
            <div class="app-content-actions">
                <input
                    className="search-bar"
                    placeholder="Buscar por nombre o descripción..."
                    type="text"
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                />
                <div class="app-content-actions-wrapper">
                    <Link to={`/obras/herramientas/${id}`}>
                        <button className="app-content-headerButton" style={{ marginRight: 10 }}>Regresar</button>
                    </Link>
                    
                    <button class="action-button list active" title="Vista organizada en lista">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-list"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                    <button class="action-button grid" title="Vista organizada en cuadricula">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                </div>
            </div>
            <div className="products-area-wrapper tableView">
                <div className="products-header">
                    <div class="product-cell image">Imagen<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell status-cell">Nombre<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Descripcion<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Cantidad<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Estado<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Costo Unitario<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell price">Acciones<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                </div>
                {current.map(h => (
                    <div key={h.id} className="products-row">

                        <div className="product-cell image">
                            <img 
                                src={`http://localhost:8060/Imagenes-contructora/${h.imagen}`} 
                                alt={h.nombre} 
                            />
                        </div>

                        <div className="product-cell category"><span className="cell-label">Nombre:</span> {h.nombre}</div>
                        <div className="product-cell sales"><span className="cell-label">Descripcion:</span> {h.descripcion}</div>
                        <div className="product-cell stock"><span className="cell-label">Cantidad:</span> {h.cantidad}</div>
                        <div className="product-cell stock"><span className="cell-label">Estado:</span> {h.estado}</div>
                        <div className="product-cell stock"><span className="cell-label">Costo Unitario:</span> {h.costo_unitario}</div>

                        <div className="product-cell actions" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <button
                                className='app-content-headerButton'
                                title='Agregar'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(h);
                                }}
                            >
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.707 5.707a1 1 0 0 0-1.414-1.414l-.293.293V12a1 1 0 1 0-2 0v2.586l-.293-.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l2-2Z" clipRule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Botones de paginación */}
            <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <button
                    class="app-content-headerButton"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ marginRight: 10 }}
                >
                    Anterior
                </button>
                <span class="app-content-headerText">Página {currentPage} de {totalPages}</span>
                <button
                    class="app-content-headerButton"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ marginLeft: 10 }}
                >
                    Siguiente
                </button>
            </div>
            {showModal && (
                <div className="modal-backdrop" style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: "#fff",
                        padding: "32px 28px",
                        borderRadius: "16px",
                        minWidth: 340,
                        maxWidth: 400,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        position: "relative"
                    }}>
                        <h2 style={{
                            marginBottom: 24,
                            fontWeight: 600,
                            fontSize: 22,
                            color: "#222"
                        }}>Agregar Herramienta a la Obra</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Empleado:</label>
                                    <select
                                        name="empleados"
                                        value={form.empleados.id}
                                        onChange={handleFormChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    >
                                        <option value="">Seleccione empleado</option>
                                        {empleados.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {`${e.nombre} ${e.apePaterno} ${e.apeMaterno}`}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.empleados && <div style={{color: "red", fontSize: 13}}>{errores.empleados}</div>}
                                </div>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Cantidad:</label>
                                    <input
                                        type="number"
                                        name="cantidad"
                                        value={form.cantidad}
                                        onChange={handleFormChange}
                                        required
                                        min={1}
                                        max={selectedHerramienta ? selectedHerramienta.cantidad : undefined}
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    />
                                    {errores.cantidad && <div style={{color: "red", fontSize: 13}}>{errores.cantidad}</div>}
                                    {selectedHerramienta && (
                                        <small style={{ color: "#888" }}>
                                            Máximo disponible: {selectedHerramienta.cantidad}
                                        </small>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Fecha:</label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        value={form.fecha}
                                        onChange={handleFormChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    />
                                </div>
                                {errores.fecha && <div style={{color: "red", fontSize: 13}}>{errores.fecha}</div>}
                            </div>
                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                                marginTop: 28
                            }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="app-content-headerButton"
                                    style={{
                                        background: "#f3f3f3",
                                        color: "#333",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 500,
                                        fontSize: 15,
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="app-content-headerButton"
                                    style={{
                                        background: "#2e7dff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 500,
                                        fontSize: 15,
                                        cursor: "pointer"
                                    }}
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddHerramientaexistComponent;
