import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  CompanyCompetencyConfig,
  CompanyCompetencyConfigUpdateBody,
  CompanyCompetencyConfigUpsert,
  IndustriesPublic,
  IndustryTemplatePublic,
  SuggestedSurveyAspectsResponse,
} from '@interfaces/quality-framework';
import { Observable } from 'rxjs';

const BASE = 'quality/';

@Injectable({
  providedIn: 'root',
})
export class QualityFrameworkService {
  private http = inject(HttpClient);

  listIndustries(
    offset = 0,
    limit = 100,
    search?: string,
    activeOnly = true
  ): Observable<IndustriesPublic> {
    let params = new HttpParams()
      .set('offset', String(offset))
      .set('limit', String(limit))
      .set('active_only', String(activeOnly));
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<IndustriesPublic>(environment.apiUrl + BASE + 'industries', {
      params,
    });
  }

  getSuggestedSurveyAspects(
    companyId: number
  ): Observable<SuggestedSurveyAspectsResponse> {
    return this.http.get<SuggestedSurveyAspectsResponse>(
      environment.apiUrl +
        BASE +
        `companies/${companyId}/suggested-survey-aspects`
    );
  }

  listCompanyCompetencyConfigs(
    companyId: number
  ): Observable<CompanyCompetencyConfig[]> {
    return this.http.get<CompanyCompetencyConfig[]>(
      environment.apiUrl + BASE + `companies/${companyId}/competency-configs`
    );
  }

  listIndustryTemplates(
    industryId: number
  ): Observable<IndustryTemplatePublic[]> {
    return this.http.get<IndustryTemplatePublic[]>(
      environment.apiUrl + BASE + `industries/${industryId}/template`
    );
  }

  upsertCompanyCompetencyConfig(
    companyId: number,
    body: CompanyCompetencyConfigUpsert
  ): Observable<CompanyCompetencyConfig> {
    return this.http.post<CompanyCompetencyConfig>(
      environment.apiUrl + BASE + `companies/${companyId}/competency-configs`,
      body
    );
  }

  updateCompanyCompetencyConfig(
    configId: number,
    body: CompanyCompetencyConfigUpdateBody
  ): Observable<CompanyCompetencyConfig> {
    return this.http.put<CompanyCompetencyConfig>(
      environment.apiUrl + BASE + `competency-configs/${configId}`,
      body
    );
  }
}
