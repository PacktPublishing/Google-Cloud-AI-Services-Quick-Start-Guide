import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Message } from '../shared/models/message.model';

@Injectable()
export class MessageService {

  constructor(private http: HttpClient) { }

  addMessage(message: Message): Observable<Message> {
    return this.http.post<Message>('/api/message', message);
  }

  editMessage(message: Message): Observable<string> {
    return this.http.put(`/api/message/${message._id}`, message, { responseType: 'text' });
  }

  deleteMessage(message: Message): Observable<string> {
    return this.http.delete(`/api/message/${message._id}`, { responseType: 'text' });
  }

}