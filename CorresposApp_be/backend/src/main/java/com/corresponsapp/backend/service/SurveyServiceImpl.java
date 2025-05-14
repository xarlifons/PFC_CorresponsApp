package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UnidadRepository;
import com.corresponsapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SurveyServiceImpl implements SurveyService {

    private final UserRepository userRepository;
    private final GrupoTareasLoader grupoTareasLoader;
    private UnidadRepository unidadRepository;
    
    public SurveyServiceImpl(UserRepository userRepository, GrupoTareasLoader grupoTareasLoader,
			UnidadRepository unidadRepository) {
		super();
		this.userRepository = userRepository;
		this.grupoTareasLoader = grupoTareasLoader;
		this.unidadRepository = unidadRepository;
	}

	

    @Override
    public void guardarParametrosUsuario(List<SurveyParametersDTO> respuestas) {
    	System.out.println("Si ves este log, es que el metodo  guardarParametrosUsuario de la calse SurveyServiceImpl es necesario, vea a verlo. Es posible que falte la unidadId") ;
//        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//
//        if (!(principal instanceof User usuario)) {
//            throw new RuntimeException("Principal no es del tipo esperado User");
//        }
//
//        System.out.println("✅ Usuario autenticado: " + usuario.getEmail());
//
//        usuario.setSurveyParameters(respuestas);
//
//        double umbral = calcularUmbralLimpieza(respuestas);
//        usuario.setUmbralLimpieza(umbral);
//
//        userRepository.save(usuario);
//
//        System.out.println("📩 Encuesta guardada para: " + usuario.getEmail());
//        System.out.println("✅ Umbral de limpieza calculado y guardado: " + umbral);
    }
    
    @Override
    public double guardarYDevolverParametrosUsuario(List<SurveyParametersDTO> respuestas, String unidadId) {
        // reutiliza tu save + cálculo
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User usuario)) {
            throw new RuntimeException("Principal no es del tipo esperado User");
        }
        usuario.setSurveyParameters(respuestas);
        double umbral = calcularUmbralLimpieza(respuestas, unidadId);
        usuario.setUmbralLimpieza(umbral);
        userRepository.save(usuario);
        return umbral;
    }

    
    private double calcularUmbralLimpieza(List<SurveyParametersDTO> respuestas, String unidadId) {
        double promedioIntensidad = respuestas.stream()
            .mapToDouble(SurveyParametersDTO::getIntensidad)
            .average()
            .orElse(0.0);

        double promedioCargaMental = respuestas.stream()
            .mapToDouble(SurveyParametersDTO::getCargaMental)
            .average()
            .orElse(0.0);

        double promedioPeriodicidad = respuestas.stream()
            .mapToDouble(SurveyParametersDTO::getPeriodicidad)
            .average()
            .orElse(0.0);
        
        Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);

        if (unidadOpt.isPresent()) {
            int cicloCorresponsabilidad = unidadOpt.get().getCicloCorresponsabilidad();
            double cicloCorresponsabilidadDouble = cicloCorresponsabilidad;
   
         // Normaliza la periodicidad: 0.5 días (muy frecuente) = 10, 30 días (poco frecuente) = 0
            double periodicidadNormalizada = (1.0 - ((promedioPeriodicidad - 0.5) / (cicloCorresponsabilidadDouble - 0.5))) * 10.0;

            // Calcula el umbral como media ponderada (puedes ajustar los pesos si lo deseas)
            double umbral = (
                0.5 * periodicidadNormalizada +     // Más peso a la predisposición
                0.25 * (10.0 - promedioIntensidad) + // A menor esfuerzo, más umbral
                0.25 * (10.0 - promedioCargaMental)  // A menor carga mental, más umbral
            );

            return Math.round(umbral * 10.0) / 10.0; // Redondeado a 1 decimal
        } else {
        	System.out.println("⚠️ No se encontró la unidad con id " + unidadId + "El umbral enviado no es correcto ");
            double promedioFacke = 0.0;
        	return promedioFacke;  
        }
        
    }

    
    @Override
    public Map<String, SurveyParametersDTO> calcularPromediosPorGrupo(String unidadId) {
        List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
        System.out.println("✅ Usuarios encontrados en la unidad: " + usuarios);

        // Map<grupo, List<SurveyParametersDTO>>
        Map<String, List<SurveyParametersDTO>> respuestasPorGrupo = new HashMap<>();

        for (User usuario : usuarios) {
            System.out.println("🧪 Usuario: " + usuario.getEmail());

            if (usuario.getSurveyParameters() != null) {
            	System.out.println("✅ SurveyParameters encontrados: " + usuario.getSurveyParameters().size());
                for (SurveyParametersDTO respuesta : usuario.getSurveyParameters()) {
                    respuestasPorGrupo
                        .computeIfAbsent(respuesta.getGrupo(), k -> new ArrayList<>())
                        .add(respuesta);
                }
            }
        }

        // Calcular medias por grupo
        Map<String, SurveyParametersDTO> promedios = new HashMap<>();

        for (Map.Entry<String, List<SurveyParametersDTO>> entry : respuestasPorGrupo.entrySet()) {
            String grupo = entry.getKey();
            List<SurveyParametersDTO> respuestas = entry.getValue();

            double sumaPeriodicidad = 0.0;
            double sumaCargaMental = 0.0;
            double sumaIntensidad = 0.0;

            for (SurveyParametersDTO r : respuestas) {
                sumaPeriodicidad += r.getPeriodicidad();
                sumaCargaMental += r.getCargaMental();
                sumaIntensidad += r.getIntensidad();
            }

            int total = respuestas.size();

            SurveyParametersDTO promedio = new SurveyParametersDTO(
                grupo,
                Math.round(sumaPeriodicidad / total * 100.0) / 100.0,
                Math.round(sumaCargaMental / total * 100.0) / 100.0,
                Math.round(sumaIntensidad / total * 100.0) / 100.0
            );
            
            System.out.println("Iteracion para llenar el map promedios, con promedio:" + grupo + ","  + promedio);
            promedios.put(grupo, promedio);
        }
        
        System.out.println("🎯 Grupos con respuestas:");
        for (String grupo : promedios.keySet()) {
            System.out.println(" - " + grupo);
        }

        return promedios;
    }

//    @Override
//    public Map<String, SurveyParametersDTO> calcularPromediosPorTarea(String unidadId) {
//        Map<String, SurveyParametersDTO> promediosPorGrupo = calcularPromediosPorGrupo(unidadId);
//        System.out.println("🧪 promediosPorGrupo:" + promediosPorGrupo);
//        System.out.println("🧪 Claves disponibles en promediosPorGrupo:");
//        for (String key : promediosPorGrupo.keySet()) {
//            System.out.println(" - " + key);
//        }
//        Map<String, SurveyParametersDTO> resultado = new HashMap<>();
//
//        // 🔍 Mostrar los grupos definidos en el JSON
//        System.out.println("📁 Grupos con datos cargados desde JSON:");
//        for (GrupoTareasLoader.GrupoTareas grupo : grupoTareasLoader.getGrupos().values()) {
//            System.out.println(" - " + grupo.id);
//        }
//
//        // 🔍 Mostrar los grupos con respuestas de usuarios
//        System.out.println("🎯 Grupos con respuestas:");
//        for (String grupo : promediosPorGrupo.keySet()) {
//            System.out.println(" - " + grupo);
//        }
//
//        for (GrupoTareasLoader.GrupoTareas grupo : grupoTareasLoader.getGrupos().values()) {
//            System.out.println("🔍 Buscando grupo: " + grupo.id + " en promediosPorGrupo");
//            SurveyParametersDTO promedioGrupo = promediosPorGrupo.get(grupo.id);
//            if (promedioGrupo == null) continue;
//            System.out.println("🧩 Grupo con promedio válido: " + grupo.id);
//            System.out.println("   Tareas a propagar: " + grupo.tareas.size());
//
//            for (GrupoTareasLoader.TareaDelGrupo tarea : grupo.tareas) {
//            	 System.out.println("   ↪ Propagando a tarea: " + tarea.id);
//                double periodicidad = Math.round((promedioGrupo.getPeriodicidad() * tarea.ajustePeriodicidad) * 100.0) / 100.0;
//                double intensidad = Math.round((promedioGrupo.getIntensidad() + tarea.ajusteIntensidad) * 100.0) / 100.0;
//                double cargaMental = Math.round((promedioGrupo.getCargaMental() + tarea.ajusteCargaMental) * 100.0) / 100.0;
//
//                resultado.put(tarea.id, new SurveyParametersDTO(
//                    grupo.id,
//                    periodicidad,
//                    cargaMental,
//                    intensidad
//                ));
//            }
//        }
//
//        return resultado;
//    }
    
    public Map<String, SurveyParametersDTO> calcularPromediosPorTarea(String unidadId) {
        List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
        Map<String, List<SurveyParametersDTO>> respuestasPorTarea = new HashMap<>();

        for (User usuario : usuarios) {
            List<SurveyParametersDTO> respuestas = usuario.getSurveyParameters();
            if (respuestas == null) continue;

            Map<String, SurveyParametersDTO> respuestasPropagadas = grupoTareasLoader.propagarParametrosDesdeRepresentativas(respuestas);

            for (Map.Entry<String, SurveyParametersDTO> entry : respuestasPropagadas.entrySet()) {
                respuestasPorTarea
                    .computeIfAbsent(entry.getKey(), k -> new ArrayList<>())
                    .add(entry.getValue());
            }
        }

        // Calcular promedio por tarea
        Map<String, SurveyParametersDTO> promedios = new HashMap<>();
        for (Map.Entry<String, List<SurveyParametersDTO>> entry : respuestasPorTarea.entrySet()) {
            String tareaId = entry.getKey();
            List<SurveyParametersDTO> respuestas = entry.getValue();

            double sumaP = 0, sumaI = 0, sumaC = 0;
            for (SurveyParametersDTO r : respuestas) {
                sumaP += r.getPeriodicidad();
                sumaI += r.getIntensidad();
                sumaC += r.getCargaMental();
            }
            int total = respuestas.size();
            promedios.put(tareaId, new SurveyParametersDTO(
                tareaId,
                Math.round(sumaP / total * 100.0) / 100.0,
                Math.round(sumaC / total * 100.0) / 100.0,
                Math.round(sumaI / total * 100.0) / 100.0
            ));
        }

        return promedios;
    }



}
