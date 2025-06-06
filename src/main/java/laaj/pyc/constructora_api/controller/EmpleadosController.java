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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import laaj.pyc.constructora_api.entity.Empleados;
import laaj.pyc.constructora_api.service.EmpleadosService;
import laaj.pyc.constructora_api.util.AppSettings;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
public class EmpleadosController {
	
	@Autowired
	private EmpleadosService empleadosServ;
	
	
	@GetMapping
	@ResponseBody
	public List<Empleados> getAll(){
		return empleadosServ.listarTodos();
	}
	
	
	@GetMapping("/buscarPorId/{id}")
	@ResponseBody
	public Optional<Empleados> buscarPorId(@PathVariable Integer id){
		return empleadosServ.buscarPorId(id);
	}
	
	
	
	@PostMapping("/registrar")
	@ResponseBody
	public ResponseEntity<?> resgistra(@RequestBody Empleados obj) {
	    HashMap<String, Object> salida = new HashMap<>();
	    try {
	        Empleados objSalida = empleadosServ.registraEmpleados(obj);
	        if (objSalida == null) {
	            salida.put("mensaje", "Ocurrió un error al registrar");
	            return ResponseEntity.ok(salida);
	        } else {
	            salida.put("mensaje", "Se registró exitosamente");
	            salida.put("id", objSalida.getId()); // <-- Agrega el id aquí
	            salida.put("empleado", objSalida);   // <-- O el objeto completo si quieres
	            return ResponseEntity.ok(salida);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
	        return ResponseEntity.ok(salida);
	    }
	}
	
	
	@PutMapping("/actualizar")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> actualizar(@RequestBody Empleados obj){
		Map<String, Object> salida = new HashMap<>();
		
		try {
			Empleados objSalida = empleadosServ.actualizaEmpleados(obj);
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
			empleadosServ.eliminaEmpleados(id);
			salida.put("mensaje", AppSettings.MENSAJE_ACT_EXITOSO);
		} catch (Exception e) {
			e.printStackTrace();
			salida.put("mensaje", AppSettings.MENSAJE_ACT_ERROR);
		}
		
		return ResponseEntity.ok(salida);
	}
	
	@GetMapping("/search")
	@ResponseBody
	public List<Empleados> Buscar(@ModelAttribute("buscar") Empleados empleados) {
		ExampleMatcher matcher = ExampleMatcher.matchingAny() // matchingAny = OR
				.withMatcher("nombre", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apePaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
			    .withMatcher("apeMaterno", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
				.withIgnorePaths("id","correo","telefono","sexo","fechaNac","estadoEmp");
		
		Example<Empleados> example = Example.of(empleados, matcher);
		
		return empleadosServ.buscarByExample(example);
	}
	
	@InitBinder
	public void initBinder(WebDataBinder webDataBinder) {
	    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
	    webDataBinder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
	}

}
