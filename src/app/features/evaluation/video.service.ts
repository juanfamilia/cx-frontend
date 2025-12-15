import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Video } from '@interfaces/video';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private http = inject(HttpClient);

  updateStatus(id: number): Observable<Video> {
    return this.http.get<Video>(
      environment.apiUrl + 'evaluations/check-video/' + id
    );
  }
}
