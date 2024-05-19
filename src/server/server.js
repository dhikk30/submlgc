require('dotenv').config();
 
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
const { ClientError } = require('../exceptions/ClientError');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0'
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreHandler', (request, h) => {
        const { payload } = request;
        if (!payload || !payload.image || payload.image.bytes > 1000000) {
            throw new ClientError('Payload content length greater than maximum allowed: 1000000');
        }
        return h.continue;
    });

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (!response.isBoom) {
            return h.continue;
        }

        const { statusCode, message } = response.output.payload;

        return h.response({
            status: statusCode === 400 ? 'error' : 'fail',
            message: message
        }).code(statusCode).takeover();
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();