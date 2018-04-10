import * as express from 'express';
import * as multer from 'multer';

const UPLOAD_PATH = __dirname + '/../uploads';
const upload = multer({ dest: `${UPLOAD_PATH}/` });

import { Authenticate, Authorize } from '../auth';

import CloudAIAPI from '../controllers/cloud-ai-api';

export default function defineCloudAIAPIRoutes(app) {
	const router = express.Router();
	const cloudAIAPI = new CloudAIAPI();

	// Upload Single Images
	router.post('/upload-image/:threadId', Authenticate, Authorize('user'), upload.single('image-reply'), cloudAIAPI.uploadImage);
	// Upload Single Video
	router.post('/upload-video/:threadId', Authenticate, Authorize('user'), upload.single('video-reply'), cloudAIAPI.uploadVideo);
	// Upload Single Audio
	router.post('/upload-audio/:threadId', Authenticate, Authorize('user'), upload.single('audio-reply'), cloudAIAPI.uploadAudio);
	// Natural Language API
	router.post('/post-message', Authenticate, Authorize('user'), cloudAIAPI.postMessage);
	// Translation API
	router.get('/supported-languages', Authenticate, Authorize('user'), cloudAIAPI.getSupportedLanguages);
	router.post('/translate-message/:target', Authenticate, Authorize('user'), cloudAIAPI.translateMessage);
	
	// Apply the routes to our application with the prefix /api
	app.use('/api', router);
}
