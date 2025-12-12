/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudflareStreamService {
  private http = inject(HttpClient);

  getTusUploadUrl(file: File): Observable<any> {
    return this.http.post(environment.apiUrl + 'cloudflare/stream', null, {
      headers: {
        'Tus-Resumable': '1.0.0',
        'Upload-Length': file.size.toString(),
        'Upload-Metadata': `filename ${btoa(file.name)}`,
      },
      observe: 'response',
      responseType: 'text',
    });
  }
}
