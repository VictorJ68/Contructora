import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import pdfObraService from '../services/pdfObraService';

const PdfObraComponent = () => {
    const [pdfsObra, setPdfsObra] = useState([]);
    const { id } = useParams();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pdfsPerPage = 12;

    useEffect(() => {

        listarPdfsObra();
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

    const listarPdfsObra = () => {
        pdfObraService.getAllPdfObra(id)
            .then(response => {
                setPdfsObra(response.data);
            })
            .catch(error => {
                console.error("Error al obtener PDFs:", error);
            });
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
        setCurrentPage(1);

        if (text.trim() === "") {
            listarPdfsObra();
            return;
        }

        // Buscar en backend por descripción de PDF
        pdfObraService.searchPdfObraByExample(id, { descripcion: text })
            .then(response => setPdfsObra(response.data))
            .catch(error => console.error("Error al buscar PDFs:", error));
    };
    
    // Paginación
    const indexOfLast = currentPage * pdfsPerPage;
    const indexOfFirst = indexOfLast - pdfsPerPage;
    const current = pdfsObra.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(pdfsObra.length / pdfsPerPage);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    //ELIMINAR
    const deletePdfObra = (id, nombre) => {
        if (window.confirm(`¿Estás seguro de eliminar el PDF "${nombre}"?`)) {
            pdfObraService.deletePdfObra(id).then(() => {
                listarPdfsObra();
                alert("PDF eliminado correctamente");
            }).catch(error => {
                console.log(error);
                alert("Error al eliminar el PDF");
            });
        }
    };


    return (
        <div className='app-content'>
            <div class="app-content-header">
                <h1 class="app-content-headerText">PDFs de la Obra</h1>
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
                    placeholder="Buscar por descripción..."
                    type="text"
                    value={searchText}
                    onChange={e => handleSearchChange(e.target.value)}
                />
                <div class="app-content-actions-wrapper">
                    <Link to={`/obras/add-pdf/${id}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Agregar Empleado a la Obra</button></Link>
                    <Link to={`/obras/vista/${id}`}><button class="app-content-headerButton" style={{ marginRight: 10 }}>Regresar</button></Link>
                </div>
            </div>
            <div class="products-area-wrapper tableView">
                <div className="imagenes-collage-simple">
                    {current.map(pdf => (
                        <div key={pdf.id} className="imagen-collage-item">
                            {/* Ícono PDF y nombre */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" rx="4" fill="#E53E3E"/>
                                    <text x="12" y="36" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Arial" dy="-12">PDF</text>
                                </svg>
                                <span style={{ marginLeft: 10, fontWeight: 'bold' }}>{pdf.archivo}</span>
                            </div>
                            {/* SIEMPRE visible: descripción y acciones */}
                            <div className="collage-always-visible">
                                <div className="collage-desc">{pdf.descripcion}</div>
                                <div className="collage-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <Link
                                        to={`/obras/edit-pdf/${pdf.id}/${id}`}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <button className="app-content-headerButton" title="Editar">
                                            <svg className="w-6 h-6" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                                            </svg>
                                        </button>
                                    </Link>
                                    <button
                                        className="app-content-headerButton"
                                        title="Eliminar"
                                        onClick={e => {
                                            e.stopPropagation();
                                            deletePdfObra(pdf.id, pdf.descripcion);
                                        }}
                                    >
                                        <svg className="w-6 h-6" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                                        </svg>
                                    </button>
                                    <button
                                        className="app-content-headerButton"
                                        title="Descargar"
                                        onClick={e => {
                                            e.stopPropagation();
                                            pdfObraService.descargarPdf(pdf.pdf);
                                        }}
                                        style={{ marginLeft: 5 }}
                                    >
                                        <svg className="w-6 h-6" aria-hidden="true" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0-6-6m6 6 6-6"/>
                                        </svg>
                                    </button>
                                </div>
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
        </div>
    );
};

export default PdfObraComponent;
