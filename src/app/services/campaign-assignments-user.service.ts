import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  CampaignAssignmentUser,
  CampaignAssignmentUserCreate,
  CampaignAssignmentUserList,
} from '@interfaces/campaign-assigment-user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignAssignmentsUserService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<CampaignAssignmentUserList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CampaignAssignmentUserList>(
      environment.apiUrl + 'campaign-assignment/users/',
      {
        params,
      }
    );
  }

  getOne(id: number): Observable<CampaignAssignmentUser> {
    return this.http.get<CampaignAssignmentUser>(
      environment.apiUrl + 'campaign-assignment/users/' + id
    );
  }

  create(data: CampaignAssignmentUserCreate): Observable<string> {
    return this.http.post<string>(
      environment.apiUrl + 'campaign-assignment/users',
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + 'campaign-assignment/users/' + id
    );
  }
}
