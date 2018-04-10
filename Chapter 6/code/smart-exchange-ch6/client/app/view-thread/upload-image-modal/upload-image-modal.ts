import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { VisionAPIService } from '../../services/vision.api.service';

import { GLOBAL } from '../../services/global.constants';
import { HELPER } from '../../services/helpers.global';

@Component({
	selector: 'sm-create-asset-modal',
	templateUrl: './upload-image-modal.html'
})
export class UploadImageModal {
	fileToUpload: File = null;
	invalidImage: boolean = false;
	largeFile: boolean = false;
	isProcessing: boolean = false;
	AllowedImageExt: Array<string> = GLOBAL.allowedImageExt;
	@Input() threadId; // fetch from view-thread page
	@Output() updateThread = new EventEmitter<any>(); // Update main thread with new message
	error: string = '';
	filePreviewPath: SafeUrl;

	// Credits: https://stackoverflow.com/a/47938117/1015046
	constructor(
		public activeModal: NgbActiveModal,
		public visionAPIService: VisionAPIService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) { }

	reply() {
		this.isProcessing = true;
		this.visionAPIService.postFile(this.threadId, this.fileToUpload).subscribe(data => {
			console.log(data);
			this.updateThread.emit(data);
			this.isProcessing = false;
			this.activeModal.close();
		}, error => {
			console.log(error);
			this.error = error;
			this.isProcessing = false;
		});
	}

	handleFileInput(files: FileList) {
		this.fileToUpload = files.item(0);
		if (!this.fileToUpload) return; // when user escapes the file picker
		if (this.fileToUpload.size > 2000000) { // 2MB max file size
			this.largeFile = true;
		} else {
			this.largeFile = false;
		}
		if (!this.isValidFileType(this.fileToUpload.name)) {
			this.invalidImage = true;
		} else {
			this.invalidImage = false;
		}

		if (!this.invalidImage && !this.largeFile) {
			// Credits: https://github.com/valor-software/ng2-file-upload/issues/158#issuecomment-264982173
			this.filePreviewPath = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(this.fileToUpload)));
		}
	}

	getFileSize(): string {
		return HELPER.getFileSize(this.fileToUpload.size, 0);
	}

	// Private Helper
	private isValidFileType(fName) {
		return this.AllowedImageExt.indexOf(fName.split('.').pop()) > -1;
	}

}