import { Component, OnInit } from '@angular/core';
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';
import { ThreadService } from '../services/thread.service';
import { Thread } from '../shared/models/thread.model';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	threads: [Thread];
	isLoading = true;
		
	constructor(
		public auth: AuthService,
		public toast: ToastComponent,
		private threadService: ThreadService
	) { }

	ngOnInit() {
		this.getThreads();
	}

	getThreads() {
		this.threadService.getThreads().subscribe(
			(data: [Thread]) => this.threads = data,
			error => console.log(error),
			() => this.isLoading = false
		);
	}
}
