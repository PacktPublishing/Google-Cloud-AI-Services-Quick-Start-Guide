import { Pipe, PipeTransform } from '@angular/core';
import { Thread } from './shared/models/thread.model';

@Pipe({
  name: 'filterThread'
})
export class FilterThreadPipe implements PipeTransform {
  
  transform(threads: Thread[], cond: any): any {
  	// right now we suppor only isPinned for `cond`
  	 threads  = threads.filter((t: Thread) => {
  		return t.isPinned === cond.isPinned;
  	});

    return threads;
  }

}
