// import logo from './logo.svg';
import './App.css';
import ListMaterialesComponent from './components/ListMaterialesComponent';
import ListHerramientasComponent from './components/ListHerramientasComponent';
import ListUnidadesComponent from './components/ListUnidadesComponent';
import ListCargosComponent from './components/ListCargosComponent';
import ListEmpleadosComponent from './components/ListEmpleadosComponent';
import ListClientesComponent from './components/ListClientesComponent';
import ListObrasComponent from './components/ListObrasComponent';
import HeaderComponent from './components/HeaderComponent';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddMaterialesComponent from './components/AddMaterialesComponent';
import AddHerramientasComponent from './components/addHerramientasComponent';
import AddUnidadesComponent from './components/addUnidadesComponent';
import AddCargosComponent from './components/addCargosComponent';
import AddEmpleadosComponent from './components/addEmpleadosComponent';
import AddClientesComponent from './components/addClientesComponent';
import AddObrasComponent from './components/addObrasComponent';
import VistaObrasComponent from './Vistas_Obras/VistaObrasComponent';
import VistaEmpleadosComponent from './Vistas_Obras/VistaEmpleadosComponent';
import ImagenesObraComponent from './Vistas_Obras/ImagenesObraComponent';
import AddImagenesObraComponent from './Vistas_Obras/addImagenesObraComponent';
import AddEmpleadoexistComponent from './Vistas_Obras/addEmpleadoexistComponent';
import VistaHerramientasComponent from './Vistas_Obras/VistaHerramientasComponent';
import AddHerramientaexistComponent from './Vistas_Obras/addHerramientaexistComponent';
import AddHerramientaNewComponent from './Vistas_Obras/addHerramientaNewComponent';
import VistaMaterialesComponent from './Vistas_Obras/VistaMaterialesComponent';
import AddMaterialesExistComponent from './Vistas_Obras/addMaterialesExistComponent';
import AddMaterialesNewComponent from './Vistas_Obras/addMaterialesNewComponent';
import PdfObraComponent from './Vistas_Obras/PdfObraComponent';
import AddPdfObraComponent from './Vistas_Obras/addPdfObraComponent';

function App() {
  return (
    <div>
      <Router>
        <div class="app-container">
          <HeaderComponent />
          <Routes>
            <Route path="/materiales" element={<ListMaterialesComponent />} />
            <Route path="/add-materiales" element={<AddMaterialesComponent />} />
            <Route path="/edit-materiales/:id" element={<AddMaterialesComponent />} />

            <Route path="/herramientas" element={<ListHerramientasComponent />} />
            <Route path="/add-herramientas" element={<AddHerramientasComponent />} />
            <Route path="/edit-herramientas/:id" element={<AddHerramientasComponent />} />

            <Route path="/unidades" element={<ListUnidadesComponent />} />
            <Route path="/add-unidades" element={<AddUnidadesComponent />} />
            <Route path="/edit-unidades/:id" element={<AddUnidadesComponent />} />

            <Route path="/cargos" element={<ListCargosComponent />} />
            <Route path="/add-cargos" element={<AddCargosComponent />} />
            <Route path="/edit-cargos/:id" element={<AddCargosComponent />} />

            <Route path="/empleados" element={<ListEmpleadosComponent />} />
            <Route path="/add-empleados" element={<AddEmpleadosComponent />} />
            <Route path="/edit-empleados/:id" element={<AddEmpleadosComponent />} />

            <Route path="/clientes" element={<ListClientesComponent />} />
            <Route path="/add-clientes" element={<AddClientesComponent />} />
            <Route path="/edit-clientes/:id" element={<AddClientesComponent />} />

            <Route path="/" element={<ListObrasComponent />} />
            <Route path="/add-obras" element={<AddObrasComponent />} />
            <Route path="/edit-obras/:id" element={<AddObrasComponent />} />

            <Route path="/obras/vista/:id" element={<VistaObrasComponent />} />

            <Route path="/obras/empleados/:id" element={<VistaEmpleadosComponent />} />
            <Route path="/obras/add-empleados/:idobra" element={<AddEmpleadosComponent />} />
            <Route path="/obras/edit-empleados/:id/:idobra" element={<AddEmpleadosComponent />} />
            <Route path="/obras/add-empleado-exist/:id" element={<AddEmpleadoexistComponent />} />

            <Route path="/obras/imagenes/:id" element={<ImagenesObraComponent />} />
            <Route path="/obras/add-imagenes/:idobra" element={<AddImagenesObraComponent />} />
            <Route path="/obras/edit-imagenes/:id/:idobra" element={<AddImagenesObraComponent />} />

            <Route path="/obras/herramientas/:id" element={<VistaHerramientasComponent />} />
            <Route path="/obras/add-herramienta-exist/:id" element={<AddHerramientaexistComponent />} />
            <Route path="/obras/add-herramienta-new/:idObra" element={<AddHerramientaNewComponent />} />

            <Route path="/obras/materiales/:idObra" element={<VistaMaterialesComponent />} />
            <Route path="/obras/add-materiales-exist/:idObra" element={<AddMaterialesExistComponent />} />
            <Route path="/obras/add-materiales-new/:idObra" element={<AddMaterialesNewComponent />} />
            
            <Route path="/obras/pdf/:id" element={<PdfObraComponent />} />
            <Route path="/obras/add-pdf/:idobra" element={<AddPdfObraComponent />} />
            <Route path="/obras/edit-pdf/:id/:idobra" element={<AddPdfObraComponent />} />
          </Routes>
        </div>
      </Router>
    </div>
    // <div>
    //   <BrowserRouter>
    //   {/* <HeaderComponent /> */}
    //   <div className='container'>
    //     <Routes>
    //       <Route path='/materiales' element={<ListMaterialesComponent/>}></Route>
    //       <Route path='/add-materiales' element={<AddMaterialesComponent />}></Route>
    //       <Route path='/edit-materiales/:id' element={<AddMaterialesComponent />}></Route>
    //     </Routes>
    //   </div>
    //   </BrowserRouter>
    // </div>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
