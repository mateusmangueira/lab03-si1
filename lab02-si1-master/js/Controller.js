angular.module("TV Show Organizer").controller("Controller", function ($scope, $http) {

    $scope.app = "TV Show Organizer";

    $scope.series = [];

    $scope.watchlist = [];

    $scope.seriesSearch = [];

    $scope.statusSerie = "";

    // Métodos principais

    $scope.pesquisarSerie = function(nome){
        var promise = $http.get('http://www.omdbapi.com/?s=' + nome + '&type=series&apikey=93330d3c').then(function(response){
            $scope.seriesSearch = response.data.Search;
            $scope.statusSerie = response.data.Error;
        }, function error(error){
            console.log(error);
        })
        return promise;
    };

    $scope.adicionarSerie = function(nomeserie){
            var promise = $http.get('https://omdbapi.com/?i=' + nomeserie.imdbID + '&plot=full&apikey=93330d3c');
            promise.then(function(response){
                var fullSerie = response.data;
                if(!($scope.serieExisteNoPerfil(fullSerie))) {
                    $scope.series.push(fullSerie);
                }
                else {
                    alert("Essa série já existe no seu perfil.");
                }
            }).catch(function(error){
                console.log(error);
            });
    };

    $scope.adicionarSerieAoWatchlist = function(nomeserie){
        var promise = $http.get('https://omdbapi.com/?i=' + nomeserie.imdbID + '&plot=full&apikey=93330d3c');
        promise.then(function(response){
            var fullSerie = response.data;
            if (!($scope.serieExisteNoWatchlist(fullSerie))) {
                $scope.watchlist.push(fullSerie);
            }
            else {
                alert("Essa série já existe no seu Watchlist.");
            }

        }).catch(function(error){
            console.log(error);
        });
    };

    $scope.transferirSerie = function (serie) {
        if (!($scope.serieExisteNoPerfil(serie))) {
            $scope.series.push(serie);
            $scope.watchlist.pop(serie);
        }
        else {
            alert("Essa série já existe no seu perfil.");
        }

    };

    $scope.apagarSerie = function (serie) {
        var resposta = confirm("Tem certeza que deseja remover a série " + serie.Title + " do seu perfil?");
        if (resposta == true) {
            $scope.series.pop(serie);
        }
    };

    $scope.apagarSerieDoWatchlist = function (serie) {
        var resposta = confirm("Tem certeza que deseja remover a série " + serie.Title + " do seu watchlist?");
        if (resposta == true) {
            $scope.watchlist.pop(serie);
        }
    };

    $scope.avaliarSerie = function (serie, nota) {
        if (nota < 10 || nota > 0) {
            serie.avaliacaoUsuario = nota;
        }
        else {
            alert("Insira uma nota de 0 à 10.");
        }
    };

    $scope.alterarUltimoEpisodio = function (serie, episodio) {
        serie.ultimoEpisodio = episodio;
    }

    // Métodos auxiliares

    $scope.serieExisteNoPerfil = function(seriePesquisada) {
        for (var i = 0; i < $scope.series.length; i++) {
            if ($scope.series[i].imdbID === seriePesquisada.imdbID){
                return true;
            }
        }
        return false;
    }

    $scope.serieExisteNoWatchlist = function(seriePesquisada) {
        for (var i = 0; i < $scope.watchlist.length; i++) {
            if ($scope.watchlist[i].imdbID === seriePesquisada.imdbID){
                return true;
            }
        }
        return false;
    }

    $scope.searched = function(){
        return $scope.statusSerie === "Movie not found!";

    };

});
