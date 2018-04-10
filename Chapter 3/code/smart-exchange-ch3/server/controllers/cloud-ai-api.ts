import * as request from 'request';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as cloudinary from 'cloudinary';

import Message from '../models/message';

dotenv.config();

const API_KEY = process.env.GCP_API_KEY;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

export default class CloudAIAPI {
	respondErrorMessage = (res, err) => {
		return res.status(500).json(err);
	}

	uploadImage = (req, res) => {
		// console.log('req.file', req.file);
		const filePath = req.file.path;
		this.base64_encode(filePath).then((BASE64_CONTENT) => {
			const formData = JSON.stringify({
				'requests': [
					{
						'image': {
							'content': BASE64_CONTENT
						},
						'features': [
							{
								'type': 'LABEL_DETECTION'
							}, {
								'type': 'SAFE_SEARCH_DETECTION'
							}
						]
					}
				]
			});

			var options = {
				method: 'POST',
				url: 'https://vision.googleapis.com/v1/images:annotate',
				qs: {
					key: `${API_KEY}`
				},
				body: formData
			};

			request(options, (error, response, body) => {
				if (error) {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					return this.respondErrorMessage(res, error);
				}

				let results = this.getJSONObject(body);
				if (!results) {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					return this.respondErrorMessage(res, { 'message': 'Invalid Response from Google Cloud Vision API' });
				}
				results = results.responses;

				let labelAnnotations = results[0].labelAnnotations;
				let safeSearchAnnotations = results[0].safeSearchAnnotation;

				if (safeSearchAnnotations.adult === 'POSSIBLE') {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					return res.status(400).json({
						message: 'Adult Content is not allowed'
					})
				}

				if (safeSearchAnnotations.medical === 'POSSIBLE') {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					return res.status(400).json({
						message: 'Medical Content'
					})
				}

				if (safeSearchAnnotations.violence === 'POSSIBLE') {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					return res.status(400).json({
						message: 'Violence Content violence'
					})
				}

				let msg = new Message();
				msg.thread = req.params.threadId;
				msg.createdBy = req.user;
				msg.lastUpdatedBy = req.user;
				msg.labels = labelAnnotations;
				msg.safeSearchProps = safeSearchAnnotations;

				// Upload our image to cloudinary for external file hosting
				// This is optional & you can use any service for the same
				cloudinary.uploader.upload(filePath, (result) => {
					// Delete the local file so we don't clutter
					this.deleteFile(filePath);
					if (result.error) {
						return res.status(400).json({
							message: result.error.message
						});
					}

					msg.cloudinaryProps = result;
					msg.description = `<img style="max-width:80%; height:auto;" src="${result.secure_url}" alt="${result.original_filename}">`

					msg.save((err, msg) => {
						if (err) {
							return this.respondErrorMessage(res, err);
						}
						res.status(200).json(msg);
					});
				});
			});
		});
	}

	// Helpers
	// https://stackoverflow.com/a/24526156/1015046
	base64_encode = (filePath) => {
		return new Promise((res, rej) => {
			try {
				// read binary data
				const bitmap = fs.readFileSync(filePath);
				// convert binary data to base64 encoded string
				const base64String = new Buffer(bitmap).toString('base64');
				res(base64String);
			} catch (e) {
				rej(e);
			}
		});
	}

	getJSONObject = (jsonStr) => {
		try {
			return JSON.parse(jsonStr);
		} catch (ex) {
			return false;
		}
	}

	deleteFile = (filePath: string) => {
		fs.unlink(filePath);
	}
}