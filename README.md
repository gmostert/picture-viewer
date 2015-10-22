# momentum-retail-portal-user-js

## Description
An angular project that contains a service that allows you to check whether the currently logged in user is impersonated or not.

## Usage

Inject the validation service and call the desired functions on it

    myApp.controller('myContronller', function(MomentumRetailPortalUserService) {
        isUserImpersonated = MomentumRetailPortalUserService.isUserImpersonated();
    });
    
Make sure to one-time bind any elements that is restricted by impersonation
    
    <div ng-if="::!isUserImpersonated">Sensitive data not to be viewed by an impersonated user</div>

#### Get module via npm

Require module (using a unique namespace)

    var momentumRetailPortalUser = require('momentum-retail-portal-user').getModule('my.app.namespace.portal.user');

Inject module into app as a dependency

    ng.module('myApp', [momentumRetailPortalUser.name]);
    
#### Get module via content server

Add a script tag that points to the module on the content server

    <script src="CONTENT_SERVER_PATH/momentum-retail-portal-user/VERSION/js/app.min.js"></script>

Include the module when manually bootstrapping your app

    angular.bootstrap(document.getElementById("elementId"), ['myApp', 'momentum.retail.portal.user']);

## GitLab Location
http://momgitdev101.metmom.mmih.biz/platform/momentum-retail-portal-user-js.git