import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { EvaluationAnalysis } from '@interfaces/evaluation-analysis';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationAnalysisService {
  private http = inject(HttpClient);

  getOne(id: number): Observable<EvaluationAnalysis> {
    return this.http.get<EvaluationAnalysis>(
      environment.apiUrl + '/evaluation-analysis/' + id
    );
  }
}
