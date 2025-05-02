package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    public SurveyServiceImpl(UserRepository userRepository, GrupoTareasLoader grupoTareasLoader) {
        this.userRepository = userRepository;
        this.grupoTareasLoader = grupoTareasLoader;
    }

    @Override
    public void guardarParametrosUsuario(List<SurveyParametersDTO> respuestas) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> usuarioOptional = userRepository.findById(userId);

        if (usuarioOptional.isPresent()) {
        	User usuario = usuarioOptional.get();

            // Aquí deberíamos guardar las respuestas en el usuario
            usuario.setSurveyParameters(respuestas); // 👈 Necesitaremos añadir este campo en Usuario.java

            userRepository.save(usuario);
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }
    
    @Override
    public Map<String, SurveyParametersDTO> calcularPromediosPorGrupo(String unidadId) {
        List<User> usuarios = userRepository.findByUnidadId(unidadId);

        // Map<grupo, List<SurveyParametersDTO>>
        Map<String, List<SurveyParametersDTO>> respuestasPorGrupo = new HashMap<>();

        for (User usuario : usuarios) {
            if (usuario.getSurveyParameters() != null) {
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

            promedios.put(grupo, promedio);
        }

        return promedios;
    }

    @Override
    public Map<String, SurveyParametersDTO> calcularPromediosPorTarea(String unidadId) {
        Map<String, SurveyParametersDTO> promediosPorGrupo = calcularPromediosPorGrupo(unidadId);
        Map<String, SurveyParametersDTO> resultado = new HashMap<>();

        for (GrupoTareasLoader.GrupoTareas grupo : grupoTareasLoader.getGrupos().values()) {
            SurveyParametersDTO promedioGrupo = promediosPorGrupo.get(grupo.id);
            if (promedioGrupo == null) continue;

            for (GrupoTareasLoader.TareaDelGrupo tarea : grupo.tareas) {
                double periodicidad = Math.round((promedioGrupo.getPeriodicidad() * tarea.ajusteFrecuencia) * 100.0) / 100.0;
                double intensidad = Math.round((promedioGrupo.getIntensidad() + tarea.ajusteIntensidad) * 100.0) / 100.0;
                double cargaMental = Math.round((promedioGrupo.getCargaMental() + tarea.ajusteCargaMental) * 100.0) / 100.0;

                resultado.put(tarea.id, new SurveyParametersDTO(
                    grupo.id,
                    periodicidad,
                    cargaMental,
                    intensidad
                ));
            }
        }

        return resultado;
    }


}
