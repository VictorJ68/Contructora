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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import laaj.pyc.constructora_api.entity.ImagenesObra;
import laaj.pyc.constructora_api.entity.Obras;
import laaj.pyc.constructora_api.service.ImagenesObraService;
import laaj.pyc.constructora_api.service.ObrasService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/obras/imagenes")
@CrossOrigin(origins = "*")
public class ImagenesObraController {
	
	private static final String UPLOAD_DIR = "C:/Users/victo/Pictures/Imagenes-contructora/";
    private static final String IMG_DIR = "C:/Users/victo/Pictures/Imagenes-contructora/";
	
	@Autowired
	private ImagenesObraService imgObraServ;
	
	@Autowired
	private ObrasService obrasServ;
	
	@GetMapping("/{idObra}")
	public List<ImagenesObra> listarPorObra(@PathVariable int idObra) {
        return imgObraServ.listarPorIdObra(idObra);
    }
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<ImagenesObra> buscarPorId(@PathVariable Integer id){
		return imgObraServ.buscarPorId(id);
	}
	
	@PostMapping("/registrar")
    public ResponseEntity<?> registra(
        @RequestParam("idObra") int idObra,
        @RequestParam("descripcion") String descripcion,
        @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        HashMap<String, Object> salida = new HashMap<>();
        
        try {
        	Obras obras = obrasServ.buscarPorID(idObra)
    	            .orElseThrow(() -> new RuntimeException("Imagenes no encontrada"));
        	
        	String nombreImagen = "no-imagen.png";
	        if (imagen != null && !imagen.isEmpty()) {
	            nombreImagen = guardarImagen(imagen);
	        }
            
	        ImagenesObra obj = new ImagenesObra();
            obj.setObras(obras);
            obj.setDescripcion(descripcion);
            obj.setImagen(nombreImagen); // Guardar el nombre generado
            
            // 3. Registrar en BD
            ImagenesObra objSalida = imgObraServ.registraImagenesObra(obj);
            
            salida.put("mensaje", objSalida != null ? 
                "Registro exitoso" : "Error al registrar");
                
        } catch (Exception e) {
            e.printStackTrace();
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
		    @RequestParam(value = "descripcion", required = false) String descripcion,
		    @RequestParam(value = "idObra", required = false) Integer idObra,
		    @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

	    HashMap<String, Object> salida = new HashMap<>();
	    
	    try {
	        ImagenesObra objExistente = imgObraServ.buscarPorId(id)
	            .orElseThrow(() -> new RuntimeException("Imagen de la obra no encontrado"));

	        if (descripcion != null) objExistente.setDescripcion(descripcion);
	        
	        if (idObra != null) {
	            Obras obras = obrasServ.buscarPorID(idObra)
	                .orElseThrow(() -> new RuntimeException("Obra no encontrada"));
	            objExistente.setObras(obras);
	        }

	        if (imagen != null && !imagen.isEmpty()) {
	            String nuevaImagen = guardarImagen(imagen);
	            objExistente.setImagen(nuevaImagen);
	        }

	        imgObraServ.actualizaImagenesObra(objExistente);
	        salida.put("mensaje", "Imagenes de la obra actualizada exitosamente");

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
			imgObraServ.eliminaImagenesObra(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	@GetMapping("/search/{idObra}")
	@ResponseBody
	public List<ImagenesObra> buscar(
	        @PathVariable("idObra") Integer idObra,
	        @ModelAttribute ImagenesObra imagenesObra) {

		ExampleMatcher matcher = ExampleMatcher.matching() // matchingAny = OR
				.withMatcher("descripcion", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
	            .withIgnorePaths("id", "imagen", "idObra");

	    Example<ImagenesObra> example = Example.of(imagenesObra, matcher);

	    return imgObraServ.buscarByExample(example, idObra);
	}
	
	@GetMapping("/descargar/{fileName:.+}")
    public ResponseEntity<Resource> descargarImagen(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(IMG_DIR).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = "application/octet-stream";
                if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
