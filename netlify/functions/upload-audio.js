const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Upload the audio string to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(body.audio, {
      resource_type: 'auto', // Automatically detects it is audio
      folder: 'notely_memos',
      type: 'upload'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResponse.secure_url })
    };
  } catch (error) {
    console.error("Cloudinary upload function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};