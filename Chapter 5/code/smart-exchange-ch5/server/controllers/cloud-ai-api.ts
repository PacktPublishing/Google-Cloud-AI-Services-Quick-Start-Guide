import * as request from 'request';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as cloudinary from 'cloudinary';

import Message from '../models/message';

dotenv.config();

const API_KEY = process.env.GCP_API_KEY;

// Setup Video Intelligence Client
const video = require('@google-cloud/video-intelligence').v1;
const client = new video.VideoIntelligenceServiceClient({
	credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});

// Setup Cloud Speech Client
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient({
	credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});

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


	uploadVideo = (req, res) => {
		// console.log('req.file', req.file);
		const filePath = req.file.path;
		this.base64_encode(filePath).then((BASE64_CONTENT) => {
			const request = {
				inputContent: BASE64_CONTENT,
				features: ['EXPLICIT_CONTENT_DETECTION', 'LABEL_DETECTION']
			};

			client
				.annotateVideo(request)
				.then((results) => {
					const operation = results[0];
					console.log('Waiting for operation to complete...');
					return operation.promise();
				})
				.then(results => {
					// Gets annotations for video
					const annotations = results[0].annotationResults[0];
					const explicitContentResults = annotations.explicitAnnotation;
					const segmentLabelAnnotations = annotations.segmentLabelAnnotations;

					// console.log(JSON.stringify(annotations, null, 4));
					let isExplicit = false;
					let explictLabels = [];

					if (explicitContentResults) {
						explicitContentResults.frames.forEach((result) => {
							var o: any = {};
							// console.log('result', JSON.stringify(result, null, 4));
							o.timeOffset = result.timeOffset;
							o.pornographyLikelihood = result.pornographyLikelihood;
							explictLabels.push(JSON.parse(JSON.stringify(o)));

							if (result.pornographyLikelihood > 2) isExplicit = true;
						});
					}

					let segmentLabels = [];
					if (segmentLabelAnnotations) {
						segmentLabelAnnotations.forEach((label) => {
							let o: any = {};
							// console.log('label', JSON.stringify(label, null, 4));
							o.entity = label.entity;
							o.categoryEntities = label.categoryEntities;
							o.segments = label.segments; // array
							segmentLabels.push(JSON.parse(JSON.stringify(o)));
						});
					}

					if (isExplicit) {
						this.deleteFile(filePath);
						return res.status(400).json({
							message: 'Adult Content is not allowed'
						})
					}

					// Upload our video to cloudinary for external file hosting
					// This is optional & you can use any service for the same
					cloudinary.v2.uploader.upload(filePath, {
						resource_type: 'video'
					}, (error, result) => {
						// console.log('result: ', result);
						// console.log('error', error);

						if (error) {
							return res.status(400).json({
								message: error.message
							});
						}

						let msg: any = {};
						msg.thread = req.params.threadId;
						msg.createdBy = req.user;
						msg.lastUpdatedBy = req.user;
						msg.explicitVideoAnnotation = explictLabels;
						msg.segmentLabelAnnotations = segmentLabels;

						msg.cloudinaryProps = result;
						msg.description = `<div align="center" class="embed-responsive embed-responsive-16by9">
							<video loop class="embed-responsive-item" controls>
								<source src="${result.secure_url}">
								Your browser does not support the video tag.
							</video>
						</div>`

						// console.log('msg', JSON.stringify(msg, null, 4));

						let message = new Message(msg);
						message.save((err, msg) => {
							if (err) {
								console.log(err);
								return this.respondErrorMessage(res, err);
							}
							res.status(200).json(msg);
						});

						// Delete the local file so we don't clutter
						this.deleteFile(filePath);
					});

				})
				.catch(err => {
					console.error('ERROR:', err);
					return res.status(500).json(err);
				});
		});
	}

	uploadAudio = (req, res) => {
		const filePath = req.file.path;
		this.base64_encode(filePath).then((BASE64_CONTENT) => {
			const config = {
				encoding: 'LINEAR16',
				sampleRateHertz: 44100,
				languageCode: 'en-us',
			};

			const audio = {
				content: BASE64_CONTENT
			};

			const request = {
				config: config,
				audio: audio,
			};

			speechClient
				.recognize(request)
				.then((data) => {

					// console.log('data', JSON.stringify(data, null, 4));
					const transcriptions = [];
					const response = data[0];

					response.results.forEach((result) => {
						let o: any = {};
						// You can get other alternatives as well
						o.transcript = result.alternatives[0].transcript;
						o.words = result.alternatives[0].words;
						o.confidence = result.alternatives[0].confidence;
						transcriptions.push(o);
					});

					// Upload our audio to cloudinary for external file hosting
					// This is optional & you can use any service for the same
					cloudinary.v2.uploader.upload(filePath, {
						resource_type: 'auto'
					}, (error, result) => {
						// console.log('result: ', result);
						// console.log('error', error);

						if (error) {
							return res.status(400).json({
								message: error.message
							});
						}

						let msg: any = {};
						msg.thread = req.params.threadId;
						msg.createdBy = req.user;
						msg.lastUpdatedBy = req.user;
						msg.transcriptions = transcriptions;

						msg.cloudinaryProps = result;
						msg.description = `<div align="center" class="embed-responsive-16by9">
							<audio class="embed-responsive-item" controls>
								<source src="${result.secure_url}">
								Your browser does not support the audio tag.
							</audio>
						</div>`

						console.log('msg', JSON.stringify(msg, null, 4));

						let message = new Message(msg);
						message.save((err, msg) => {
							if (err) {
								console.log(err);
								return this.respondErrorMessage(res, err);
							}
							res.status(200).json(msg);
						});

						// Delete the local file so we don't clutter
						this.deleteFile(filePath);
					});
				})
				.catch(err => {
					console.error('ERROR:', err);
					return res.status(500).json(err);
				});
		})
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