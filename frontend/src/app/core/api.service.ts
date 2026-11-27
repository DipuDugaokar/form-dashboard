import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormSummary, SessionUser, FormDefinition } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  session() {
    return this.http.get<{ user: SessionUser }>(`${this.base}/auth/session`);
  }
  login(email: string, password: string) {
    return this.http.post<{ user: SessionUser }>(`${this.base}/auth/login`, { email, password });
  }
  logout() {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }
  forms(search = '', status = '') {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<FormSummary[]>(`${this.base}/forms`, { params });
  }
  form(id: string) {
    return this.http.get<FormSummary>(`${this.base}/forms/${encodeURIComponent(id)}`);
  }
  createForm(payload: Partial<FormSummary>) {
    return this.http.post<FormSummary>(`${this.base}/forms`, payload);
  }
  updateForm(id: string, payload: Partial<FormSummary>) {
    return this.http.put<FormSummary>(`${this.base}/forms/${encodeURIComponent(id)}`, payload);
  }
  publishForm(id: string) {
    return this.http.post<FormSummary>(`${this.base}/forms/${encodeURIComponent(id)}/publish`, {});
  }
  publicForm(brandMarketSlug: string, campaignSlug: string) {
    return this.http.get<FormSummary>(`${this.base}/public/forms/${encodeURIComponent(brandMarketSlug)}/${encodeURIComponent(campaignSlug)}`);
  }
  submitPublicForm(brandMarketSlug: string, campaignSlug: string, answers: Record<string, unknown>, utm: Record<string, string>) {
    return this.http.post<{ submissionId: string; receivedAt: string }>(
      `${this.base}/public/forms/${encodeURIComponent(brandMarketSlug)}/${encodeURIComponent(campaignSlug)}/submissions`,
      { answers, utm }
    );
  }
  analytics(from: string, to: string) {
    return this.http.get<unknown>(`${this.base}/analytics`, { params: { from, to } });
  }
  submissions(from: string, to: string) {
    return this.http.get<unknown[]>(`${this.base}/submissions`, { params: { from, to } });
  }
  suggestForm(brief: string) {
    return this.http.post<{ heading: string; body: string; ctaText: string; fields: FormDefinition['fields'] }>(
      `${this.base}/ai/form-assistant`, { brief }
    );
  }
}
