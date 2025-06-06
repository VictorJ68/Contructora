import React, { useState, useEffect } from 'react';
import pdfObraService from '../services/pdfObraService';
import { Link, useNavigate, useParams } from 'react-router-dom';


export const AddPdfObraComponent = () => {
    const [descripcion , setDescripcion] = useState("");
    const [pdf, setPdf] = useState(null);
    const { id, idobra } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        console.log("ID de la URL:", id); // Verifica que se esté obteniendo correctamente el id
        if (id) {
            pdfObraService.getPdfObraById(id).then((response) => {
                const pdfObra = response.data;
                setDescripcion(pdfObra.descripcion);
            }).catch(error => {
                console.log("Error al obtener el pdf de la obra:", error);
            });
        }
    }, [id, idobra]);

    // Nuevo: Manejar archivo y previsualización
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdf(file);
        }
    };

    // Modificado: Enviar con FormData
    const savePdfObra = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('idObra', idobra);
        formData.append('descripcion', descripcion);
        if (pdf) formData.append('pdf', pdf); // Usa el nombre de campo que espera tu backend
        if (id) formData.append('id', id);

        if (id) {
            pdfObraService.updatePdfObra(formData).then(() => {
                alert("Se actualizó correctamente");
                navigate("/obras/pdf/" + idobra);
            }).catch(console.error);
        } else {
            pdfObraService.createPdfObra(formData).then(() => {
                navigate("/obras/pdf/" + idobra);
            }).catch(console.error);
        }
    };
    
    

    const title = id ? 'Actualizar PDF' : 'Registro de PDF';

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
                        <form onSubmit={savePdfObra}>
                            <div className="user-details">
                                <div className="input-box">
                                    <span className="details">Descripción</span>
                                    <input
                                        type="text"
                                        placeholder="Escribe la descripción"
                                        name="descripcion"
                                        className="form-control"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-box">
                                    <span className="details">Archivo PDF</span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        required={!id}
                                    />
                                    {pdf && (
                                        <div style={{ marginTop: 10 }}>
                                            <span>Archivo seleccionado: {pdf.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="button">
                                    <button type="submit" className="app-content-headerButton space-button">
                                        <div className="btnfrom">
                                            {id ? 'Actualizar ' : 'Guardar '}
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M11 16h2m6.707-9.293-2.414-2.414A1 1 0 0 0 16.586 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7.414a1 1 0 0 0-.293-.707ZM16 20v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6h8ZM9 4h6v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <Link to={`/obras/pdf/${idobra}`} className="btn btn-danger mb-2">
                                        <button type="button" className="app-content-headerButton">
                                            <div className="btnfrom">
                                                Cancelar
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
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

export default AddPdfObraComponent;
