package laaj.pyc.constructora_api;

import java.util.Iterator;
import java.util.List;

import org.jfree.util.Log;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import laaj.pyc.constructora_api.entity.Materiales;
import laaj.pyc.constructora_api.repository.MaterialesRepository;
import laaj.pyc.constructora_api.service.bd.materialesServiceImpl;

@SpringBootApplication
public class ConstructoraApiApplication{

	public static void main(String[] args) {
		SpringApplication.run(ConstructoraApiApplication.class, args);
		Log.info("Carga completa, sigamos trabajando!!");
		
		
	}
	

}
