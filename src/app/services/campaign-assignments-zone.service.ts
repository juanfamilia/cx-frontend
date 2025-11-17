import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  CampaignAssignmentZone,
  CampaignAssignmentZoneCreate,
  CampaignAssignmentZoneList,
} from '@interfaces/campaign-assignment-zone';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignAssignmentsZoneService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<CampaignAssignmentZoneList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CampaignAssignmentZoneList>(
      environment.apiUrl + '/campaign-assignment-zones/',
      {
        params,
      }
    );
  }

  getOne(id: number): Observable<CampaignAssignmentZone> {
    return this.http.get<CampaignAssignmentZone>(
      environment.apiUrl + '/campaign-assignment-zones/' + id
    );
  }

  create(data: CampaignAssignmentZoneCreate): Observable<string> {
    return this.http.post<string>(
      environment.apiUrl + '/campaign-assignment-zones/',
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + '/campaign-assignment-zones/' + id
    );
  }
}
