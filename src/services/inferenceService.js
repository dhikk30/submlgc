require('dotenv').config();
const tf = require('@tensorflow/tfjs-node');

async function predictClassification(image) {
    try {
        const model = await tf.loadGraphModel(process.env.MODEL_URL);

        const tensor = tf.node
        .decodeImage(image)
        .resizeNearestNeighbor([224, 224])
        .expandDims()
        .toFloat()
        .div(tf.scalar(255.0));

        const classes = ['Cancer', 'Non-cancer'];

        const prediction = model.predict(tensor);
        const scores = prediction.dataSync();
        const confidenceScore = Math.max(...scores) * 100;
        const resultIndex = tf.argMax(prediction, 1).dataSync()[0];
        const label = classes[resultIndex];

        let result, suggestion;

        if (confidenceScore > 58) {
            result = label;
            suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Anda sehat!';
          } else {
            result = label === 'Cancer' ? 'Non-cancer' : 'Cancer';
            suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Anda sehat!';
          }
      
          return { confidenceScore, result, suggestion };
        } catch (error) {
          console.error('Error during prediction:', error);
          throw new Error('Terjadi kesalahan dalam melakukan prediksi');
        }
      };

module.exports = predictClassification;