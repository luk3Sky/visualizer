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
    // @luk3Sky
    // This isn't an urgent requirement, but better if we can implement this

    const storedCredentials = localStorage.getItem(document.location.href.split('?')[0] + '.credentials');
    const username = getUrlParam('username', false);
    const password = getUrlParam('password', false);
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
        clearParams();
        // decode the api key
        localStorage.setItem(document.location.href.split('?')[0] + '.key', key);
        console.log(decodeKey(key));
    } else {
        return -1;
    }
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
