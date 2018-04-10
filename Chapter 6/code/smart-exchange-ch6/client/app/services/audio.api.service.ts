import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AudioAPIService {

	constructor(private http: HttpClient) { }

	postFile(threadId: string, audioBlob: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('audio-reply', audioBlob, audioBlob.name);
		return this.http.post<any>(`/api/upload-audio/${threadId}`, formData);
	}
}
