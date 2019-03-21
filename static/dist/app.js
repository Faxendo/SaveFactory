angular
.module("SaveFactory", [])
.controller("Main", ["$scope", "$http", function($scope, $http){
    $scope.gameSession = {};
    
    $scope.loadGameSession = () => {
        $http.get('/session').then(resp => {
            $scope.gameSession = resp.data;
        });
    }

    $scope.loadGameSession();
}]);