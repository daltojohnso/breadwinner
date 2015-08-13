brd.login = (function() {
    'use strict';
    var config, state, initModule, login, showForm, logout, listeners, jqueryMap, setJqueryMap;

    config = {
        text: _.template('Hello, ${ user }')
    };

    state = {
        $container: undefined,
        loggedIn: false
    };

    var loginHtml = [
        '<a href="/auth/google">Login with Google</a>',
        '<p style="display:none"></p>',
        '<form id="brd-login-form" action="/login" method="post" style="display:none">',
            '<input type="text" name="username"/>',
            '<input type="password" name="password"/>',
            '<button type="submit">Login</button>',
        '</form>'
    ].join('\n');

    setJqueryMap = function() {
        var $container = state.$container;
        jqueryMap = {
            $container: $container,
            $link: $container.find('a'),
            $form: $container.find('#brd-login-form'),
            $button: $container.find('button'),
            $p: $container.find('p')
        }
    };

    listeners = function() {
        jqueryMap.$link.click(function() {
            //state.loggedIn ? logout() : showForm();
        });
        jqueryMap.$button.click(login);
    };

    showForm = function() {
        jqueryMap.$form.show().children().first().focus();
    };

    login = function(name) {
        if (!name) return false;
        jqueryMap.$link.hide();
        jqueryMap.$p.show().text(config.text({user: name}));
    };

    logout = function() {
        $.get('/logout');
    };

    initModule = function($container, loggedIn) {
        state.$container = $container;
        state.loggedIn = !!loggedIn;
        $container.html(loginHtml);
        setJqueryMap();
        listeners();
    };

    return {
        initModule: initModule,
        login: login
    }
}());