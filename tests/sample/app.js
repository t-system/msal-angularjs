var Msal = require('msal');
var angular = require('angular');
var MsalAngular = require('@azure/msal-angularjs');

window.applicationConfig = {
    clientID: '79d1dd3f-4de3-4b69-ac25-f2fc5eefe773',
    photoEndpoint: "https://graph.microsoft.com/beta/me/photo/$value",
    calendarEndpoint: "https://graph.microsoft.com/beta/me/calendarview?startdatetime=2018-05-07&enddatetime=2018-05-17&$select=subject,start,end&$orderBy=start/dateTime",
    consentScopes: ["user.read", "calendars.read"],
    graphScopes: ["user.read", "calendars.read"],
    apiScope: ['api://a88bb933-319c-41b5-9f04-eff36d985612/access_as_user'],
    apiEndpoint: "https://buildtodoservice.azurewebsites.net/api/todolist"
};

var map = new Map();
map.set(applicationConfig.apiEndpoint, applicationConfig.apiScope);
map.set(applicationConfig.photoEndpoint, applicationConfig.graphScopes);
map.set(applicationConfig.calendarEndpoint, applicationConfig.graphScopes);

var logger = new Msal.Logger(loggerCallback, { level: Msal.LogLevel.Verbose, correlationId: '12345' });
function loggerCallback(logLevel, message, piiEnabled) {
    console.log(message);
}

if (window !== window.parent && !window.opener) {
    angular.module('todoApp', ['ui.router', 'MsalAngular'])
        .config(['$httpProvider', 'msalAuthenticationServiceProvider','$locationProvider', function ($httpProvider, msalProvider,$locationProvider) {
            msalProvider.init({
                clientID: applicationConfig.clientID,
                authority: 'https://login.microsoftonline.com/msidlab4.onmicrosoft.com',
                tokenReceivedCallback: function (errorDesc, token, error, tokenType) {
                },
                optionalParams: {
                    cacheLocation: 'localStorage',
                    logger: logger,
                    endPoints: map,
                    storeAuthStateInCookie: true
                },
                routeProtectionConfig: {
                    //popUp: true,
                    consentScopes: applicationConfig.consentScopes
                }
            }, $httpProvider);

            $locationProvider.html5Mode(false).hashPrefix('');
        }]);
}
else {
    angular.module('todoApp', ['ui.router', 'MsalAngular'])
        .config(['$stateProvider', '$httpProvider', 'msalAuthenticationServiceProvider','$locationProvider', function ($stateProvider, $httpProvider, msalProvider, $locationProvider) {
            $stateProvider.state("Home", {
                url: '/Home',
                controller: "homeCtrl",
                templateUrl: "/App/Views/Home.html",

            }).state("TodoList", {
                url: '/TodoList',
                controller: "todoListCtrl",
                templateUrl: "/App/Views/TodoList.html",
                requireLogin: true

            }).state("Calendar", {
                url: '/Calendar',
                controller: "calendarCtrl",
                templateUrl: "/App/Views/Calendar.html",
                requireLogin: true
            })

            $locationProvider.html5Mode(false).hashPrefix('');

            msalProvider.init({
                clientID: applicationConfig.clientID,
                authority: 'https://login.microsoftonline.com/msidlab4.onmicrosoft.com',
                tokenReceivedCallback: function (errorDesc, token, error, tokenType) {
                    if (token) {
                        console.log("token received: in callback " + token)
                    } else if (error) {
                        console.log("error received: in callback " + error)
                    }
                },
                optionalParams: {
                    cacheLocation: 'localStorage',
                    logger: logger,
                    endPoints: map,
                    storeAuthStateInCookie : true
                },
                routeProtectionConfig: {
                    //popUp: true,
                    consentScopes: applicationConfig.consentScopes,
                }
            }, $httpProvider);
        }]);
}


