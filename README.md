[HeavyCode](http://heavycode.ru)
=====

*Personal blog ([Koa](http://koajs.com/) &amp; [Angular](http://angularjs.org/) based)*

----------

###Requirements

 - node.js 0.11+ (ES6 generators)
 - mongodb

###Build
Global dependencies: [lineman](http://linemanjs.com), [bower](http://bower.io/)

    cd heavycode
    npm install
    cd frontend
    npm install
    bower install
    lineman build
###Deploy
Requires ruby >= 2.0.0 & [capistrano](http://capistranorb.com/)

    cd heavycode
    cap production deploy
###Run localy
Development mode:

    cd heavycode
    node --harmony server.js [--port 3000]
    cd frontend
    lineman run
Production mode

    cd heavycode
    node --harmony server.js --env production [--port 3000]
    cd frontend
    lineman build

###Additionals
Create fake mongodb data

    node --harmony server.js --fake
Bump new version

    cd frontend
    lineman grunt bump
Default admin access

    root:password

