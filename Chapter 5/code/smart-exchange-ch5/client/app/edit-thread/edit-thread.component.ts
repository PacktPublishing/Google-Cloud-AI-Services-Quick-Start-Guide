import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';
import { ThreadService } from "../services/thread.service";
import { AuthService } from '../services/auth.service';

import { Thread } from '../shared/models/thread.model';
import { GLOBAL } from '../services/global.constants';

@Component({
	selector: 'app-edit-thread',
	templateUrl: './edit-thread.component.html',
	styleUrls: ['./edit-thread.component.css']
})
export class EditThreadComponent implements OnInit {

	thread: Thread = new Thread();
	isLoading: boolean = true;


	editThreadForm: FormGroup;

	title = new FormControl('', [
		Validators.required
	]);
	description = new FormControl('', [
		Validators.required
	]);
	tags = new FormControl([], [
	]);

	isPinned = new FormControl(false, [
	]);

	editorConfig: any = GLOBAL.editorConfig;

	constructor(
		public auth: AuthService,
		public toast: ToastComponent,
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private threadService: ThreadService
	) { }

	ngOnInit() {

		this.route.params.subscribe((params) => {
			this.thread._id = params.id
			this.getThread();
		});

		this.editThreadForm = this.formBuilder.group({
			title: this.title,
			description: this.description,
			tags: this.tags,
			isPinned: this.isPinned
		});
	}

	getThread() {
		this.threadService.getThread(this.thread).subscribe((dbData) => {
			this.thread = dbData;
			// As a security measure, check if the
			// user who created is really the one accessing it
			// or if the user is an admin
			// as URL can manipulated
			if (
				dbData.createdBy._id === this.auth.getCurrentUser()._id
				||
				this.auth.getCurrentUser().role === 'admin'
			) {
				// Update the edit form with the values from server!
				this.editThreadForm.patchValue(this.thread);
				// Workaround for bug: https://github.com/angular/angular/issues/13792
				this.editThreadForm
					.valueChanges.subscribe((fromForm) => {
						this.thread.title = fromForm.title;
						this.thread.description = fromForm.description;
						this.thread.isPinned = fromForm.isPinned;
						this.thread.tags = fromForm.tags;
					});
			} else {
				alert('You are not authorized to perfom this activity');
				// Kick the user out!!
				this.auth.logout();
			}
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err, 'danger');
		}, () => this.isLoading = false)
	}

	update(thread: Thread) {
		this.threadService.editThread(this.thread).subscribe((data) => {
			this.toast.setMessage(data, 'success');
			this.router.navigateByUrl(`/view-thread/${this.thread._id}`);
		}, (err) => {
			console.error(err);
			this.toast.setMessage(err, 'danger');
		})
	}

}
