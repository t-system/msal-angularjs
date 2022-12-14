//----------------------------------------------------------------------
// @preserve Copyright (c) Microsoft Open Technologies, Inc.
// All Rights Reserved
// Apache License 2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//----------------------------------------------------------------------

'use strict';
// Test app
var app = angular.module('TestApplication', ['ngResource', 'ngRoute', 'MsalAngular']);

app.config(['$httpProvider', '$routeProvider', 'msalAuthenticationServiceProvider','$locationProvider','$qProvider', function ($httpProvider, $routeProvider, msalAuthenticationServiceProvider, $locationProvider, $qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider.
    when('/home', {
        controller: 'homeController',
        template: '<div>home</div>'
    }).
    when('/about', {
        controller: 'aboutController',
        templateUrl: 'about.html'
    }).
    when('/todoList', {
        controller: 'todoListController',
        template: '<div>todoList</div>',
        requireLogin: true
    }).
    when('/login', {
        controller: 'loginController',
        templateUrl: 'login.html',
    }).
    otherwise({ redirectTo: '/home' });

    window.applicationConfig = {
        clientID: 'f3e5cf63-6c0d-42cb-b5aa-ee58b1ef7523',
        photoEndpoint: "https://graph.microsoft.com/beta/me/photo/$value",
        calendarEndpoint: "https://graph.microsoft.com/beta/me/calendarview?startdatetime=2018-05-07&enddatetime=2018-05-17&$select=subject,start,end&$orderBy=start/dateTime",
        apiScopes: ['api://a88bb933-319c-41b5-9f04-eff36d985612/access_as_user'],
        apiEndpoint: "/api/Todo/",
        anotherApiScopes: ['api://b44bb933-319c-41b5-9f04-eff36d985612/access_as_user'],
        anotherApiEndpoint: '/anotherApi/Item/',
    };

    var map = new Map();
    map.set(applicationConfig.apiEndpoint, applicationConfig.apiScopes);
    map.set(applicationConfig.anotherApiEndpoint, applicationConfig.anotherApiScopes);

    msalAuthenticationServiceProvider.init(
        {
            clientID: 'clientId123',
            authority: null,
            tokenReceivedCallback: function (errorDesc, token, error, tokenType) {
            },

            optionalParams: {
                redirectUri: 'https://myapp.com/page',
                endPoints: map,//remove this line after releasing the new msal version with renamed endpoints
                protectedResourceMap:map
            },
    },
        $httpProvider   // pass http provider to inject request interceptor to attach tokens
    );
    $locationProvider.html5Mode(true).hashPrefix('');

}]);

app.factory('ItemFactory', ['$http', function ($http) {
    var serviceFactory = {};
    var _getItem = function (id) {
        return $http.get('/anotherApi/Item/' + id);
    };

    serviceFactory.getItem = _getItem;
    return serviceFactory;
}]);

app.factory('TaskFactory', ['$http', function ($http) {
    var serviceFactory = {};
    var _getItem = function (id) {
        return $http.get('/api/Todo/' + id);
    };

    var _getItem2 = function (url) {
        return $http.get(url);
    };
    serviceFactory.getItem = _getItem;
    serviceFactory.getItem2 = _getItem2;
    return serviceFactory;
}]);

app.controller('TaskCtl', ['$scope', '$location', 'msalAuthenticationService', 'TaskFactory', 'ItemFactory', function ($scope, $location, msalAuthenticationService, TaskFactory, ItemFactory) {

    $scope.taskCall = function () {
        TaskFactory.getItem(5).then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.itemCall = function () {
        ItemFactory.getItem(13).then(function (response) {
            $scope.item = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.taskCall2 = function () {
        TaskFactory.getItem2('https://test.com/').then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.taskCall3 = function () {
        TaskFactory.getItem2('https://testapi.com/').then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.taskCall4 = function () {
        TaskFactory.getItem2('/someapi/item').then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.taskCall5 = function () {
        TaskFactory.getItem2('https://myapp.com/someapi/item').then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loadingMsg = "";
        });
    }

    $scope.taskCall6 = function () {
        TaskFactory.getItem2('http://testwebapi.com/').then(function (response) {
            $scope.task = response.data;
        }, function (err) {
            $scope.error = err;
            $scope.loaingMsg = "";
        });
    }

    $scope.user = msalAuthenticationService.userInfo;
}]);
