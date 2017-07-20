angular.module("TvShowOrganizer").controller("TvShowOrganizerController", function($scope, $http) {
  $scope.app = "TvShowOrganizer";
  
  $scope.input;

  $scope.busca = [];

  $scope.series = [];

  $scope.watchlist = [];

  $scope.profile = [];

  $scope.logado = false;

  $scope.usuario;

  // Métodos

  $scope.enviarPesquisa = function () {
    if($scope.input === undefined || $scope.input.length === 0) {
      alert('Digite sua pesquisa: ');
    } else {
      var promise = $http.get("https://omdbapi.com/?s=" + $scope.input + "&type=series&apikey=93330d3c").then(function (response) {
        if(response.data.Response === "False") {
          alert('Sua pesquisa não obteve resultados.');
        } else {
          $scope.busca = response.data.Search;
        }
      }, function error (error) {
        console.log(error);
      });
      return promise;
    }
  };

    $scope.realizarCadastro = function(nomeCadastro, emailCadastro, senhaCadastro) {
        if (nomeCadastro.length == 0 || emailCadastro.length == 0 || senhaCadastro.length == 0) {
            alert("Verifique se todos os campos de cadastro foram preenchidos.");
        }
        else {
        var usuarioCadastrado = {"nome": nomeCadastro, "email": emailCadastro, "senha": senhaCadastro};
        var promise = $http.post("/usuario/", usuarioCadastrado).then(function(response) {
            if (response.data === "") {
                alert("O email já está registrado em outra conta.");
            } else {
                $scope.usuario = response.data;
                $scope.logado = true;
                alert("Cadastro realizado com sucesso!");
            }
        }, function error (error) {
            alert("Erro no cadastro.");
            console.log(error);
        });
        }
    };

    $scope.realizarLogin = function(emailLogin, senhaLogin) {
        var usuarioLogin = {nome: "", email: emailLogin, senha: senhaLogin};
        var promise = $http.post("/usuario/login/", usuarioLogin).then(function(response) {
            $scope.usuario = response.data;
            $scope.logado = true;
            $scope.carregarSeries();
        }, function error (error) {
            alert("Email ou senha incorretos.");
            console.log(error);
        });
    };

  $scope.realizarLogout = function() {
    if (confirm("Tem certeza que deseja sair da conta?")) {
      $scope.usuario = undefined;
      $scope.watchlist = [];
      $scope.profile = [];
      $scope.series = [];
      $scope.logado = false;
    }
  };

  $scope.carregarSeries = function () {
    console.log($scope.usuario.id);
    var promise = $http.get("/usuario/" + $scope.usuario.id + "/series/").then(function (response) {
      $scope.series = response.data;
      $scope.carregarDadosDoUsuario();
    }, function error (error) {
      console.log(error);
    });
  };

  $scope.carregarDadosDoUsuario = function() {
    for (var i = 0; i < $scope.series.length; i++) {
      if($scope.series[i].noPerfil === true) {
        $scope.carregarPerfil($scope.series[i]);
      } else {
        $scope.carregarWatchlist($scope.series[i].imdbID);
      }
    }
  };

  $scope.carregarPerfil = function(serie) {
    var promise = $http.get("https://omdbapi.com/?i=" + serie.imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
      serieCarregada = response.data;
      serieCarregada.avaliacao = serie.avaliacao;
      serieCarregada.ultimoEpisodio = serie.ultimoEpisodio;
      $scope.profile.push(serieCarregada);
    }).catch(function(error){
      console.log(error);
    });
  };

  $scope.carregarWatchlist = function(imdbID) {
    var promise = $http.get("https://omdbapi.com/?i=" + imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
      serieCarregada = response.data;
      $scope.watchlist.push(serieCarregada);
    }).catch(function(error){
      console.log(error);
    });
  };

  $scope.adicionarSerie = function(serie) {
    if($scope.logado === false) {
      alert("Para usar o Tv Show Organizer, você precisa estar logado.");
      return;
    }
    if ($scope.contains($scope.profile, serie)) {
      alert('"' + serie.Title + '" já existe no seu perfil.')
    } else {
      var promise = $http.get("https://omdbapi.com/?i=" + serie.imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
        serie = response.data;
        serie.avaliacao = "N/A"
        serie.ultimoEpisodio = "N/A"
        $scope.profile.push(serie);
        $scope.adicionarAoBancoDeDados(serie, true);
      }).catch(function(error){
        console.log(error);
      });
    }
  };

  $scope.adicionarSerieAoWatchlist = function (serie) {
    if($scope.logado === false) {
      alert("Para usar o Tv Show Organizer, você precisa estar logado.");
      return;
    }
    if ($scope.contains($scope.watchlist, serie)) {
      alert('"' + serie.Title + '" já existe na sua Watchlist.')
    } else if ($scope.contains($scope.profile, serie)) {
      alert('"' + serie.Title + '" já existe no seu perfil.')
    } else {
      $scope.watchlist.push(serie);
      $scope.adicionarAoBancoDeDados(serie, false);
    }
  };

  $scope.adicionarAoBancoDeDados = function (serie, noPerfil) {
    var serieAddPerfil = {"imdbID": serie.imdbID, "avaliacao": "N/A", "ultimoEpisodio": "N/A", "usuarioID": $scope.usuario.id, "noPerfil": noPerfil};
    var promise = $http.post("/serie/", serieAddPerfil).then(function(response) {
      $scope.series.push(response.data);
    }, function error (error) {
      console.log(error);
    });
  };

  $scope.apagarSerie = function (serie) {
    if(confirm('Tem certeza que deseja remover a série "' + serie.Title + '" do seu perfil?') === true) {
      var index = $scope.profile.indexOf(serie);
      var id = $scope.pegarIDPeloImdbID(serie);
      $scope.apagarDoBancoDeDados(id);
      $scope.profile.splice(index, 1);
    }
  };

  $scope.apagarDoBancoDeDados = function(id) {
    var promise = $http.delete("/serie/" + id).then(function(response) {
      return response.data;
    }, function error (error) {
      console.log(error);
    });
  };

  $scope.transferirSerie = function (serie) {
    var index = $scope.watchlist.indexOf(serie);
    var id = $scope.pegarIDPeloImdbID(serie);
    $scope.apagarDoBancoDeDados(id);
    $scope.watchlist.splice(index, 1);
  };

  $scope.apagarSerieDoWatchlist = function (serie) {
    if (confirm('Tem certeza que deseja remover a série "' + serie.Title + '" da sua Watchlist?') === true) {
      $scope.transferirSerie(serie);
    }
  };

  $scope.avaliarSerie = function (serie, nota) {
	serie.avaliacao = nota;
	var serieAtualizada = $scope.pegarSeriePeloImdbID(serie);
	console.log(serieAtualizada);
	serieAtualizada.avaliacao = nota;
    $scope.atualizarSerie(serieAtualizada);
  };

  $scope.alterarUltimoEpisodio = function (serie, episodio) {
	serie.ultimoEpisodio = episodio;
    var serieAtualizada = $scope.pegarSeriePeloImdbID(serie);
    serieAtualizada.ultimoEpisodio = episodio;
    $scope.atualizarSerie(serieAtualizada);
  };

  $scope.atualizarSerie = function(serie) {
    var promise = $http.put("/serie/" + serie.id, serie).then(function(response) {
    }, function error (error) {
      console.log(error);
    });
  }

    $scope.pegarIDPeloImdbID = function(serie) {
        for(var i = 0; i < $scope.series.length; i++) {
            if ($scope.series[i].imdbID === serie.imdbID) {
                return $scope.series[i].id;
            }
        }
    };

    $scope.pegarSeriePeloImdbID = function(serie) {
        for(var i = 0; i < $scope.series.length; i++) {
            if ($scope.series[i].imdbID === serie.imdbID) {
                return $scope.series[i];
            }
        }
    };

    $scope.contains = function (array, serie) {
        for (var i = 0; i < array.length; i++) {
            if(array[i].imdbID === serie.imdbID) {
                return true;
            }
        }
        return false;
    };

  $('#search-button').on('click', function() {
    $('#search').prop('checked', true);
  });

});
