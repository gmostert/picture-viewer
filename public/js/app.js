angular.module('appRoutes', []);
angular.module('appCtrls', []);
angular.module('appServices', []);

angular.module('pictureApp', [
    'ngRoute', 
    'appRoutes', 
    'appCtrls', 
    'appServices',
    'checklist-model',
    'jkuri.gallery'
]);
