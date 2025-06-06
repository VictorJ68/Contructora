import React, { useCallback, useEffect, useState } from 'react';
import MaterialService from '../services/materialService';
import TransaccionesMaterialesService from '../services/transaccionesMaterialesService';
import { Link, useParams } from 'react-router-dom';

const VistaMaterialesComponent = () => {
    const { idObra } = useParams();
    const [materiales, setMateriales] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const materialesPerPage = 8;

    const [showEditModal, setShowEditModal] = useState(false);
    const [editTransaccion, setEditTransaccion] = useState(null);
    const [editCantidad, setEditCantidad] = useState("");
    const [editErrores, setEditErrores] = useState({});

    const listarMateriales = useCallback(() => {
        TransaccionesMaterialesService.getAllTransaccionesMateriales(idObra)
            .then(response => {
                setMateriales(response.data);
            })
            .catch(error => {
                console.error("Error al obtener materiales:", error);
            });
    }, [idObra]);

    useEffect(() => {

        listarMateriales();
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

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            listarMateriales();
            return;
        }

        // Llama al servicio que busca por nombre/desc de material o nombre/apellidos de empleado
        TransaccionesMaterialesService.searchMaterialesPorObra(idObra, text)
            .then(response => {
                setMateriales(response.data);
            })
            .catch(error => {
                console.error("Error al buscar materiales:", error);
                setMateriales([]); // Limpia la lista si hay error
            });
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

    //ELIMINAR
    const deleteMateriales = async (idTransaccion, nombre) => {
        const transaccion = materiales.find(m => m.id === idTransaccion);
        if (!transaccion) {
            alert("No se encontró la transacción.");
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar el material "${nombre}"?`)) {
            try {
                // 1. Sumar la cantidad al material original
                const material = transaccion.materiales;
                const nuevaCantidad = Number(material.cantidad) + Number(transaccion.cantidad);

                // Prepara formData para actualizar el material
                const formData = new FormData();
                formData.append("id", material.id);
                formData.append("nombre", material.nombre);
                formData.append("descripcion", material.descripcion);
                formData.append("cantidad", nuevaCantidad);
                formData.append("estado", material.estado);
                formData.append("costo_unitario", material.costo_unitario);
                if (material.imagen) {
                    formData.append("imagen", material.imagen);
                }

                await MaterialService.updateMateriales(formData);

                // 2. Elimina la transacción
                await TransaccionesMaterialesService.deleteTransaccionesMateriales(idTransaccion);

                listarMateriales();
                alert("Material eliminado correctamente y cantidad restablecida.");
            } catch (error) {
                console.log(error);
                alert("Error al eliminar el Material o actualizar la cantidad.");
            }
        }
    };
    
    const openEditModal = (transaccion) => {
        setEditTransaccion(transaccion);
        setEditCantidad(transaccion.cantidad);
        setEditErrores({});
        setShowEditModal(true);
    };
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditTransaccion(null);
        setEditCantidad("");
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editTransaccion) return;

        let errores = {};
        if (!editCantidad || Number(editCantidad) < 1) {
            errores.cantidad = "Cantidad inválida";
        }
        setEditErrores(errores);
        if (Object.keys(errores).length > 0) return;

        try {
            const diferencia = Number(editCantidad) - Number(editTransaccion.cantidad);
            const material = editTransaccion.materiales;
            const nuevaCantidadMaterial = Number(material.cantidad) - diferencia;

            if (nuevaCantidadMaterial < 0) {
                setEditErrores({ cantidad: "No hay suficiente material en almacén." });
                return;
            }

            // Actualiza el material
            const formData = new FormData();
            formData.append("id", material.id);
            formData.append("nombre", material.nombre);
            formData.append("descripcion", material.descripcion);
            formData.append("cantidad", nuevaCantidadMaterial);
            formData.append("estado", material.estado);
            formData.append("costo_unitario", material.costo_unitario);
            if (material.imagen) {
                formData.append("imagen", material.imagen);
            }
            await MaterialService.updateMateriales(formData);

            // Actualiza la transacción (envía el objeto completo, con el id adentro)
            const transData = {
                ...editTransaccion,
                cantidad: Number(editCantidad)
            };
            await TransaccionesMaterialesService.updateTransaccionesMateriales(transData);

            closeEditModal();
            listarMateriales();
            alert("Transacción actualizada correctamente.");
            listarMateriales();
        } catch (error) {
            setEditErrores({ cantidad: "Error al actualizar." });
        }
    };


    return (
        <div className='app-content'>
            <div class="app-content-header">
                <h1 class="app-content-headerText">Materiales de la Obra</h1>
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
                    placeholder="Buscar por nombre o descripción de material, o por nombre o apellidos de empleado..."
                    title='Buscar por nombre o descripción de material, o por nombre o apellidos de empleado'                    
                    type="text"
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                />
                <div class="app-content-actions-wrapper">
                    <Link to={`/obras/add-materiales-new/${idObra}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Material Nuevo</button></Link>
                    <Link to={`/obras/add-materiales-exist/${idObra}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Material Existente</button></Link>
                    <Link to={`/obras/vista/${idObra}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Regresar</button></Link>

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
                    <div class="product-cell stock">Fecha de ingreso<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Nombre<button class="sort-button">
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
                                src={`http://localhost:8060/Imagenes-contructora/${tm.materiales?.imagen}`} 
                                alt={tm.nombre} 
                            />
                        </div>

                        <div className="product-cell category"><span className="cell-label">Nombre:</span> {tm.materiales?.nombre}</div>
                        <div className="product-cell sales"><span className="cell-label">Descripcion:</span> {tm.materiales?.descripcion}</div>
                        <div className="product-cell sales"><span className="cell-label">Fecha de ingreso:</span> {tm.fecha}</div>
                        <div className="product-cell sales"><span className="cell-label">Nombre del que lo imgreso:</span> {tm.empleados?.nombre} {tm.empleados?.apePaterno} {tm.empleados?.apeMaterno}</div>
                        <div className="product-cell stock"><span className="cell-label">Cantidad:</span> {tm.cantidad}</div>
                        <div className="product-cell sales">
                            <span className="cell-label">Unidad:</span> {tm.materiales?.unidades?.nombre || "Sin unidad"}
                        </div>
                        <div className="product-cell sales"><span className="cell-label">Costo Unitario:</span> {tm.materiales?.costo_unitario}</div>
                        <div className="product-cell actions">
                            <button className='app-content-headerButton' title='Editar' onClick={() => openEditModal(tm)}>
                                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                                    </svg>
                            </button>
                            
                            <button className='app-content-headerButton' title='Eliminar' onClick={() => deleteMateriales(tm.id, tm.materiales?.nombre)}>
                                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
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
            {showEditModal && editTransaccion && (
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
                        }}>Editar Cantidad</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Cantidad:</label>
                                    <input
                                        type="number"
                                        value={editCantidad}
                                        min={1}
                                        max={Number(editTransaccion.cantidad) + Number(editTransaccion.materiales.cantidad)}
                                        onChange={e => setEditCantidad(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    />
                                    {editErrores.cantidad && <div style={{color: "red", fontSize: 13}}>{editErrores.cantidad}</div>}
                                    <small style={{ color: "#888" }}>
                                        Máximo permitido: {Number(editTransaccion.cantidad) + Number(editTransaccion.materiales.cantidad)}
                                    </small>
                                </div>
                            </div>
                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                                marginTop: 28
                            }}>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
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

export default VistaMaterialesComponent;
