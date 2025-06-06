package laaj.pyc.constructora_api.controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import laaj.pyc.constructora_api.entity.Empleados;
import laaj.pyc.constructora_api.entity.EntradaHerramientas;
import laaj.pyc.constructora_api.entity.Herramientas;
import laaj.pyc.constructora_api.service.EntradaHerramientasService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/obras/herramientas")
@CrossOrigin(origins = "*")
public class EntradaHerramientasController {
	
	@Autowired
	private EntradaHerramientasService entradaServ;
	
	@GetMapping("/{idObra}")
	public List<Herramientas> listarHerramientasDisponiblesPorObra(@PathVariable int idObra) {
        return entradaServ.listarHerramientasDisponiblesPorObra(idObra);
    }
	
	@PostMapping("/registrar")
	public EntradaHerramientas registrar(@RequestBody EntradaHerramientas entradaHerramientas) {
	    return entradaServ.guardar(entradaHerramientas);
	}
	
	@PutMapping("/actualizar")
	public ResponseEntity<?> actualizarEntradaHerramienta(@RequestBody EntradaHerramientas entradaActualizada) {
	    try {
	        Optional<EntradaHerramientas> entradaOpt = entradaServ.buscarPorId(entradaActualizada.getId());
	        if (entradaOpt.isPresent()) {
	            EntradaHerramientas entrada = entradaOpt.get();
	            entrada.setCantidad(entradaActualizada.getCantidad());
	            // Si necesitas actualizar más campos, hazlo aquí
	            EntradaHerramientas actualizada = entradaServ.actualizaEntradaHerramientas(entrada);
	            return ResponseEntity.ok(actualizada);
	        } else {
	            return ResponseEntity.status(404).body("EntradaHerramientas no encontrada");
	        }
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Error al actualizar: " + e.getMessage());
	    }
	}
	
	@DeleteMapping("/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminarEntradaHerramienta(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			entradaServ.eliminaEntradaHerramientas(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	
	@GetMapping("/no-en-obra/{idObra}")
	public List<Herramientas> listarHerramientasNoEnObra(@PathVariable int idObra) {
	    return entradaServ.listarHerramientasNoEnObra(idObra);
	}

	@GetMapping("/cantidad/{idObra}/{idHerramienta}")
	public int obtenerCantidadHerramientaEnObra(@PathVariable int idObra, @PathVariable int idHerramienta) {
	    return entradaServ.obtenerCantidadHerramientaEnObra(idObra, idHerramienta);
	}
	
	@GetMapping("/buscar/{idObra}/{idHerramienta}")
	public ResponseEntity<EntradaHerramientas> buscarPorObraYHerramienta(
	        @PathVariable int idObra,
	        @PathVariable int idHerramienta) {
	    Optional<EntradaHerramientas> entrada = entradaServ.buscarPorObraYHerramienta(idObra, idHerramienta);
	    return entrada.map(ResponseEntity::ok)
	                  .orElseGet(() -> ResponseEntity.notFound().build());
	}
	
	@GetMapping("/search/{idObra}")
	@ResponseBody
	public List<Herramientas> buscarEnObraPorEjemplo(
	        @PathVariable("idObra") Integer idObra,
	        @ModelAttribute Herramientas herramientas) {

		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
			    .withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("descripcion", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withIgnorePaths("id","cantidad","estado","costo_unitario","imagen");

	    Example<Herramientas> example = Example.of(herramientas, matcher);

	    return entradaServ.buscarByExampleEnObra(idObra, example);
	}
	
	@GetMapping("/no-en-obra/search/{idObra}")
	@ResponseBody
	public List<Herramientas> buscarEnNoObraPorEjemplo(
	        @PathVariable("idObra") Integer idObra,
	        @ModelAttribute Herramientas herramientas) {

		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
			    .withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("descripcion", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withIgnorePaths("id","cantidad","estado","costo_unitario","imagen");

	    Example<Herramientas> example = Example.of(herramientas, matcher);

	    return entradaServ.buscarByExampleNoEnObra(idObra, example);
	}
	

	@InitBinder
	public void initBinder(WebDataBinder webDataBinder) {
	    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
	    webDataBinder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
	}

}
