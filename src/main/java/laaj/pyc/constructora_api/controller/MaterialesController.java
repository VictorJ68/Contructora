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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import laaj.pyc.constructora_api.entity.Materiales;
import laaj.pyc.constructora_api.entity.Unidades;
import laaj.pyc.constructora_api.service.UnidadesService;
import laaj.pyc.constructora_api.service.materialesService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "*")
public class MaterialesController {
	
    private static final String UPLOAD_DIR = "C:/Users/victo/Pictures/Imagenes-contructora/";
	
	@Autowired
	private materialesService materialService;

	@Autowired
	private UnidadesService unidadesServ;
	
	@GetMapping
	@ResponseBody
	public List<Materiales> getAllMateriales(){
		return materialService.listarTodos();
	}
	
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<Materiales> buscarMaterialesPorId(@PathVariable Integer id){
		return materialService.buscarPorId(id);
	}
	
	
	
	@PostMapping("/registrar")
	public ResponseEntity<?> registraMaterial(
	    @RequestParam("nombre") String nombre,
	    @RequestParam("descripcion") String descripcion,
	    @RequestParam("cantidad") int cantidad,
	    @RequestParam("idUnidad") int idUnidad,
	    @RequestParam("costo_unitario") double costoUnitario,
	    @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

	    HashMap<String, Object> salida = new HashMap<>();
	    
	    try {
	        Unidades unidad = unidadesServ.buscarPorId(idUnidad)
	            .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

	        String nombreImagen = "no-imagen.png";
	        if (imagen != null && !imagen.isEmpty()) {
	            nombreImagen = guardarImagen(imagen);
	        }

	        Materiales obj = new Materiales();
	        obj.setNombre(nombre);
	        obj.setDescripcion(descripcion);
	        obj.setCantidad(cantidad);
	        obj.setUnidades(unidad);
	        obj.setCosto_unitario(costoUnitario);
	        obj.setImagen(nombreImagen);

	        Materiales objSalida = materialService.registraMateriales(obj);

	        salida.put("mensaje", "Material registrado exitosamente");
	        salida.put("id", objSalida.getId()); // <-- Agrega esto	            
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
	public ResponseEntity<?> actualizaMaterial(
	    @RequestParam("id") int id,
	    @RequestParam(value = "nombre", required = false) String nombre,
	    @RequestParam(value = "descripcion", required = false) String descripcion,
	    @RequestParam(value = "cantidad", required = false) Integer cantidad,
	    @RequestParam(value = "idUnidad", required = false) Integer idUnidad,
	    @RequestParam(value = "costo_unitario", required = false) Double costoUnitario,
	    @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

	    HashMap<String, Object> salida = new HashMap<>();
	    
	    try {
	        Materiales objExistente = materialService.buscarPorId(id)
	            .orElseThrow(() -> new RuntimeException("Material no encontrado"));

	        if (nombre != null) objExistente.setNombre(nombre);
	        if (descripcion != null) objExistente.setDescripcion(descripcion);
	        if (cantidad != null) objExistente.setCantidad(cantidad);
	        if (costoUnitario != null) objExistente.setCosto_unitario(costoUnitario);

	        if (idUnidad != null) {
	            Unidades unidad = unidadesServ.buscarPorId(idUnidad)
	                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));
	            objExistente.setUnidades(unidad);
	        }

	        if (imagen != null && !imagen.isEmpty()) {
	            String nuevaImagen = guardarImagen(imagen);
	            objExistente.setImagen(nuevaImagen);
	        }

	        materialService.actualizaMateriales(objExistente);
	        salida.put("mensaje", "Material actualizado exitosamente");

	    } catch (Exception e) {
	        salida.put("mensaje", "Error: " + e.getMessage());
	    }
	    return ResponseEntity.ok(salida);
	}


	@DeleteMapping("/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminaMateriales(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			materialService.eliminaMateriales(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	@GetMapping("/search")
	@ResponseBody
	public List<Materiales> Buscar(@ModelAttribute("buscar") Materiales materiales) {
		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
			    .withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("descripcion", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withIgnorePaths("id","cantidad","costo_unitario","imagen","idUnidad");
		
		Example<Materiales> example = Example.of(materiales, matcher);
		
		return materialService.buscarByExample(example);
	}
	
	@InitBinder
	public void initBinder(WebDataBinder webDataBinder) {
	    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
	    webDataBinder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
	}
	
}
