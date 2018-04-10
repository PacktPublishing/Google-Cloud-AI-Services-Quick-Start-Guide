import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { VideoAPIService } from '../../services/video.api.service';

import * as RecordRTC from 'recordrtc/RecordRTC.min';

@Component({
	selector: 'sm-create-asset-modal',
	templateUrl: './upload-video-modal.html'
})
export class UploadVideoModal implements AfterViewInit {
	@Input() threadId; // fetch from view-thread page
	@Output() updateThread = new EventEmitter<any>(); // Update main thread with new message
	error: string = '';
	isProcessing: boolean = false;
	isRecording: boolean = false;
	hasRecorded: boolean = false;

	private stream: MediaStream;
	private recordRTC: any;

	@ViewChild('video') video;

	// Credits: https://medium.com/@SumanthShankar/integrate-recordrtc-with-angular-2-typescript-942c9c4ca93f
	constructor(
		public activeModal: NgbActiveModal,
		public videoAPIService: VideoAPIService,
		private route: ActivatedRoute
	) { }

	ngAfterViewInit() {
		// set the initial state of the video
		let video: HTMLVideoElement = this.video.nativeElement;
		video.muted = false;
		video.controls = true;
		video.autoplay = false;
	}

	startRecording() {
		this.isRecording = true;
		const video: MediaTrackConstraints = {
			width: 640,
			height: 480
		};

		const mediaConstraints: MediaStreamConstraints = {
			video: video,
			audio: true
		};

		navigator
			.mediaDevices
			.getUserMedia(mediaConstraints)
			.then(this.successCallback.bind(this), this.errorCallback.bind(this));

		// allow users to record maximum of 10 second videos
		setTimeout(() => {
			this.stopRecording();
		}, 10000)
	}

	successCallback(stream: MediaStream) {
		let options = {
			mimeType: 'video/webm',
			audioBitsPerSecond: 512000, // 512kbps
			videoBitsPerSecond: 512000 // 512kbps
		};

		this.stream = stream;
		this.recordRTC = RecordRTC(stream, options);
		this.recordRTC.startRecording();
		let video: HTMLVideoElement = this.video.nativeElement;
		video.src = window.URL.createObjectURL(stream);
		this.toggleControls();
	}

	errorCallback() {
		//handle error here
		console.error('Somethig went horribly wrong!!', this); //print the state for debugging [Only during dev.]
	}

	stopRecording() {
		let recordRTC = this.recordRTC;
		recordRTC.stopRecording(this.processVideo.bind(this));
		let stream = this.stream;
		stream.getAudioTracks().forEach(track => track.stop());
		stream.getVideoTracks().forEach(track => track.stop());
		this.hasRecorded = true;
		this.isRecording = false;
	}

	processVideo(audioVideoWebMURL) {
		let video: HTMLVideoElement = this.video.nativeElement;
		video.src = audioVideoWebMURL;
		this.toggleControls();
		// Peek the output if you would like!
		// let recordRTC = this.recordRTC;
		// let recordedBlob = recordRTC.getBlob();
		// recordRTC.getDataURL(function(dataURL) { console.log(dataURL) });
	}

	download() {
		this.recordRTC.save(this.genFileName());
	}

	// HELPERS
	genFileName() {
		return 'video_' + (+new Date()) + '_.webm';
	}

	toggleControls() {
		let video: HTMLVideoElement = this.video.nativeElement;
		video.muted = !video.muted;
		video.controls = !video.controls;
		video.autoplay = !video.autoplay;
	}

	reply() {
		this.error = '';
		this.isProcessing = true;
		let recordedBlob = this.recordRTC.getBlob();
		recordedBlob.name = this.genFileName();
		this.videoAPIService.postFile(this.threadId, recordedBlob).subscribe(data => {
			console.log(data);
			this.updateThread.emit(data);
			this.isProcessing = false;
			this.activeModal.close();
		}, error => {
			console.log(error);
			this.error = error.error;
			this.isProcessing = false;
		});
	}

}