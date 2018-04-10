import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class VideoAPIService {

	constructor(private http: HttpClient) { }

	postFile(threadId: string, videoBlob: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('video-reply', videoBlob, videoBlob.name);
		return this.http.post<any>(`/api/upload-video/${threadId}`, formData);
	}

}
