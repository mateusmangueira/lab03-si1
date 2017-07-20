package ufcg.edu.br.TvShowOrganizer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ufcg.edu.br.TvShowOrganizer.model.Serie;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Integer> {

}
