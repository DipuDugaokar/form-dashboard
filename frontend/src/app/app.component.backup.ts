import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';
import { FormField, FormSummary, SessionUser } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" routerLink="/admin/forms"><span class="brand-mark">F</span> FormFlow <small>ADMIN CONSOLE</small></a>
      <nav aria-label="Main navigation">
        <a routerLink="/admin/forms" routerLinkActive="active">Forms</a>
        <a routerLink="/admin/analytics" routerLinkActive="active">Analytics</a>
        <a routerLink="/admin/submissions" routerLinkActive="active">Submissions</a>
      </nav>
      <span class="session">{{ user?.displayName || 'No active session' }}</span>
    </header>

    <main class="container">
      <div class="notice"><strong>API-connected starter</strong> — backend endpoints are not yet verified. Actions will show an error until the Node API is available; no fake save or login is used.</div>
      <ng-container [ngSwitch]="page">
        <section *ngSwitchCase="'login'" class="narrow">
          <p class="eyebrow">SECURE ACCESS</p><h1>Welcome back</h1><p class="muted">Sign in using your organization's backend account.</p>
          <form [formGroup]="loginForm" (ngSubmit)="login()" class="panel">
            <label>Email<input type="email" formControlName="email" autocomplete="username"></label>
            <label>Password<input type="password" formControlName="password" autocomplete="current-password"></label>
            <button class="primary" [disabled]="loginForm.invalid || busy">Sign in</button>
          </form>
          <p class="error" *ngIf="error">{{error}}</p>
        </section>

        <section *ngSwitchCase="'forms'">
          <div class="page-head"><div><p class="eyebrow">WORKSPACE</p><h1>Forms</h1><p class="muted">Manage campaign forms and publishing lifecycle.</p></div><a class="primary link-button" routerLink="/admin/forms/new">＋ Create form</a></div>
          <div class="toolbar panel">
            <input aria-label="Search forms" placeholder="Search forms..." [(ngModel)]="search" (ngModelChange)="loadForms()">
            <select aria-label="Filter by status" [(ngModel)]="status" (ngModelChange)="loadForms()"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>
            <button class="secondary" (click)="loadForms()">Refresh</button>
          </div>
          <p class="error" *ngIf="error">{{error}}</p>
          <div class="panel table-wrap">
            <table><thead><tr><th>FORM</th><th>BRAND / MARKET</th><th>CAMPAIGN</th><th>STATUS</th><th>UPDATED</th><th></th></tr></thead>
            <tbody><tr *ngFor="let f of forms"><td><strong>{{f.name}}</strong><small>{{f.id}}</small></td><td>{{f.brand}} / {{f.market}}</td><td>{{f.campaignSlug}}</td><td><span class="status" [class]="f.status">{{f.status}}</span></td><td>{{f.updatedAt | date:'mediumDate'}}</td><td><a [routerLink]="['/admin/forms',f.id,'edit']">Edit</a> · <a [routerLink]="['/admin/forms',f.id,'preview']">Preview</a></td></tr></tbody></table>
            <div class="empty" *ngIf="!forms.length && !busy">No forms returned by the API.</div>
            <div class="empty" *ngIf="busy">Loading forms…</div>
          </div>
        </section>

        <section *ngSwitchCase="'builder'">
          <p class="eyebrow">FORM CONFIGURATION</p><h1>{{formId ? 'Edit form' : 'Create a form'}}</h1>
          <form [formGroup]="builderForm" (ngSubmit)="saveForm()" class="panel builder">
            <div class="two-col">
              <label>Form name<input formControlName="name"></label>
              <label>Brand<input formControlName="brand" placeholder="BMW"></label>
              <label>Market<input formControlName="market" placeholder="Singapore"></label>
              <label>Campaign slug<input formControlName="campaignSlug" placeholder="ix3-test-drive"></label>
            </div>
            <label>Heading<input formControlName="heading"></label>
            <label>Body copy<textarea formControlName="body" rows="3"></textarea></label>
            <label>CTA text<input formControlName="ctaText"></label>
            <label>Thank-you message<input formControlName="thankYouMessage"></label>
            <div class="section-title"><h2>Form fields</h2><button type="button" class="secondary" (click)="addField()">＋ Add field</button></div>
            <div class="field-row" *ngFor="let field of fields; let i=index">
              <div><strong>{{field.label}}</strong><small>{{field.type}} · {{field.required ? 'Required' : 'Optional'}}</small></div>
              <div class="actions"><button type="button" class="secondary" (click)="moveField(i,-1)" [disabled]="i===0">↑</button><button type="button" class="secondary" (click)="moveField(i,1)" [disabled]="i===fields.length-1">↓</button><button type="button" class="danger" (click)="removeField(i)">Remove</button></div>
            </div>
            <p class="muted">Starter fields are editable in code; connect a typed field editor before production use.</p>
            <div class="actions"><button type="submit" class="primary" [disabled]="builderForm.invalid || busy">Save draft</button><button type="button" class="secondary" (click)="preview()">Preview</button><button type="button" class="secondary" (click)="publish()" [disabled]="!formId || busy">Publish / republish</button></div>
          </form>
          <p class="error" *ngIf="error">{{error}}</p><p class="success" *ngIf="message">{{message}}</p>
        </section>

        <section *ngSwitchCase="'preview'">
          <p class="eyebrow">PREVIEW</p><h1>Form preview</h1><p class="muted">Preview only — this page does not publish or submit data.</p>
          <div class="public-card"><h2>{{builderForm.value.heading || 'Book your test drive'}}</h2><p>{{builderForm.value.body}}</p><div *ngFor="let f of fields" class="preview-field"><label>{{f.label}} <b *ngIf="f.required">*</b></label><input [placeholder]="f.placeholder || ''" disabled></div><button class="primary" disabled>{{builderForm.value.ctaText || 'Submit'}}</button></div>
        </section>

        <section *ngSwitchCase="'public'">
          <div class="public-card"><p class="eyebrow">CAMPAIGN FORM</p><h1>{{publicForm?.definition?.heading || 'Book your test drive'}}</h1><p>{{publicForm?.definition?.body || 'Complete the form and our team will contact you.'}}</p>
            <form [formGroup]="publicFormGroup" (ngSubmit)="submitPublic()">
              <label *ngFor="let f of (publicForm?.definition?.fields || publicFields)">{{f.label}} <b *ngIf="f.required">*</b>
                <input *ngIf="['text','email','mobile','date'].includes(f.type)" [type]="f.type==='mobile'?'tel':f.type" [placeholder]="f.placeholder || ''" [formControlName]="f.id">
                <textarea *ngIf="f.type==='textarea'" [formControlName]="f.id"></textarea>
                <label class="consent" *ngIf="f.type==='consent checkbox'"><input type="checkbox" [formControlName]="f.id"> {{f.consentText || 'I agree to be contacted.'}}</label>
              </label>
              <button class="primary" [disabled]="publicFormGroup.invalid || busy">Submit</button>
            </form>
            <p class="error" *ngIf="error">{{error}}</p><p class="success" *ngIf="message">{{message}}</p>
          </div>
        </section>

        <section *ngSwitchCase="'analytics'"><p class="eyebrow">PERFORMANCE</p><h1>Analytics</h1><div class="panel"><p>Admin-only analytics require a backend session and authorized analytics API.</p><p class="muted">No demo metrics are fabricated in this starter.</p></div><p class="error" *ngIf="error">{{error}}</p></section>
        <section *ngSwitchCase="'submissions'"><p class="eyebrow">LEAD MANAGEMENT</p><h1>Submissions</h1><div class="panel"><p>Admin-only submissions require a backend session and authorized submissions API.</p><p class="muted">No sample leads or persisted submissions are fabricated.</p></div><p class="error" *ngIf="error">{{error}}</p></section>
      </ng-container>
    </main>
  </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  page = 'forms';
  formId = '';
  user?: SessionUser;
  forms: FormSummary[] = [];
  publicForm?: FormSummary;
  search = '';
  status = '';
  busy = false;
  error = '';
  message = '';
  fields: FormField[] = [
    { id: 'fullName', type: 'text', label: 'Full name', required: true, placeholder: 'Enter your full name' },
    { id: 'email', type: 'email', label: 'Email address', required: true, placeholder: 'name@example.com' },
    { id: 'mobile', type: 'mobile', label: 'Mobile number', required: true },
    { id: 'consent', type: 'consent checkbox', label: 'Consent', required: true, consentText: 'I agree to be contacted about this campaign.' }
  ];
  publicFields = this.fields;
  loginForm = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  builderForm = this.fb.group({
    name: ['BMW Test Drive', Validators.required], brand: ['BMW', Validators.required],
    market: ['Singapore', Validators.required], campaignSlug: ['ix3-test-drive', Validators.required],
    heading: ['Book your BMW test drive', Validators.required],
    body: ['Experience the BMW iX3. Complete the form and our team will contact you.'],
    ctaText: ['Submit request', Validators.required],
    thankYouMessage: ['Thank you. Your request has been received.']
  });
  publicFormGroup = this.fb.group({
    fullName: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required], consent: [false, Validators.requiredTrue]
  });

  ngOnInit() {
    this.page = this.route.snapshot.data['page'] || 'forms';
    this.formId = this.route.snapshot.paramMap.get('formId') || '';
    if (this.page === 'forms') this.loadForms();
    if (this.page === 'builder' && this.formId) this.loadForm();
    if (this.page === 'public') this.loadPublicForm();
  }
  loadForms() {
    this.busy = true; this.error = '';
    this.api.forms(this.search, this.status).subscribe({
      next: data => { this.forms = data; this.busy = false; },
      error: err => { this.forms = []; this.error = this.apiMessage(err); this.busy = false; }
    });
  }
  loadForm() {
    this.api.form(this.formId).subscribe({
      next: f => {
        this.builderForm.patchValue({
          name: f.name, brand: f.brand, market: f.market, campaignSlug: f.campaignSlug,
          heading: f.definition?.heading || '', body: f.definition?.body || '',
          ctaText: f.definition?.ctaText || '', thankYouMessage: f.definition?.thankYouMessage || ''
        });
        this.fields = f.definition?.fields || this.fields;
      },
      error: err => this.error = this.apiMessage(err)
    });
  }
  login() {
    if (this.loginForm.invalid) return;
    this.busy = true; this.error = '';
    const { email, password } = this.loginForm.getRawValue();
    this.api.login(email!, password!).subscribe({
      next: result => { this.user = result.user; this.busy = false; this.router.navigateByUrl('/admin/forms'); },
      error: err => { this.error = this.apiMessage(err); this.busy = false; }
    });
  }
  addField() {
    const id = `field_${Date.now()}`;
    this.fields = [...this.fields, { id, type: 'text', label: 'New field', required: false }];
  }
  removeField(index: number) { this.fields = this.fields.filter((_, i) => i !== index); }
  moveField(index: number, direction: number) {
    const next = index + direction; if (next < 0 || next >= this.fields.length) return;
    const copy = [...this.fields]; [copy[index], copy[next]] = [copy[next], copy[index]]; this.fields = copy;
  }
  saveForm() {
    if (this.builderForm.invalid) return;
    const v = this.builderForm.getRawValue();
    const payload: Partial<FormSummary> = {
      name: v.name!, brand: v.brand!, market: v.market!, campaignSlug: v.campaignSlug!,
      status: 'draft',
      definition: { heading: v.heading!, body: v.body || '', ctaText: v.ctaText!, thankYouMessage: v.thankYouMessage || '', fields: this.fields }
    };
    this.busy = true; this.error = ''; this.message = '';
    const request = this.formId ? this.api.updateForm(this.formId, payload) : this.api.createForm(payload);
    request.subscribe({
      next: saved => { this.formId = saved.id; this.busy = false; this.message = 'Draft saved by the backend.'; },
      error: err => { this.busy = false; this.error = this.apiMessage(err); }
    });
  }
  publish() {
    if (!this.formId) { this.error = 'Save the draft through the backend before publishing.'; return; }
    this.busy = true; this.error = '';
    this.api.publishForm(this.formId).subscribe({
      next: () => { this.busy = false; this.message = 'Publish confirmed by the backend.'; },
      error: err => { this.busy = false; this.error = this.apiMessage(err); }
    });
  }
  preview() { this.router.navigateByUrl('/admin/forms/new/preview'); }
  loadPublicForm() {
    const p = this.route.snapshot.paramMap;
    this.api.publicForm(p.get('brandMarketSlug') || '', p.get('campaignSlug') || '').subscribe({
      next: f => { this.publicForm = f; },
      error: err => this.error = this.apiMessage(err)
    });
  }
  submitPublic() {
    if (this.publicFormGroup.invalid) return;
    const p = this.route.snapshot.paramMap;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source','utm_medium','utm_campaign'].forEach(k => { const value = params.get(k); if (value) utm[k] = value; });
    this.busy = true; this.error = ''; this.message = '';
    this.api.submitPublicForm(p.get('brandMarketSlug') || '', p.get('campaignSlug') || '', this.publicFormGroup.getRawValue() as Record<string, unknown>, utm).subscribe({
      next: () => { this.busy = false; this.message = this.publicForm?.definition?.thankYouMessage || 'Thank you. Your request has been received.'; },
      error: err => { this.busy = false; this.error = this.apiMessage(err); }
    });
  }
  private apiMessage(err: any): string {
    return err?.error?.message || 'Could not connect to the backend API. Check the API URL, server status, and endpoint contract.';
  }
}
