package laaj.pyc.constructora_api.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import laaj.pyc.constructora_api.entity.EstadosObra;
import laaj.pyc.constructora_api.service.EstadosObraService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/estadosObra")
@CrossOrigin(origins = "*")
public class EstadosObraController {
	
	@Autowired
	private EstadosObraService estadosObraServ;
	
	@GetMapping
	@ResponseBody
	public List<EstadosObra> getAll(){
		return estadosObraServ.listarTodos();
	}
	
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<EstadosObra> buscarPorId(@PathVariable Integer id){
		return estadosObraServ.buscarPorId(id);
	}
	
	
	
	@PostMapping("/registrar")
	@ResponseBody
	public ResponseEntity<?> resgistra(@RequestBody EstadosObra obj) {
		HashMap<String, Object> salida = new HashMap<>();
		
		try {
			EstadosObra objSalida = estadosObraServ.registraEstadosObra(obj);
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
	
	
	@PutMapping("/actualizar")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> actualizar(@RequestBody EstadosObra obj){
		Map<String, Object> salida = new HashMap<>();
		
		try {
			EstadosObra objSalida = estadosObraServ.actualizaEstadosObra(obj);
			if (objSalida == null) {
				salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
			} else {
				salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
			}
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		return ResponseEntity.ok(salida);
	}


	@DeleteMapping("/eliminar/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> eliminar(@PathVariable("id") int id){
		Map<String,Object> salida = new HashMap<>();
		
		try {
			estadosObraServ.eliminaEstadosObra(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
}
