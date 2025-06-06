package laaj.pyc.constructora_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer{
	
	/*@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/Imagenes-contructora/**")
        .addResourceLocations("file:C:/Users/victo/Pictures/Imagenes-contructora/");
    }*/
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
	    registry.addResourceHandler("/Imagenes-contructora/**")
	        .addResourceLocations("file:C:/Users/victo/Pictures/Imagenes-contructora/");
	    registry.addResourceHandler("/Pdf-obras/**")
	        .addResourceLocations("file:C:/Users/victo/Pictures/pdf-constructora/"); // <-- Agregado para PDF
	}

}
