import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CampaignGoalsProgressByEvaluator } from '@interfaces/campaign-goals-progress';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignGoalsProgressService {
  private http = inject(HttpClient);

  getByEvaluator(): Observable<CampaignGoalsProgressByEvaluator[]> {
    return this.http.get<CampaignGoalsProgressByEvaluator[]>(
      environment.apiUrl + '/campaign-goals-progress/by-evaluator'
    );
  }
}
