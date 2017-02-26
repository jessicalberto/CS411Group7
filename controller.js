var myApp = angular.module("myApp", []);
myApp.controller("myApp-Ctrl", ["$scope", "$http", function($scope, $http) {

  $scope.display="NAN";
  $scope.recshots = 0;
  $scope.recbeers = 0;
  $scope.recglasses = 0;

  $scope.beerpic = "http://i.imgur.com/BSwWqeC.png";
  $scope.shotspic = "http://i.imgur.com/Yt9yOri.jpg";
  $scope.winepic = "http://i.imgur.com/E4YpADc.png";

  //100-120 0.5 for relaxed, 1 for buzzed/tipsy, 2+ for drunk
  //120-140 1 for relaxed, 2 for buzzed/tipsy, 3+ for drunk
  //140-160 1 for relaxed, 2-3 for buzzed/tipsy, 4 for drunk
  //180-200 1-2 for relaxd, 3-4 for buzzed/tipsy, 4+ for drunk
  //220-240+ 1-2 for relaxed, 2-3 for buzzed, 3-4 for tipsy, 5+ drinks for drunk

  $scope.hoverRelax = function(){
    this.hoverRelaxmsg = true;
  };
  $scope.hoverOutRelax = function(){
    this.hoverRelaxmsg = false;
  };

  $scope.hoverBuzz = function() {
    this.hoverBuzzmsg = true;
  };
  $scope.hoverOutBuzz = function() {
    this.hoverBuzzmsg = false;
  };
  $scope.hoverTipsy = function() {
    this.Tipsymsg = true;
  };
  $scope.hoverOutTipsy = function() {
    this.Tipsymsg = false;
  }
  $scope.hoverDrunk = function() {
    this.Drunkmsg = true;
  };
  $scope.hoverOutDrunk = function() {
    this.Drunkmsg = false;
  };

  $scope.displayrelax = function() {
    if ($scope.userweight >= 100 && $scope.userweight < 120) {
      $scope.display = "0 to 0.5";
    }
    else if ($scope.userweight >= 120 && $scope.userweight < 140) {
      $scope.display = "1";
    }
    else if ($scope.userweight >= 140 && $scope.userweight < 160) {
      $scope.display = "1";
    }
    else if ($scope.userweight >= 180 && $scope.userweight < 200) {
      $scope.display = "1 to 2";
    }
    else {
      $scope.display = "1 to 2";
    }
  }

  $scope.displaybuzz = function() {
      if ($scope.userweight >= 100 && $scope.userweight < 120) {
        $scope.display = "1";
      }
      else if ($scope.userweight >= 120 && $scope.userweight < 140) {
        $scope.display = "2";
      }
      else if ($scope.userweight >= 140 && $scope.userweight < 160) {
        $scope.display = "2 to 3";
      }
      else if ($scope.userweight >= 180 && $scope.userweight < 200) {
        $scope.display = "2 to 3";
      }
      else {
        $scope.display = "2 to 4";
      }
    }

    $scope.displaytipsy = function() {
        if ($scope.userweight >= 100 && $scope.userweight < 120) {
          $scope.display = "1";
        }
        else if ($scope.userweight >= 120 && $scope.userweight < 140) {
          $scope.display = "2";
        }
        else if ($scope.userweight >= 140 && $scope.userweight < 160) {
          $scope.display = "2 to 3";
        }
        else if ($scope.userweight >= 180 && $scope.userweight < 200) {
          $scope.display = "3 to 4";
        }
        else {
          $scope.display = "3 to 4";
        }
      }

      $scope.displaydrunk = function() {
          if ($scope.userweight >= 100 && $scope.userweight < 120) {
            $scope.display = "2+";
          }
          else if ($scope.userweight >= 120 && $scope.userweight < 140) {
            $scope.display = "3+";
          }
          else if ($scope.userweight >= 140 && $scope.userweight < 160) {
            $scope.display = "4";
          }
          else if ($scope.userweight >= 180 && $scope.userweight < 200) {
            $scope.display = "4+";
          }
          else {
            $scope.display = "5+";
          }
        }

  $scope.calculateBAC = function() {
    var totaldrinks = $scope.beers + $scope.shots + $scope.glasses;

    if ($scope.userweight >= 100 && $scope.userweight < 120) {

      if ((totaldrinks) <= 2) {
        $scope.bactotal = 0.04* (totaldrinks);
      }
      else if ((totaldrinks) <= 6 && totaldrinks > 2){
        $scope.bactotal = (0.04*totaldrinks) - 0.01;
      }
      else if (totaldrinks > 6) {
        $scope.bactotal = (0.04*totaldrinks) - 0.02;
      }

    }
    else if ($scope.userweight >= 120 && $scope.userweight <= 140) {

      if (totaldrinks <= 4) {
      $scope.bactotal = 0.03* totaldrinks;
      }
      else if (totaldrinks > 4) {
        $scope.bactotal = 0.03*totaldrinks + 0.01;
      }

    }
    else {

      $scope.bactotal = 10000;

    }

  }

  var refresh = function() {

  $http.get("/userlist").success(function(response) {
    console.log("got the data requested from backend!");
    $scope.userlist = response;
    $scope.user = "";
  });
};

refresh();

}]);
