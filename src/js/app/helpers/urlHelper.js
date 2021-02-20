let jwt = require('jsonwebtoken');

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

export function getCredentials() {
    // TODO: Add channel, host and port into URL (as optional parameters)
    // Suggestion: Use JWT insted of exposed credentials
    // Simulator server can provide the JWT token
    const storedCredentials = localStorage.getItem(document.location.href.split('?')[0] + '.credentials');
    const username = getUrlParam('username', false);
    const password = getUrlParam('password', false);
    const key = getUrlParam('key', false);
    const channel = getUrlParam('channel', false);
    const port = getUrlParam('port', false);
    const server = getUrlParam('server', false);
    clearParams();
    setTimeout(() => {
        if (server !== false) {
            localStorage.setItem(document.location.href.split('?')[0] + '.server', server);
        }
        if (channel !== false) {
            localStorage.setItem(document.location.href.split('?')[0] + '.channel', channel);
        }
        if (port !== false) {
            localStorage.setItem(document.location.href.split('?')[0] + '.port', port);
        }
        if (key !== false) {
            localStorage.setItem(document.location.href.split('?')[0] + '.key', key);
        }
    }, 2000);
    if (username === false && password === false && storedCredentials !== null) {
        return JSON.parse(storedCredentials);
    } else if (username !== false && password !== false) {
        localStorage.setItem(
            document.location.href.split('?')[0] + '.credentials',
            JSON.stringify({
                username,
                password
            })
        );
        return {
            username,
            password
        };
    } else if (key !== false) {
        // decode the api key
        return decodeKey(key);
    } else {
        return -1;
    }
}

function clearParams() {
    console.log('clear');
    // history.replaceState &&
    //     history.replaceState(
    //         null,
    //         '',
    //         location.pathname + location.search.replace(/[\?&]message=[^&]+/, '').replace(/^&/, '?')
    //     );

    // TODO: bug in here 
    // window.history.replaceState({}, document.title, '/' + '');
    // location.pathname + location.search.replace(/[\?&]message=[^&]+/, '').replace(/^&/, '?') + location.hash
    // location.pathname + location.search.replace(/[\?&]message=[^&]+/, '').replace(/^&/, '?')
}

function decodeKey() {
    try {
        let decoded = jwt.verify(token, 'swarm-visualizer-secret');
        return decoded;
    } catch (err) {
        // err
        console.log('Token Error');
        return -1;
    }
}
