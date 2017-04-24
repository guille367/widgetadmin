angular.module('ngApp').controller('MyOwnCtrl',['$scope','MyService',function($scope,MyService){

    $scope.prueba = MyService.falopa;

}]);