import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Campaign, CampaignCreate, CampaignList } from '@interfaces/campaign';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<CampaignList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CampaignList>(environment.apiUrl + 'campaign', {
      params,
    });
  }

  getOne(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(environment.apiUrl + 'campaign/' + id);
  }

  create(data: CampaignCreate): Observable<Campaign> {
    return this.http.post<Campaign>(environment.apiUrl + 'campaign/', data);
  }

  update(data: CampaignCreate, id: number): Observable<Campaign> {
    return this.http.put<Campaign>(environment.apiUrl + 'campaign/' + id, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'campaign/' + id);
  }
}
