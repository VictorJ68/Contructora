package laaj.pyc.constructora_api.controller;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import laaj.pyc.constructora_api.service.EspacioService;

@Controller
public class imagenController {
	
	@RestController
	@RequestMapping("/imagenes")
	public class ImagenController{
		
		private final EspacioService storageService;
		
		@Autowired
		public ImagenController(EspacioService storageService) {
			this.storageService = storageService;
		}

		@GetMapping("/{fileName}")
		public ResponseEntity<Resource> obtenerImagen(@PathVariable String fileName) {
			try {
				Path imagePath = null;
				try {
					imagePath = storageService.obtenerRutaDeImagen(fileName);
				} catch (Exception e) {
					e.printStackTrace();
				}
				Resource resource = new UrlResource(imagePath.toUri());

				if (resource.exists()) {
					return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
							"inline; filename=\"" + resource.getFilename() + "\"").body(resource); 
				} else {

					return ResponseEntity.notFound().build();
				}
			} catch (Exception e) {
				return ResponseEntity.notFound().build();
			}
		}
	}
}
