import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AudioAPIService } from '../../services/audio.api.service';

import * as RecordRTC from 'recordrtc/RecordRTC.min';

@Component({
	selector: 'sm-create-asset-modal',
	templateUrl: './upload-audio-modal.html'
})
export class UploadAudioModal implements AfterViewInit {
	@Input() threadId; // fetch from view-thread page
	@Output() updateThread = new EventEmitter<any>(); // Update main thread with new message
	error: string = '';
	isProcessing: boolean = false;
	isRecording: boolean = false;
	hasRecorded: boolean = false;

	private stream: MediaStream;
	private recordRTC: any;

	@ViewChild('audio') audio;

	constructor(
		public activeModal: NgbActiveModal,
		public audioAPIService: AudioAPIService,
		private route: ActivatedRoute
	) { }


	ngAfterViewInit() {
		// set the initial state of the video
		let audio: HTMLAudioElement = this.audio.nativeElement;
		audio.muted = false;
		audio.controls = true;
		audio.autoplay = false;
		audio.preload = 'auto';
	}

	startRecording() {
		this.isRecording = true;

		const mediaConstraints: MediaStreamConstraints = {
			video: false, // Only audio recording
			audio: true
		};

		navigator
			.mediaDevices
			.getUserMedia(mediaConstraints)
			.then(this.successCallback.bind(this), this.errorCallback.bind(this));

		// allow users to record maximum of 10 second audios
		setTimeout(() => {
			this.stopRecording();
		}, 10000)
	}

	successCallback(stream: MediaStream) {
		let options = {
			recorderType: RecordRTC.StereoAudioRecorder,
			mimeType: 'audio/wav',
			// Must be single channel: https://cloud.google.com/speech/reference/rest/v1/RecognitionConfig#AudioEncoding
			numberOfAudioChannels: 1
		};

		this.stream = stream;
		this.recordRTC = RecordRTC(stream, options);
		this.recordRTC.startRecording();
		let audio: HTMLAudioElement = this.audio.nativeElement;
		audio.src = window.URL.createObjectURL(stream);
		this.toggleControls();
	}

	errorCallback() {
		//handle error here
		console.error('Somethig went horribly wrong!!', this); //print the state for debugging [Only during dev.]
	}

	stopRecording() {
		let recordRTC = this.recordRTC;
		recordRTC.stopRecording(this.processAudio.bind(this));
		let stream = this.stream;
		stream.getAudioTracks().forEach(track => track.stop());
		stream.getVideoTracks().forEach(track => track.stop());
		this.hasRecorded = true;
		this.isRecording = false;
	}

	processAudio(audioURL) {
		let audio: HTMLAudioElement = this.audio.nativeElement;
		audio.src = audioURL;
		this.toggleControls();
		// Peek the output if you would like!
		// let recordRTC = this.recordRTC;
		// let recordedBlob = recordRTC.getBlob();
		// recordRTC.getDataURL(function(dataURL) { console.log(dataURL) });
	}

	download() {
		this.recordRTC.save(this.genFileName());
	}

	genFileName() {
		return 'audio_' + (+new Date()) + '_.wav';
	}

	toggleControls() {
		let audio: HTMLAudioElement = this.audio.nativeElement;
		audio.muted = !audio.muted;
		audio.autoplay = !audio.autoplay;
		audio.preload = 'auto';
	}

	reply() {
		this.error = '';
		this.isProcessing = true;
		let recordedBlob = this.recordRTC.getBlob();
		recordedBlob.name = this.genFileName();
		this.audioAPIService.postFile(this.threadId, recordedBlob).subscribe(data => {
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