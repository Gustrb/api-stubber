
/**
 * This proxy is made in order to test external application's failures
 * 
 * So it works like this:
 * - You create a configuration file containing the list of routes that you want to fail, alongside with the HTTP status code and the response body.
 * - You run the server with the configuration file.
 * 
 * The server will then listen to the routes and return the configured response.
 * If the route is not configured it will fallthrough to the real server.
 * 
 * The config file comes from the environment variable `PROXY_CONFIG_FILE`.
 */
const express = require('express');
const fs = require('fs');

function loadConfigFile(configFilePath) {
    try {
        const fileContents = fs.readFileSync(configFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Failed to load config file', error);
        process.exit(1);
    }
}

function routeMatch(path, route) {
    const pathParts = path.split('/');
    const routeParts = route.split('/');

    if (pathParts.length !== routeParts.length) {
        return false;
    }

    for (let i = 0; i < pathParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
            continue;
        }

        if (pathParts[i] !== routeParts[i]) {
            return false;
        }
    }

    return true;
}

function validateConfig(config) {
    if ('fallbackUrl' in config) {
        if (typeof config.fallbackUrl !== 'string') {
            throw new Error('fallbackUrl must be a string');
        }
    } else {
        throw new Error('fallbackUrl is required');
    }

    if ('routes' in config) {
        if (!Array.isArray(config.routes)) {
            throw new Error('routes must be an array');
        }

        config.routes.forEach(route => {
            if (!('method' in route)) {
                throw new Error('method is required');
            }

            if (!['GET', 'POST', 'PUT', 'DELETE'].includes(route.method)) {
                throw new Error('method must be one of GET, POST, PUT, DELETE');
            }

            if (!('path' in route)) {
                throw new Error('path is required');
            }

            if (typeof route.path !== 'string') {
                throw new Error('path must be a string');
            }

            if (!('status' in route)) {
                throw new Error('status is required');
            }

            if (typeof route.status !== 'number') {
                throw new Error('status must be a number');
            }

            if (route.status < 100 || route.status >= 600) {
                throw new Error('status must be a valid HTTP status code');
            }

            if (!('body' in route)) {
                throw new Error('body is required');
            }
        });
    }
}

function main() {
    const configFilePath = process.env.PROXY_CONFIG_FILE || './config.json';
    const config = loadConfigFile(configFilePath);
    validateConfig(config);
    const fallbackUrl = config.fallbackUrl;
    if (!fallbackUrl) {
        console.error('No fallback URL configured');
        process.exit(1);
    }
    const app = express();
    
    app.use((req, res) => {
        config.routes.forEach(route => {
            if (route.method === req.method && routeMatch(req.path, route.path)) {
                console.log(`Matched route ${req.method} ${req.path} with status ${route.status}`);
                res.status(route.status).send(route.body);
                return;
            }

            console.log(`No route found for ${req.method} ${req.path}, falling back to ${fallbackUrl}`);
            // redirect to the real server
            res.redirect(fallbackUrl + req.path);
        });
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

main();
