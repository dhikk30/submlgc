const Hapi = require('@hapi/hapi');
const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const ClientError = require('../exceptions/ClientError');
const InputError = require('../exceptions/InputError');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    try {
        const chunks = [];
        for await (const chunk of image) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const base64String = buffer.toString('base64');
        const base64Data = base64String.replace(/^data:image\/(png|jpeg);base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const { confidenceScore, result, suggestion } = await predictClassification(imageBuffer);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id: id,
            result: result,
            suggestion: suggestion,
            createdAt: createdAt
        };

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: confidenceScore > 99 ? 'Model is predicted successfully but under threshold. Please use the correct picture' : 'Model is predicted successfully',
            data: data
        });
        response.code(201);
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: error.message
        });
        response.code(error.statusCode || 400);
        return response;
    }
}

module.exports = postPredictHandler;