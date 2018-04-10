import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Thread } from '../shared/models/thread.model';

@Injectable()
export class ThreadService {

  constructor(private http: HttpClient) { }

  getThreads(): Observable<Thread[]> {
    return this.http.get<Thread[]>('/api/threads');
  }

  countThreads(): Observable<number> {
    return this.http.get<number>('/api/threads/count');
  }

  addThread(thread: Thread): Observable<Thread> {
    return this.http.post<Thread>('/api/thread', thread);
  }

  getThread(thread: Thread): Observable<Thread> {
    return this.http.get<Thread>(`/api/thread/${thread._id}`);
  }

  editThread(thread: Thread): Observable<string> {
    return this.http.put(`/api/thread/${thread._id}`, thread, { responseType: 'text' });
  }

  deleteThread(thread: Thread): Observable<string> {
    return this.http.delete(`/api/thread/${thread._id}`, { responseType: 'text' });
  }

}