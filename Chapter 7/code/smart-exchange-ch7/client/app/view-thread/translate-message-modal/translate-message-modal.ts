import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { TranslateAPIService } from '../../services/translate.api.service';

@Component({
	selector: 'sm-create-asset-modal',
	templateUrl: './translate-message-modal.html'
})
export class TranslateMessageModal {
	@Input() message; // fetch from view-thread page
	@Output() updateMessage = new EventEmitter<any>(); // Update the view-thread component with updated message
	error: string = '';
	isProcessing: boolean = false;
	languages = [];
	targetLang = '';

	constructor(
		public activeModal: NgbActiveModal,
		public translateAPIService: TranslateAPIService,
		private route: ActivatedRoute
	) {
		this.getSupportedLangs();		
	}

	ngOnInit(){
		this.message.translations = this.message.translations || {};
	}

	getSupportedLangs() {
		this.translateAPIService.getSupportedLanguages()
			.subscribe(data => {
				this.languages = data;
				this.languages.unshift({
					code : '',
					name : '--'
				});
			}, (err) => {
				console.error(err);
			})
	}

	translate() {
		this.isProcessing = true;
		this.error = '';
		this.translateAPIService
			.translateText(this.message, this.targetLang)
			.subscribe((data) => {
				this.message = data;
				this.updateMessage.emit(data);
				this.isProcessing = true;
			}, (err) => {
				console.error(err);
				this.isProcessing = false;
				this.error = err;
			});
	}

	onChange(val){
		this.targetLang = val;
	}
}
