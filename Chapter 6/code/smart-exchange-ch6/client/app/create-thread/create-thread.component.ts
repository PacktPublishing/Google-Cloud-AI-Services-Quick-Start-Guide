import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';
import { ThreadService } from "../services/thread.service";

import { GLOBAL } from '../services/global.constants';

@Component({
	selector: 'app-create-thread',
	templateUrl: './create-thread.component.html',
	styleUrls: ['./create-thread.component.css']
})
export class CreateThreadComponent implements OnInit {

	createThreadForm: FormGroup;

	title = new FormControl('', [
		Validators.required
	]);
	description = new FormControl('', [
		Validators.required
	]);
	tags = new FormControl([], [
	]);

	editorConfig: any = GLOBAL.editorConfig;
	
	constructor(
		public toast: ToastComponent,
		private formBuilder: FormBuilder,
		private router: Router,
		private threadService: ThreadService
	) { }

	ngOnInit() {
		this.createThreadForm = this.formBuilder.group({
			title: this.title,
			description: this.description,
			tags: this.tags,
			isPinned: false
		});
	}

	create(){
		this.threadService.addThread(this.createThreadForm.value).subscribe(res => {
			this.toast.setMessage('New Thread Successfully Created!', 'success');
			this.router.navigate(['']);
		  },
		  error => this.toast.setMessage('Thread Creation Failed', 'danger'));
	}

}
