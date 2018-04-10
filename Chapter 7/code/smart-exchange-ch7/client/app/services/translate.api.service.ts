import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Message } from '../shared/models/message.model';

@Injectable()
export class TranslateAPIService {

	constructor(private http: HttpClient) { }

	getSupportedLanguages(): Observable<any> {
		return this.http.get<any>('/api/supported-languages');
	}

	translateText(message: Message, targetLang: String): Observable<Message> {
		return this.http.post<Message>(`/api/translate-message/${targetLang}`, message);
	}
}
