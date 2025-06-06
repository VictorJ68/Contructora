package laaj.pyc.constructora_api.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import laaj.pyc.constructora_api.entity.Herramientas;
import laaj.pyc.constructora_api.service.herramientasService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/herramientas")
@CrossOrigin(origins = "*")
public class HerramientasController {
	
    private static final String UPLOAD_DIR = "C:/Users/victo/Pictures/Imagenes-contructora/";
	
	@Autowired
	private herramientasService herramientasServ;
	
	@GetMapping
	@ResponseBody
	public List<Herramientas> getAllHerramientas(){
		return herramientasServ.listarTodos();
	}
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<Herramientas> buscarHerramientasPorId(@PathVariable Integer id){
		return herramientasServ.buscarPorId(id);
	}
	
	@PostMapping("/registrar")
    public ResponseEntity<?> registra(
        @RequestParam("nombre") String nombre,
        @RequestParam("descripcion") String descripcion,
        @RequestParam("cantidad") int cantidad,
        @RequestParam("estado") String estado,
        @RequestParam("costo_unitario") double costoUnitario,
        @RequestParam("imagen") MultipartFile imagen) {

        HashMap<String, Object> salida = new HashMap<>();
        
        try {
            // 1. Guardar la imagen
            String nombreImagen = guardarImagen(imagen);
            
            // 2. Crear el objeto Herramientas
            Herramientas obj = new Herramientas();
            obj.setNombre(nombre);
            obj.setDescripcion(descripcion);
            obj.setCantidad(cantidad);
            obj.setEstado(estado);
            obj.setCosto_unitario(costoUnitario);
            obj.setImagen(nombreImagen); // Guardar el nombre generado
            
            // 3. Registrar en BD
            Herramientas objSalida = herramientasServ.registarHerramienta(obj);
            
            if (objSalida != null) {
                salida.put("mensaje", "Registro exitoso");
                salida.put("herramienta", objSalida); // <-- Agrega el objeto creado aquí
            } else {
                salida.put("mensaje", "Error al registrar");
            }
                
        } catch (Exception e) {
            e.printStackTrace();
            salida.put("mensaje", "Error: " + e.getMessage());
        }
        return ResponseEntity.ok(salida);
    }

    private String guardarImagen(MultipartFile imagen) throws Exception {
        // Generar nombre único
        String nombreOriginal = imagen.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        String nuevoNombre = UUID.randomUUID() + extension;
        
        // Crear directorio si no existe
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Guardar archivo
        Path filePath = uploadPath.resolve(nuevoNombre);
        Files.copy(imagen.getInputStream(), filePath);
        
        return nuevoNombre;
    }
    
    @PutMapping("/actualizar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizaHerramientas(
        @RequestParam("id") int id,
        @RequestParam(value = "imagen", required = false) MultipartFile imagen,
        @RequestParam("nombre") String nombre,
        @RequestParam("descripcion") String descripcion,
        @RequestParam("cantidad") int cantidad,
        @RequestParam("estado") String estado,
        @RequestParam("costo_unitario") double costoUnitario) {

        Map<String, Object> salida = new HashMap<>();
        
        try {
            // 1. Buscar la herramienta existente
            Optional<Herramientas> optionalHerramienta = herramientasServ.buscarPorId(id);
            if (!optionalHerramienta.isPresent()) {
                salida.put("mensaje", "Herramienta no encontrada");
                return ResponseEntity.badRequest().body(salida);
            }
            
            Herramientas objExistente = optionalHerramienta.get();
            
            // 2. Manejo de la imagen
            if (imagen != null && !imagen.isEmpty()) {
                // Eliminar imagen anterior si existe
                if (objExistente.getImagen() != null && !objExistente.getImagen().isEmpty()) {
                    Path imagenAnterior = Paths.get(UPLOAD_DIR + objExistente.getImagen());
                    Files.deleteIfExists(imagenAnterior);
                }
                
                // Guardar nueva imagen
                String nombreImagen = guardarImagen(imagen);
                objExistente.setImagen(nombreImagen);
            }
            
            // 3. Actualizar otros campos
            objExistente.setNombre(nombre);
            objExistente.setDescripcion(descripcion);
            objExistente.setCantidad(cantidad);
            objExistente.setEstado(estado);
            objExistente.setCosto_unitario(costoUnitario);
            
            // 4. Guardar en BD
            Herramientas objActualizado = herramientasServ.actualizarHerramienta(objExistente);
            
            salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
            salida.put("data", objActualizado);
            
        } catch (Exception e) {
            e.printStackTrace();
            salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR + ": " + e.getMessage());
        }
        
        return ResponseEntity.ok(salida);
    }
	
	@DeleteMapping("/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminarHerramientas(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			herramientasServ.eliminarHerramientas(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	@GetMapping("/search")
	@ResponseBody
	public List<Herramientas> Buscar(@ModelAttribute("buscar") Herramientas herramientas) {
		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
			    .withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("descripcion", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withIgnorePaths("id","cantidad","estado","costo_unitario","imagen");
		
		Example<Herramientas> example = Example.of(herramientas, matcher);
		
		return herramientasServ.buscarByExample(example);
	}
	
}
