const tf = require('@tensorflow/tfjs-node');
const modelUrl = process.env.MODEL_URL;

async function loadModel() {
    if (!modelUrl) {
        throw new Error('modelUrl in loadGraphModel() cannot be null. Please provide a valid URL.');
    }

    return tf.loadGraphModel(modelUrl);
}

module.exports = loadModel;