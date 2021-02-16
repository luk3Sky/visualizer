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
        // TODO: @NuwanJ please review this
        // Manually returen this for now, we need to discuss the unauthorized verison handling part
        // For now an alert will pop up.
        // } else if (storedCredentials === null) {
        //     return {
        //         username: 'swarm_user',
        //         password: 'swarm_usere15'
        //     };
    } else {
        return -1;
    }
}
