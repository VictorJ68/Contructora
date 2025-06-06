import React, { useEffect, useState, useCallback } from 'react';
import TransaccionesMaterialesService from '../services/transaccionesMaterialesService';
import empleadosService from '../services/empleadosService';
import MaterialService from '../services/materialService';
import { Link, useParams } from 'react-router-dom';

const AddMaterialesExistComponent = () => {
    const { idObra } = useParams();
    const [materiales, setMateriales] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const materialesPerPage = 8;

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [form, setForm] = useState({
        idEmpleado: "",
        cantidad: "",
        fecha: ""
    });
    const [errores, setErrores] = useState({});

    const listarMateriales = useCallback(() => {
        TransaccionesMaterialesService.getAllMaterialesNoEnObra(idObra)
            .then(response => setMateriales(response.data))
            .catch(error => console.error("Error al obtener materiales:", error));
    }, [idObra]);

    useEffect(() => {

        listarMateriales();

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


        // Cleanup: Remover event listeners cuando el componente se desmonte
        return () => {
            if (gridButton) gridButton.removeEventListener("click", () => {});
            if (listButton) listButton.removeEventListener("click", () => {});
            if (modeSwitch) modeSwitch.removeEventListener("click", () => {});
        };
    }, [idObra, listarMateriales]);
    // const listarMateriales = () => {
    //     TransaccionesMaterialesService.getAllMaterialesNoEnObra(idObra)
    //         .then(response => {
    //             console.log("Datos recibidos:", response.data); // <-- Verifica qué datos llegan
    //             setMateriales(response.data); // <-- Guarda los datos en el estado
    //         })
    //         .catch(error => {
    //             console.error("Error al obtener materiales:", error);
    //         });
    // };

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            listarMateriales();
            return;
        }

        const filtrados = materiales.filter(m =>
            (m.nombre && m.nombre.toLowerCase().includes(text.toLowerCase())) ||
            (m.descripcion && m.descripcion.toLowerCase().includes(text.toLowerCase()))
        );
        setMateriales(filtrados);
    };
    
    const indexOfLast = currentPage * materialesPerPage;
    const indexOfFirst = indexOfLast - materialesPerPage;
    const current = materiales.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(materiales.length / materialesPerPage);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };


    // Modal helpers
    const openModal = (material) => {
        setSelectedMaterial(material);
        setShowModal(true);
        setForm({
            idEmpleado: "",
            cantidad: "",
            fecha: ""
        });
        setErrores({});
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMaterial(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let nuevosErrores = {};

        if (!form.idEmpleado) nuevosErrores.idEmpleado = "Falta llenar este campo";
        if (!form.cantidad) nuevosErrores.cantidad = "Falta llenar este campo";
        if (!form.fecha) nuevosErrores.fecha = "Falta llenar este campo";
        if (form.cantidad && selectedMaterial && Number(form.cantidad) > selectedMaterial.cantidad) {
            nuevosErrores.cantidad = `No puede ser mayor a ${selectedMaterial.cantidad}`;
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) return;

        // Restar la cantidad antes de guardar la transacción
        const nuevaCantidad = selectedMaterial.cantidad - Number(form.cantidad);

        // Prepara el formData para updateMateriales
        const formData = new FormData();
        formData.append("id", selectedMaterial.id);
        formData.append("nombre", selectedMaterial.nombre);
        formData.append("descripcion", selectedMaterial.descripcion);
        formData.append("cantidad", nuevaCantidad);
        formData.append("estado", selectedMaterial.estado);
        formData.append("costo_unitario", selectedMaterial.costo_unitario);
        if (selectedMaterial.imagen) {
            formData.append("imagen", selectedMaterial.imagen);
        }

        try {
            await MaterialService.updateMateriales(formData);

            const data = {
                cantidad: Number(form.cantidad),
                fecha: form.fecha.split('-').reverse().join('-'), // de yyyy-mm-dd a dd-MM-yyyy
                materiales: { id: selectedMaterial.id },
                obras: { id: Number(idObra) },
                empleados: { id: Number(form.idEmpleado) }
            };

            await TransaccionesMaterialesService.createTransaccionesMateriales(data);  

            closeModal();
            listarMateriales();
            alert("Material agregado a la obra");
        } catch (error) {
            console.error("Error detalle:", error);
            alert("Error al actualizar el material o agregar la transacción");
        }
    };



    return (
        <div className='app-content'>
            <div class="app-content-header">
                <h1 class="app-content-headerText">Materiales existentes de la Obra</h1>
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
                    <Link to={`/obras/materiales/${idObra}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Regresar</button></Link>

                    <button class="action-button list active" title="Vista organizada en lista">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-list"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                    <button class="action-button grid" title="Vista organizada en cuadricula">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                </div>
            </div>
            <div class="products-area-wrapper tableView">
                <div class="products-header">
                    <div class="product-cell image">
                        Imagen
                        <button class="sort-button">
                            <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                        </button>
                    </div>
                    <div class="product-cell status-cell">Nombre<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Descripcion<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Cantidad<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Unidad<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Costo Unitario<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell price">Acciones<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                </div>

                {current.map(tm => (
                    <div key={tm.id} className="products-row">

                        <div className="product-cell image">
                            <img 
                                src={`http://localhost:8060/Imagenes-contructora/${tm.imagen}`} 
                                alt={tm.nombre} 
                            />
                        </div>

                        <div className="product-cell category"><span className="cell-label">Nombre:</span> {tm.nombre}</div>
                        <div className="product-cell sales"><span className="cell-label">Descripcion:</span> {tm.descripcion}</div>
                        <div className="product-cell stock"><span className="cell-label">Cantidad:</span> {tm.cantidad}</div>
                        <div className="product-cell sales">
                            <span className="cell-label">Unidad:</span> {tm.unidades?.nombre || "Sin unidad"}
                        </div>
                        <div className="product-cell sales"><span className="cell-label">Costo Unitario:</span> {tm.costo_unitario}</div>
                        
                        <div className="product-cell actions"  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <button 
                                className='app-content-headerButton' 
                                title='Agregar'
                                onClick={() => openModal(tm)}
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
                        }}>Agregar Material a la Obra</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Empleado:</label>
                                    <select
                                        name="idEmpleado"
                                        value={form.idEmpleado}
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
                                    {errores.idEmpleado && <div style={{color: "red", fontSize: 13}}>{errores.idEmpleado}</div>}
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
                                        max={selectedMaterial ? selectedMaterial.cantidad : undefined}
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    />
                                    {errores.cantidad && <div style={{color: "red", fontSize: 13}}>{errores.cantidad}</div>}
                                    {selectedMaterial && (
                                        <small style={{ color: "#888" }}>
                                            Máximo disponible: {selectedMaterial.cantidad}
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
    );
};

export default AddMaterialesExistComponent;
