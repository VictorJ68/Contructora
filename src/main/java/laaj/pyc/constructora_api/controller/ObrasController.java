package laaj.pyc.constructora_api.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import laaj.pyc.constructora_api.entity.Clientes;
import laaj.pyc.constructora_api.entity.Empleados;
import laaj.pyc.constructora_api.entity.EstadosObra;
import laaj.pyc.constructora_api.entity.ObraEmpleado;
import laaj.pyc.constructora_api.entity.Obras;
import laaj.pyc.constructora_api.entity.TipoObra;
import laaj.pyc.constructora_api.service.ClientesService;
import laaj.pyc.constructora_api.service.EmpleadosService;
import laaj.pyc.constructora_api.service.EstadosObraService;
import laaj.pyc.constructora_api.service.ObraEmpleadoService;
import laaj.pyc.constructora_api.service.ObrasService;
import laaj.pyc.constructora_api.service.TipoObraService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/obras")
@CrossOrigin(origins = "*")
public class ObrasController {
	
	private static final String UPLOAD_DIR = "C:/Users/victo/Pictures/Imagenes-contructora/";
	
	@Autowired
	private ObrasService obrasServ;
	
	@Autowired
	private TipoObraService tipoObraServ;
	
	@Autowired
	private EmpleadosService empleadosServ;
	
	@Autowired
	private ClientesService clientesServ;
	
	@Autowired
	private EstadosObraService estadoObraServ;
	

    @Autowired
    private ObraEmpleadoService obraEmpleadoService;

	@GetMapping
	@ResponseBody
	public List<Obras> getAll(){
		return obrasServ.listarTodos();
	}
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<Obras> buscarPorId(@PathVariable Integer id){
		return obrasServ.buscarPorID(id);
	}
	
	@PostMapping("/registrar")
	public ResponseEntity<?> registraMaterial(
	    @RequestParam("nombre") String nombre,
	    @RequestParam("idCliente") int idCliente,
	    @RequestParam("direccion") String direccion,
	    @RequestParam("fecha") Date fecha,
	    @RequestParam("idEstadoObra") int idEstadoObra,
	    @RequestParam("presupuesto_total") double presupuesto_total,
	    @RequestParam("costo_real") double costo_real,
	    @RequestParam("fecha_inicio") Date fecha_inicio,
	    @RequestParam("fecha_fin_estimada") Date fecha_fin_estimada,
	    @RequestParam("idTipoObra") int idTipoObra,
	    @RequestParam("idSupervisor") int idSupervisor,
	    @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

	    HashMap<String, Object> salida = new HashMap<>();
	    
	    try {
	        TipoObra tipoObra = tipoObraServ.buscarPorId(idTipoObra)
	            .orElseThrow(() -> new RuntimeException("Tipo de obra no encontrada"));
	        
	        Empleados supervisor = empleadosServ.buscarPorId(idSupervisor)
		            .orElseThrow(() -> new RuntimeException("Supervisor no encontrado"));
	        
	        Clientes cliente = clientesServ.buscarPorId(idCliente)
		            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

	        EstadosObra estadoObra = estadoObraServ.buscarPorId(idEstadoObra)
	            .orElseThrow(() -> new RuntimeException("Estado de obra no encontrada"));

	        String nombreImagen = "no-imagen.png";
	        if (imagen != null && !imagen.isEmpty()) {
	            nombreImagen = guardarImagen(imagen);
	        }

	        Obras obj = new Obras();
	        obj.setNombre(nombre);
	        obj.setClientes(cliente);
	        obj.setDireccion(direccion);
	        obj.setFecha(fecha);
	        obj.setEstadosObra(estadoObra);
	        obj.setPresupuesto_total(presupuesto_total);
	        obj.setCosto_real(costo_real);
	        obj.setFecha_inicio(fecha_inicio);
	        obj.setFecha_fin_estimada(fecha_fin_estimada);
	        obj.setTipoObra(tipoObra);
	        obj.setEmpleados(supervisor);
	        obj.setImagen(nombreImagen);

	        Obras objSalida = obrasServ.registraObra(obj);
	        
	        salida.put("mensaje", "Obra registrado exitosamente");
	            
	    } catch (Exception e) {
	        salida.put("mensaje", "Error: " + e.getMessage());
	    }
	    return ResponseEntity.ok(salida);
	}
	

	private String guardarImagen(MultipartFile imagen) throws Exception {
        String nombreOriginal = imagen.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        String nuevoNombre = UUID.randomUUID() + extension;
        
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(nuevoNombre);
        Files.copy(imagen.getInputStream(), filePath);
        
        return nuevoNombre;
    }
	
	@PutMapping("/actualizar")
	public ResponseEntity<?> actualiza(
		    @RequestParam("id") int id,
		    @RequestParam(value = "nombre", required = false) String nombre,
		    @RequestParam(value = "idCliente", required = false) Integer idCliente,
		    @RequestParam(value = "direccion", required = false) String direccion,
		    @RequestParam(value = "fecha", required = false) Date fecha,
		    @RequestParam(value = "idEstadoObra", required = false) Integer idEstadoObra,
		    @RequestParam(value = "presupuesto_total", required = false) Double presupuesto_total,
		    @RequestParam(value = "costo_real", required = false) Double costo_real,
		    @RequestParam(value = "fecha_inicio", required = false) Date fecha_inicio,
		    @RequestParam(value = "fecha_fin_estimada", required = false) Date fecha_fin_estimada,
		    @RequestParam(value = "idTipoObra", required = false) Integer idTipoObra,
		    @RequestParam(value = "idSupervisor", required = false) Integer idSupervisor,
		    @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

	    HashMap<String, Object> salida = new HashMap<>();
	    
	    try {
	        Obras objExistente = obrasServ.buscarPorID(id)
	            .orElseThrow(() -> new RuntimeException("Obra no encontrado"));

	        if (nombre != null) objExistente.setNombre(nombre);
	        if (direccion != null) objExistente.setDireccion(direccion);
	        if (fecha != null) objExistente.setFecha(fecha);
	        if (presupuesto_total != null) objExistente.setPresupuesto_total(presupuesto_total);
	        if (costo_real != null) objExistente.setCosto_real(costo_real);
	        if (fecha_inicio != null) objExistente.setFecha_inicio(fecha_inicio);
	        if (fecha_fin_estimada != null) objExistente.setFecha_fin_estimada(fecha_fin_estimada);

	        if (idTipoObra != null) {
	            TipoObra tipoObra = tipoObraServ.buscarPorId(idTipoObra)
	                .orElseThrow(() -> new RuntimeException("Tipo de obra no encontrada"));
	            objExistente.setTipoObra(tipoObra);
	        }
	        
	        if (idSupervisor != null) {
	            Empleados supervisor = empleadosServ.buscarPorId(idSupervisor)
	                .orElseThrow(() -> new RuntimeException("Supervisor no encontrada"));
	            objExistente.setEmpleados(supervisor);
	        }
	        
	        if (idCliente != null) {
	            Clientes clientes = clientesServ.buscarPorId(idCliente)
	                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
	            objExistente.setClientes(clientes);
	        }
	        
	        if (idEstadoObra != null) {
	            EstadosObra estadosObra = estadoObraServ.buscarPorId(idEstadoObra)
	                .orElseThrow(() -> new RuntimeException("Estado de obra no encontrado"));
	            objExistente.setEstadosObra(estadosObra);
	        }

	        if (imagen != null && !imagen.isEmpty()) {
	            String nuevaImagen = guardarImagen(imagen);
	            objExistente.setImagen(nuevaImagen);
	        }

	        obrasServ.actualizaObra(objExistente);
	        salida.put("mensaje", "Obra actualizada exitosamente");

	    } catch (Exception e) {
	        salida.put("mensaje", "Error: " + e.getMessage());
	    }
	    return ResponseEntity.ok(salida);
	}

	@DeleteMapping("/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminar(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			obrasServ.eliminarObra(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	@GetMapping("/search")
	@ResponseBody
	public List<Obras> Buscar(@ModelAttribute("buscar") Obras obras) {
		ExampleMatcher matcher = ExampleMatcher.matching()
				.withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
				.withIgnorePaths("id","direccion","fecha","presupuesto_total","fecha_inicio"
						,"fecha_fin_estimada","imagen","idTipoObra","idSupervisor","idEstadoObra");
		
		Example<Obras> example = Example.of(obras, matcher);
		
		return obrasServ.buscarByExample(example);
	}
	
	@InitBinder
	public void initBinder(WebDataBinder webDataBinder) {
	    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
	    webDataBinder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
	}

	

	
	
	@GetMapping("/empleados/{idObra}")
    public List<ObraEmpleado> listarPorObra(@PathVariable int idObra) {
        return obraEmpleadoService.listarPorIdObra(idObra);
    }
	
	@GetMapping("/empleados/buscar/{idObra}")
	@ResponseBody
	public List<ObraEmpleado> buscarObraEmpleadoPorExample(
	        @PathVariable("idObra") Integer idObra,
	        @ModelAttribute ObraEmpleado obraEmpleado) {

	    /*ExampleMatcher matcher = ExampleMatcher.matching()
	            .withIgnoreNullValues()
	            .withIgnorePaths("id"); // Ignora el id si no lo quieres comparar*/
	    
		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
				.withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apePaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apeMaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
	            .withIgnorePaths("id", "correo", "telefono", "sexoEmp", "fechaNac", "estadoEmp");


	    Example<ObraEmpleado> example = Example.of(obraEmpleado, matcher);

	    return obraEmpleadoService.buscarByExample(example, idObra);
	}
	
	@PostMapping("/empleados/registrar")
	@ResponseBody
	public ResponseEntity<?> resgistraObraEmpleado(@RequestBody ObraEmpleado obj) {
		HashMap<String, Object> salida = new HashMap<>();
		
		try {
			ObraEmpleado objSalida = obraEmpleadoService.registraObraEmpleado(obj);
			if (objSalida == null) {
				salida.put("mensaje", "Ocurrió un error al registrar");
			} else {
				salida.put("mensaje", "Se resgistro exitosamente");
			}
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		return ResponseEntity.ok(salida);
	}
	
	@DeleteMapping("/empleados/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminarObraEmpleado(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			obraEmpleadoService.eliminarObraEmpleado(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	
	
	
	
	
	@GetMapping("/empleados/exist/{idObra}")
    public List<Empleados> listarPorObraExist(@PathVariable int idObra) {
        return obraEmpleadoService.listarPorEmpleadoExist(idObra);
    }
	
	@GetMapping("/empleados/exist/{idObra}/search")
	@ResponseBody
	public List<Empleados> buscarEmpleadosNoEnObra(
	        @PathVariable("idObra") Integer idObra,
	        @ModelAttribute Empleados empleados) {

		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
				.withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apePaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apeMaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
	            .withIgnorePaths("id", "correo", "telefono", "sexoEmp", "fechaNac", "estadoEmp");

	    Example<Empleados> example = Example.of(empleados, matcher);

	    return obraEmpleadoService.buscarPorEmpleadoExistByExample(idObra, example);
	}

}
