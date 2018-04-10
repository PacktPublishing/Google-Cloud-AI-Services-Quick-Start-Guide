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

	// Apply the routes to our application with the prefix /api
	app.use('/api', router);
}
