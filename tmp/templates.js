angular.module('templates-main', ['../views/users/login.pug', '../views/users/signup.pug']);

angular.module("../views/users/login.pug", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../views/users/login.pug",
    ".row(ng-controller='LoginController as ctrl') .col-md-3 .col-md-6 section.login h1 Login to Web App form#user-login-form(role='form', name='userLoginForm', ng-submit='ctrl.submit()') p input(type='text', name='login', ng-model='ctrl.user.username', placeholder='Email', ng-required='', ng-minlength='6') p input(type='password', name='pwd', ng-model='ctrl.user.password', placeholder='Password', ng-required='') p.remember_me label input#remember_me(type='checkbox', name='remember_me') | Remember me on this computer p.submit input.btn-login(type='submit',name='commit', value='Login', ng-disabled='userLoginForm.$invalid') .login-help p | Forgot your password? a(href='index.html') Click here to reset it | . .clearfix.hidden-sm-up .col-md-3");
}]);

angular.module("../views/users/signup.pug", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../views/users/signup.pug",
    "");
}]);
