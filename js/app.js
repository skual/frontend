requirejs.config({
    //By default load any module IDs from js/lib
    'baseUrl': 'js/app',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    'paths': {
        'bootstrap':  '../../assets/bootstrap-2.1.1/js/bootstrap.min',
        'codemirror': '../../assets/codemirror-2.3.4/js/',
        'Skual':      '../../config',
        'plugins':    '../lib/plugins'
    }
});

var modules = [];
modules.push('jquery');
modules.push('Skual');
modules.push('bootstrap');
modules.push('bootstrap');
modules.push('plugins');

modules.push('session');
modules.push('query');
modules.push('databases');


// Start the main app logic.
requirejs(modules, function ($) {});