import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class VisionAPIService {

	constructor(private http: HttpClient) { }

	postFile(threadId: string, fileToUpload: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('image-reply', fileToUpload, fileToUpload.name);
		return this.http.post<any>(`/api/upload-image/${threadId}`, formData);
	}

}
