import React, { useState, useEffect, useCallback } from 'react';
import entradaHerramientasService from '../services/entradaHerramientasService';
import herramientaService from '../services/herramientaService';
import { Link, useParams } from 'react-router-dom';


export const VistaHerramientasComponent = () => {
    const [herramientas, setHerramientas] = useState([]);
    const [cantidades, setCantidades] = useState({});    
    const [entradasInfo, setEntradasInfo] = useState({}); // { [herramientaId]: { fecha, empleado } }
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [cantidadSalida, setCantidadSalida] = useState("");
    const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PorPage = 20;
    const [herramientasOriginal, setHerramientasOriginal] = useState([]);

    const listarHerramientas = useCallback(() => {
        entradaHerramientasService.getHerramientasDisponiblesPorObra(id)
            .then(async response => {
                setHerramientas(response.data);
                setHerramientasOriginal(response.data);
                const cantidadesObj = {};
                const entradasObj = {};
                // Espera a que todas las promesas terminen antes de actualizar los estados
                await Promise.all(response.data.map(async (h) => {
                    try {
                        const res = await entradaHerramientasService.getCantidadHerramientaEnObra(id, h.id);
                        cantidadesObj[h.id] = res.data;

                        const entradaResp = await entradaHerramientasService.getEntradaPorObraYHerramienta(id, h.id);
                        const entrada = entradaResp.data;
                        if (entrada) {
                            let empleadoNombre = "";
                            if (entrada.empleados) {
                                empleadoNombre = [
                                    entrada.empleados.nombre || "",
                                    entrada.empleados.apePaterno || "",
                                    entrada.empleados.apeMaterno || ""
                                ].filter(Boolean).join(" ");
                            } else if (entrada.idEmpleado) {
                                empleadoNombre = entrada.idEmpleado;
                            }
                            entradasObj[h.id] = {
                                fecha: entrada.fecha || "-",
                                empleados: empleadoNombre || "-"
                            };
                        } else {
                            entradasObj[h.id] = { fecha: "-", empleados: "-" };
                        }
                    } catch (err) {
                        cantidadesObj[h.id] = "...";
                        entradasObj[h.id] = { fecha: "-", empleados: "-" };
                    }
                }));
                setCantidades(cantidadesObj);
                setEntradasInfo(entradasObj);
            })
            .catch(error => {
                console.error("Error al obtener herramientas disponibles:", error);
            });
    }, [id]);

    useEffect(() => {
        listarHerramientas();
        setCurrentPage(1);
        
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
    
            gridButton.click();
        }

        return () => {
            if (gridButton) gridButton.removeEventListener("click", () => {});
            if (listButton) listButton.removeEventListener("click", () => {});
            if (modeSwitch) modeSwitch.removeEventListener("click", () => {});
        };
    }, [id, listarHerramientas]);

    const handleConfirmarSalida = async () => {
        if (Number(cantidadSalida) > cantidades[herramientaSeleccionada.id]) {
            alert("No puedes regresar más de las que hay en la obra.");
            return;
        }
        if (!cantidadSalida || isNaN(cantidadSalida) || Number(cantidadSalida) <= 0) {
            alert("Ingresa una cantidad válida");
            return;
        }
        if (!herramientaSeleccionada) return;

        const cantidadActual = cantidades[herramientaSeleccionada.id] || 0;
        const nuevaCantidadHerramienta = Number(herramientaSeleccionada.cantidad) + Number(cantidadSalida);
        const nuevaCantidadEntrada = Number(cantidadActual) - Number(cantidadSalida);

        if (nuevaCantidadEntrada < 0) {
            alert("No puedes regresar más de las que hay en la obra.");
            return;
        }

        try {
            // Actualiza la herramienta
            const formData = new FormData();
            formData.append('id', herramientaSeleccionada.id);
            formData.append('nombre', herramientaSeleccionada.nombre);
            formData.append('descripcion', herramientaSeleccionada.descripcion);
            formData.append('cantidad', nuevaCantidadHerramienta);
            formData.append('estado', herramientaSeleccionada.estado);
            formData.append('costo_unitario', herramientaSeleccionada.costo_unitario);
            formData.append('imagen', herramientaSeleccionada.imagen);

            await herramientaService.updateHerramientas(formData);

            // Busca la entradaHerramienta correcta
            const entradaResp = await entradaHerramientasService.getEntradaPorObraYHerramienta(id, herramientaSeleccionada.id);
            const entrada = entradaResp.data;

            if (!entrada || !entrada.id) {
                alert("No se encontró la entrada de la herramienta en la obra.");
                return;
            }

            // Actualiza la entradaHerramienta
            await entradaHerramientasService.updateEntradaHerramienta({
                id: entrada.id,
                cantidad: nuevaCantidadEntrada
            });

            alert("Salida registrada correctamente");
            setShowModal(false);
            setCantidadSalida("");
            setHerramientaSeleccionada(null);
            listarHerramientas();
        } catch (error) {
            alert("Error al registrar la salida");
            console.error(error);
        }
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            // listarHerramientas();
            setHerramientas(herramientasOriginal);
            return;
        }
        const filtradas = herramientasOriginal.filter(h =>
            (h.nombre && h.nombre.toLowerCase().includes(text.toLowerCase())) ||
            (h.descripcion && h.descripcion.toLowerCase().includes(text.toLowerCase()))
        );
        setHerramientas(filtradas);
    };

    // Paginación
    const indexOfLast = currentPage * PorPage;
    const indexOfFirst = indexOfLast - PorPage;
    const current = herramientas.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(herramientas.length / PorPage);

    const goToPage = (pageNumber) => setCurrentPage(pageNumber);

    const handleEliminarHerramienta = async (idObra, idHerramienta) => {
        try {
            // 1. Buscar la entradaHerramienta por obra y herramienta
            const resp = await entradaHerramientasService.getEntradaPorObraYHerramienta(idObra, idHerramienta);
            const entrada = resp.data;
            if (!entrada || !entrada.id) {
                alert("No se encontró la entrada de la herramienta en la obra.");
                return;
            }

            // 2. Obtener la herramienta original
            const herramientaResp = await herramientaService.getHerramientasById(idHerramienta);
            const herramienta = herramientaResp.data;

            // 3. Sumar la cantidad de la entradaHerramienta a la herramienta original
            const nuevaCantidad = Number(herramienta.cantidad) + Number(entrada.cantidad);

            // 4. Actualizar la herramienta con la nueva cantidad
            const formData = new FormData();
            formData.append('id', herramienta.id);
            formData.append('nombre', herramienta.nombre);
            formData.append('descripcion', herramienta.descripcion);
            formData.append('cantidad', nuevaCantidad);
            formData.append('estado', herramienta.estado);
            formData.append('costo_unitario', herramienta.costo_unitario);
            formData.append('imagen', herramienta.imagen);

            await herramientaService.updateHerramientas(formData);

            // 5. Eliminar la entradaHerramienta encontrada
            await entradaHerramientasService.deleteEntradaHerramienta(entrada.id);
            alert("Herramienta eliminada de la obra correctamente.");
            listarHerramientas();
        } catch (error) {
            alert("Error al eliminar la herramienta de la obra.");
            console.error(error);
        }
    };

    return (
        <div class="app-content">
            <div class="app-content-header">
                <h1 class="app-content-headerText">Herramientas de la Obra</h1>
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
                    placeholder="Buscar por nombre o descripcion..."
                    type="text"
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                />
                <div class="app-content-actions-wrapper">
                    <Link to={`/obras/add-herramienta-new/${id}`}>
                        <button className="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Herramienta Nuevo</button>
                    </Link>
                    <Link to={`/obras/add-herramienta-exist/${id}`}>
                        <button className="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Herramienta Existente</button>
                    </Link>
                    <Link to={`/obras/vista/${id}`}>
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
                    <div class="product-cell stock">Fecha de Entrada<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Empleado<button class="sort-button">
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
                        <div className="product-cell stock"><span className="cell-label">Cantidad:</span> {cantidades[h.id] !== undefined ? cantidades[h.id] : '-'}</div>
                        <div className="product-cell stock"><span className="cell-label">Estado:</span> {h.estado}</div>
                        <div className="product-cell stock"><span className="cell-label">Costo Unitario:</span> {h.costo_unitario}</div>
                        <div className="product-cell stock"><span className="cell-label">Fecha de Entrada:</span> {entradasInfo[h.id]?.fecha || '-'}</div>
                        <div className="product-cell stock"><span className="cell-label">Empleado que ingreso la herramienta:</span> {entradasInfo[h.id]?.empleados || '-'}</div>
                        <div className="product-cell actions">
                            <button
                                className='app-content-headerButton'
                                title='Salida de Herramienta'
                                onClick={() => {
                                    setHerramientaSeleccionada(h);
                                    setShowModal(true);
                                }}
                            >
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"/>
                                </svg>
                            </button>
                            <button 
                                className='app-content-headerButton' 
                                title='Eliminar' 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEliminarHerramienta(id, h.id);
                                }}
                            >
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
                        }}>Salida de Herramienta</h2>
                        <form onSubmit={e => { e.preventDefault(); handleConfirmarSalida(); }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div>
                                    <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Cantidad a regresar:</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={herramientaSeleccionada ? cantidades[herramientaSeleccionada.id] : undefined}
                                        value={cantidadSalida}
                                        onChange={e => {
                                            const max = herramientaSeleccionada ? cantidades[herramientaSeleccionada.id] : undefined;
                                            const val = e.target.value;
                                            if (max !== undefined && Number(val) > max) {
                                                setCantidadSalida(max);
                                            } else {
                                                setCantidadSalida(val);
                                            }
                                        }}
                                        placeholder="Cantidad a regresar"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            fontSize: 15
                                        }}
                                    />
                                    {herramientaSeleccionada && (
                                        <small style={{ color: "#888" }}>
                                            Máximo en obra: {cantidades[herramientaSeleccionada.id]}
                                        </small>
                                    )}
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
                                    onClick={() => setShowModal(false)}
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
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VistaHerramientasComponent;
