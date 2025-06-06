import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import obrasService from '../services/obrasService';

const VustaEmpleadosComponent = () => {
    const [obraEmpleado, setObraEmpleado] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PorPage = 20;
    const { id } = useParams();

    useEffect(() => {

        listarObraEmpleado();
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
    
            // --------> AQUÍ FORZAMOS EL INICIO EN GRID VIEW
            gridButton.click();
        }


        // Cleanup: Remover event listeners cuando el componente se desmonte
        return () => {
            if (gridButton) gridButton.removeEventListener("click", () => {});
            if (listButton) listButton.removeEventListener("click", () => {});
            if (modeSwitch) modeSwitch.removeEventListener("click", () => {});
        };
    }, [id]);

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            listarObraEmpleado();
            return;
        }

        // Filtra localmente por nombre, apellido paterno o materno
        const filtrados = obraEmpleado.filter(oe =>
            oe.empleados?.nombre?.toLowerCase().includes(text.toLowerCase()) ||
            oe.empleados?.apePaterno?.toLowerCase().includes(text.toLowerCase()) ||
            oe.empleados?.apeMaterno?.toLowerCase().includes(text.toLowerCase())
        );
        setObraEmpleado(filtrados);
    };

    const listarObraEmpleado = () => {
        obrasService.getAllObrasEmpleados(id)
            .then(response => {
                console.log("Datos recibidos:", response.data); // <-- Verifica qué datos llegan
                setObraEmpleado(response.data); // <-- Guarda los datos en el estado
            })
            .catch(error => {
                console.error("Error al obtener obras:", error);
            });
    };
    


    // Paginación
    const indexOfLast = currentPage * PorPage;
    const indexOfFirst = indexOfLast - PorPage;
    const current = obraEmpleado.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(obraEmpleado.length / PorPage);

    const goToPage = (pageNumber) => setCurrentPage(pageNumber);

    //ELIMINAR
    const deleteEmpleados = (id, nombre) => {
        if (window.confirm(`¿Estás seguro de eliminar el empleado de la obra "${nombre}"?`)) {
            obrasService.deleteObrasEmpleados(id).then((response) => {
                listarObraEmpleado();
                alert("Empleado eliminada correctamente");
            }).catch(error => {
                console.log(error);
                alert("Error al eliminar el empleado");
            });
        }
    };


    return (
        <div className='app-content'>
            <div class="app-content-header">
                <h1 class="app-content-headerText">Lista de Empleados de la Obra</h1>
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
                    placeholder="Buscar por nombre..."
                    type="text"
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                />
                <div class="app-content-actions-wrapper">
                    <Link to={`/obras/add-empleados/${id}`}>
                        <button class="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Empleado Nuevo</button>
                    </Link>
                    <Link to={`/obras/add-empleado-exist/${id}`}>
                        <button class="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Empleado Existente</button>
                    </Link>
                    <Link to={`/obras/vista/${id}`}>
                        <button class="app-content-headerButton" style={{ marginRight: 10 }}>Regresar</button>
                    </Link>
                    {/* <div class="filter-button-wrapper">
                        <button class="action-button filter jsFilter"><span>Filtro</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
                        <div class="filter-menu">
                            <label>Categoria</label>
                            <select>
                            <option>All Categories</option>
                            <option>Furniture</option>                     <option>Decoration</option>
                            <option>Kitchen</option>
                            <option>Bathroom</option>
                            </select>
                            <label>Status</label>
                            <select>
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Disabled</option>
                            </select>
                            <div class="filter-menu-buttons">
                            <button class="filter-button reset">
                                Reset
                            </button>
                            <button class="filter-button apply">
                                Apply
                            </button>
                            </div>
                        </div>
                    </div> */}
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
                    <div class="product-cell status-cell">Nombre<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Apellido Paterno<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell stock">Apellido Materno<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Correo<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Telefono<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Sexo<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Fecha de Nacimiento<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Estado<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell sales">Cargo<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                    <div class="product-cell price">Acciones<button class="sort-button">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"/></svg>
                    </button></div>
                </div>

                {current.map(obraEmpleado => (
                    <div key={obraEmpleado.id} className="products-row">

                        <div className="product-cell category"><span className="cell-label">Nombre:</span> {obraEmpleado.empleados?.nombre}</div>
                        <div className="product-cell sales"><span className="cell-label">Apellido Paterno:</span> {obraEmpleado.empleados?.apePaterno}</div>
                        <div className="product-cell stock"><span className="cell-label">Apellido Materno:</span> {obraEmpleado.empleados?.apeMaterno}</div>
                        <div className="product-cell sales"><span className="cell-label">Correo:</span> {obraEmpleado.empleados?.correo}</div>
                        <div className="product-cell stock"><span className="cell-label">Telefono:</span> {obraEmpleado.empleados?.telefono}</div>
                        <div className="product-cell sales"><span className="cell-label">Sexo:</span> {obraEmpleado.empleados?.sexoEmp}</div>
                        <div className="product-cell stock"><span className="cell-label">Fecha de Nacimiento:</span> {obraEmpleado.empleados?.fechaNac}</div>
                        <div className="product-cell sales"><span className="cell-label">Estado:</span> {obraEmpleado.empleados?.estadoEmp}</div>
                        <div className="product-cell sales"><span className="cell-label">Cargo:</span> {obraEmpleado.empleados?.cargos?.nombre || "Sin cargo"}</div>
                        <div className="product-cell actions">
                            <Link 
                                to={`/obras/edit-empleados/${obraEmpleado.empleados?.id}/${id}`} 
                                onClick={(e) => e.stopPropagation()} // <-- ¡Aquí la solución!
                            >
                                <button class="app-content-headerButton" title='Editar'>
                                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                                    </svg>
                                </button>
                            </Link>
                            
                            <button 
                                className='app-content-headerButton' 
                                title='Eliminar' 
                                onClick={(e) => {
                                    e.stopPropagation(); // <-- ¡Aquí la solución!
                                    deleteEmpleados(obraEmpleado.id, obraEmpleado.empleados?.nombre);
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
        </div>
    );
};

export default VustaEmpleadosComponent;
