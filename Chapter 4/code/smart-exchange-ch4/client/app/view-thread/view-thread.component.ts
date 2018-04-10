import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { ThreadService } from '../services/thread.service';
import { MessageService } from '../services/message.service';

import { Thread } from '../shared/models/thread.model';
import { Message } from '../shared/models/message.model';

import { UploadImageModal } from './upload-image-modal/upload-image-modal';
import { UploadVideoModal } from './upload-video-modal/upload-video-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GLOBAL } from '../services/global.constants';
@Component({
	selector: 'app-view-thread',
	templateUrl: './view-thread.component.html',
	styleUrls: ['./view-thread.component.css']
})
export class ViewThreadComponent implements OnInit {
	thread: Thread = new Thread();
	isLoading: boolean = true;

	createMessageForm: FormGroup;

	description = new FormControl('', [
		Validators.required
	]);

	editorConfig: any = GLOBAL.editorConfig;

	constructor(
		public auth: AuthService,
		public toast: ToastComponent,
		private router: Router,
		private route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private threadService: ThreadService,
		private messageService: MessageService,
		private modal: NgbModal,
		private sanitizer: DomSanitizer
	) { }

	ngOnInit() {
		this.route.params.subscribe((params) => {
			this.thread._id = params.id
			this.getThread();
		});

		this.createMessageForm = this.formBuilder.group({
			description: this.description
		});
	}

	getThread() {
		this.threadService.getThread(this.thread).subscribe((data) => {
			this.thread = data;
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err.message, 'danger');
		}, () => this.isLoading = false)
	}

	incThreadLike() {
		if (!this.auth.loggedIn) {
			return alert('Please login to like this thread!');
		}
		this.thread.likes += 1;
		this.threadService.editThread(this.thread).subscribe((data) => {
			this.toast.setMessage(data, 'success');
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err.message, 'danger');
		})
	}

	editThread(thread: Thread) {
		this.router.navigateByUrl(`/edit-thread/${thread._id}`);
	}

	deleteThread(thread: Thread) {
		if (confirm(`Are you sure you want to delete ${thread.title}?`)) {
			this.threadService.deleteThread(thread).subscribe((data) => {
				this.toast.setMessage(data, 'success');
				this.router.navigate(['']);
			}, (err) => {
				console.error(err);
				this.toast.setMessage(err.message, 'danger');
			})
		}
	}

	// Message Interface Methods
	addMessage(thread: Thread) {
		let message: Message = new Message();
		message.thread = thread._id;
		message.description = this.createMessageForm.get('description').value;
		this.messageService.addMessage(message).subscribe((data) => {
			thread.messages.push(data);
			this.toast.setMessage('Success', 'success');
			this.createMessageForm.get('description').setValue('');
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err.message, 'danger');
		})
	}

	incMessageLikes(message: Message) {
		if (!this.auth.loggedIn) {
			return alert('Please login to like this message!');
		}
		message.likes += 1;
		this.messageService.editMessage(message).subscribe((data) => {
			this.toast.setMessage(data, 'success');
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err.message, 'danger');
		})
	}

	deleteMessage(message: Message) {
		if (confirm(`Are you sure you want to delete?`)) {
			this.messageService.deleteMessage(message).subscribe((data) => {
				this.toast.setMessage(data, 'success');
				this.thread.messages.splice(this.thread.messages.indexOf(message), 1);
			}, (err) => {
				console.error(err);
				this.toast.setMessage(err.message, 'danger');
			})
		}
	}

	// Cloud Vision API
	uploadImage(thread: Thread) {
		const modalRef = this.modal.open(UploadImageModal);
		modalRef.componentInstance.threadId = this.thread._id;
		modalRef.componentInstance.updateThread.subscribe((message) => {
			if (!message) return;
			thread.messages.push(message);
		});
	}

	//  Video Intelligence API
	uploadVideo(thread: Thread) {
		const modalRef = this.modal.open(UploadVideoModal, {
			size: 'lg'
		});
		modalRef.componentInstance.threadId = this.thread._id;
		modalRef.componentInstance.updateThread.subscribe((message) => {
			if (!message) return;
			thread.messages.push(message);
		});
	}

	// Helpers
	sanitizeContent(content: string) {
		if(content.indexOf('<video') > 0) return content;
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

}
