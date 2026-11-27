
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { ApiService } from '../core/api.service';
import { FieldType, FormField, FormSummary } from '../core/models';
import { AuthService, AuthUser } from '../core/auth.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  template: `

  <ng-container *ngIf="page === 'login'; else dashboardShell">

    <section class="narrow login-page">
      <p class="eyebrow">FORMFLOW ADMIN</p>
      <h1>Welcome back</h1>
      <p class="muted">
        Sign in to manage your campaigns and forms.
      </p>

      <form
        [formGroup]="loginForm"
        (ngSubmit)="login()"
        class="panel">

        <label>
          Email
          <input
            type="email"
            formControlName="email"
            placeholder="Enter your email"
            autocomplete="username">
        </label>

        <label>
          Password
          <input
            type="password"
            formControlName="password"
            placeholder="Enter your password"
            autocomplete="current-password">
        </label>

        <button
          class="primary"
          type="submit"
          [disabled]="loginForm.invalid || busy">
          Sign in
        </button>

      </form>

      <p class="error" *ngIf="error">{{ error }}</p>
    </section>

  </ng-container>

  <ng-template #dashboardShell>

    <div class="app-shell dashboard-layout">

      <!-- SIDEBAR -->
      <aside class="sidebar">

        <a class="brand" routerLink="/admin/forms">
          <span class="brand-mark">F</span>
          <span>FormFlow</span>
        </a>

        <p class="sidebar-label">WORKSPACE</p>

        <nav class="sidebar-nav" aria-label="Main navigation">

          <a
            routerLink="/admin/forms"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }">
            <span>▦</span>
            Dashboard
          </a>

          <a
            routerLink="/admin/forms"
            routerLinkActive="active">
            <span>▤</span>
            Campaigns
          </a>

          <a
            routerLink="/admin/forms/new"
            routerLinkActive="active">
            <span>＋</span>
            Create Form
          </a>

          <p class="sidebar-label">MANAGEMENT</p>

          <a
            routerLink="/admin/submissions"
            routerLinkActive="active">
            <span>▣</span>
            Submissions
          </a>

          <a
            routerLink="/admin/analytics"
            routerLinkActive="active">
            <span>▥</span>
            Analytics
          </a>

        </nav>

        <div class="sidebar-bottom">

          <div class="user-avatar">
            {{ user?.email?.charAt(0)?.toUpperCase() || 'U' }}
          </div>

          <div class="user-details">
            <strong>{{ user?.email || 'User' }}</strong>
            <small>{{ user?.role || 'Not logged in' }}</small>
          </div>

          <button
            type="button"
            class="logout-button"
            (click)="logout()">
            Logout
          </button>

        </div>

      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-area">

        <header class="topbar">

          <div>
            <span class="topbar-label">FORMFLOW / WORKSPACE</span>
            <strong>Campaign Management</strong>
          </div>

          <div class="topbar-right">
            <span class="session">
              {{ user?.email || 'No active session' }}
              <span *ngIf="user"> · {{ user.role }}</span>
            </span>
          </div>

        </header>

        <main class="container">

          <div class="notice">
            <strong>Local draft storage enabled</strong>
            — Campaign drafts are saved in this browser and remain available after refreshing the page.
          </div>

          <ng-container [ngSwitch]="page">

            <!-- DASHBOARD -->
            <section *ngSwitchCase="'forms'">

              <div class="page-head">

                <div>
                  <p class="eyebrow">OVERVIEW</p>
                  <h1>Dashboard</h1>
                  <p class="muted">
                    Monitor your campaigns and manage form activity.
                  </p>
                </div>

                <a
                  class="primary link-button"
                  routerLink="/admin/forms/new">
                  ＋ Create Campaign
                </a>

              </div>

              <!-- SUMMARY CARDS -->
              <div class="summary-grid">

                <div class="summary-card">
                  <div class="summary-icon blue">▤</div>
                  <p>Total Campaigns</p>
                  <h2>{{ forms.length }}</h2>
                  <small>Campaigns saved locally</small>
                </div>

                <div class="summary-card">
                  <div class="summary-icon green">✓</div>
                  <p>Published</p>
                  <h2>{{ countByStatus('published') }}</h2>
                  <small>Published campaigns</small>
                </div>

                <div class="summary-card">
                  <div class="summary-icon orange">✎</div>
                  <p>Drafts</p>
                  <h2>{{ countByStatus('draft') }}</h2>
                  <small>Campaigns in progress</small>
                </div>

                <div class="summary-card">
                  <div class="summary-icon purple">▣</div>
                  <p>Archived</p>
                  <h2>{{ countByStatus('archived') }}</h2>
                  <small>Archived campaigns</small>
                </div>

              </div>

              <!-- CAMPAIGN MANAGEMENT -->
              <div class="section-heading">

                <div>
                  <h2>Campaign Management</h2>
                  <p>
                    View, search and manage your campaign forms.
                  </p>
                </div>

              </div>

              <!-- SEARCH AND FILTER -->
              <div class="toolbar panel">

                <input
                  aria-label="Search campaigns"
                  placeholder="Search campaigns..."
                  [(ngModel)]="search"
                  (ngModelChange)="loadForms()">

                <select
                  aria-label="Filter by status"
                  [(ngModel)]="status"
                  (ngModelChange)="loadForms()">

                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>

                </select>

                <button
                  class="secondary"
                  type="button"
                  (click)="loadForms()">
                  ↻ Refresh
                </button>

              </div>

              <p class="error" *ngIf="error">{{ error }}</p>

              <!-- CAMPAIGN TABLE -->
              <div class="panel table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>CAMPAIGN</th>
                      <th>BRAND / MARKET</th>
                      <th>CAMPAIGN SLUG</th>
                      <th>STATUS</th>
                      <th>LAST UPDATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr *ngFor="let f of forms">

                      <td>
                        <strong>{{ f.name }}</strong>
                        <small>{{ f.id }}</small>
                      </td>

                      <td>
                        {{ f.brand }} / {{ f.market }}
                      </td>

                      <td>{{ f.campaignSlug }}</td>

                      <td>
                        <span
                          class="status"
                          [ngClass]="f.status">
                          {{ f.status }}
                        </span>
                      </td>

                      <td>
                        {{ f.updatedAt | date:'mediumDate' }}
                      </td>

                      <td>
                        <div class="actions">
                          <a [routerLink]="['/admin/forms', f.id, 'edit']">
                            Edit
                          </a>

                          <a [routerLink]="['/admin/forms', f.id, 'preview']">
                            Preview
                          </a>
                        </div>
                      </td>

                    </tr>

                  </tbody>

                </table>

                <div class="empty" *ngIf="!forms.length">
                  No campaigns found. Create your first campaign.
                </div>

              </div>

            </section>

            <!-- FORM BUILDER -->
            <section *ngSwitchCase="'builder'">

              <p class="eyebrow">FORM CONFIGURATION</p>

              <h1>{{ formId ? 'Edit form' : 'Create a form' }}</h1>

              <form
                [formGroup]="builderForm"
                (ngSubmit)="saveForm()"
                class="panel builder">

                <!-- CAMPAIGN DETAILS -->
                <h2>Campaign details</h2>

                <div class="two-col">

                  <label>
                    Form name
                    <input formControlName="name" placeholder="Form Name">
                  </label>

                  <label>
                    Brand
                    <input formControlName="brand" placeholder="Brand Name">
                  </label>

                  <label>
                    Market
                    <input formControlName="market" placeholder="Market Name">
                  </label>

                  <label>
                    Campaign slug
                    <input
                      formControlName="campaignSlug"
                      placeholder="For eg: ix3-test-drive">
                  </label>

                </div>

                <!-- FORM CONTENT -->
                <h2>Form content</h2>

                <label>
                  Heading
                  <input formControlName="heading">
                </label>

                <label>
                  Body copy
                  <textarea formControlName="body" rows="3"></textarea>
                </label>

                <label>
                  CTA text
                  <input formControlName="ctaText">
                </label>

                <label>
                  Thank-you message
                  <input formControlName="thankYouMessage">
                </label>

                <!-- FORM FIELD BUILDER -->
                <div class="section-title">
                  <h2>Form fields</h2>
                  <p class="muted">
                    Select a field type and add it to your campaign form.
                  </p>
                </div>

                <div class="field-add-toolbar">

                  <select
                    [(ngModel)]="newFieldType"
                    [ngModelOptions]="{ standalone: true }">

                    <option
                      *ngFor="let type of fieldTypeOptions"
                      [ngValue]="type.value">
                      {{ type.label }}
                    </option>

                  </select>

                  <button
                    type="button"
                    class="primary"
                    (click)="addField()">
                    ＋ Add Field
                  </button>

                </div>

                <!-- INDIVIDUAL FIELD SETTINGS -->
                <div
                  class="field-row field-editor"
                  *ngFor="let field of fields; let i = index">

                  <div class="field-editor-content">

                    <h3>Field {{ i + 1 }}</h3>

                    <div class="two-col">

                      <label>
                        Field label
                        <input
                          type="text"
                          [(ngModel)]="field.label"
                          [ngModelOptions]="{ standalone: true }"
                          placeholder="Enter field name">
                      </label>

                      <label>
                        Field type
                        <select
                          [ngModel]="field.type"
                          [ngModelOptions]="{ standalone: true }"
                          (ngModelChange)="changeFieldType(field, $event)">

                          <option
                            *ngFor="let type of fieldTypeOptions"
                            [ngValue]="type.value">
                            {{ type.label }}
                          </option>

                        </select>
                      </label>

                    </div>

                    <label
                      *ngIf="['text','email','mobile','date','textarea'].includes(field.type)">

                      Placeholder text

                      <input
                        type="text"
                        [(ngModel)]="field.placeholder"
                        [ngModelOptions]="{ standalone: true }"
                        placeholder="Enter placeholder text">

                    </label>

                    <label
                      *ngIf="['dropdown','radio','checkbox'].includes(field.type)">

                      Options (separate options with commas)

                      <textarea
                        rows="2"
                        [ngModel]="formatFieldOptions(field)"
                        [ngModelOptions]="{ standalone: true }"
                        (ngModelChange)="updateFieldOptions(field, $event)"
                        placeholder="Option 1, Option 2, Option 3">
                      </textarea>

                    </label>

                    <label *ngIf="field.type === 'consent checkbox'">

                      Consent statement

                      <textarea
                        rows="2"
                        [(ngModel)]="field.consentText"
                        [ngModelOptions]="{ standalone: true }">
                      </textarea>

                    </label>

                    <label class="required-setting">
                      <input
                        type="checkbox"
                        [(ngModel)]="field.required"
                        [ngModelOptions]="{ standalone: true }">

                      Required field
                    </label>

                  </div>

                  <div class="actions field-actions">

                    <button
                      type="button"
                      class="secondary"
                      (click)="moveField(i, -1)"
                      [disabled]="i === 0">
                      ↑
                    </button>

                    <button
                      type="button"
                      class="secondary"
                      (click)="moveField(i, 1)"
                      [disabled]="i === fields.length - 1">
                      ↓
                    </button>

                    <button
                      type="button"
                      class="danger"
                      (click)="removeField(i)">
                      Remove
                    </button>

                  </div>

                </div>

                <p class="muted" *ngIf="!fields.length">
                  No fields added yet. Select a field type above to get started.
                </p>

                <!-- ACTIONS -->
                <div class="actions">

                  <button
                    type="submit"
                    class="primary"
                    [disabled]="builderForm.invalid || busy">
                    Save draft
                  </button>

                  <button
                    type="button"
                    class="secondary"
                    (click)="preview()">
                    Preview
                  </button>

                  <button
                    *ngIf="isAdmin"
                    type="button"
                    class="secondary"
                    (click)="publish()"
                    [disabled]="!formId || busy">
                    Publish / republish
                  </button>

                </div>

              </form>

              <p class="error" *ngIf="error">{{ error }}</p>
              <p class="success" *ngIf="message">{{ message }}</p>

            </section>

            <!-- PREVIEW PAGE -->
            <section *ngSwitchCase="'preview'">

              <p class="eyebrow">PREVIEW</p>

              <h1>Form preview</h1>

              <p class="muted">
                Preview only — this page does not publish or submit data.
              </p>

              <div class="public-card">

                <h2>
                  {{ builderForm.value.heading || 'Book your test drive' }}
                </h2>

                <p>{{ builderForm.value.body }}</p>

                <div
                  *ngFor="let f of fields"
                  class="preview-field">

                  <label>
                    {{ f.label }}
                    <b *ngIf="f.required">*</b>
                  </label>

                  <input
                    *ngIf="['text','email','mobile','date'].includes(f.type)"
                    [type]="f.type === 'mobile' ? 'tel' : f.type"
                    [placeholder]="f.placeholder || ''"
                    disabled>

                  <select *ngIf="f.type === 'dropdown'" disabled>
                    <option value="">Select an option</option>
                    <option *ngFor="let option of f.options">
                      {{ option.label }}
                    </option>
                  </select>

                  <div *ngIf="f.type === 'radio'">
                    <label *ngFor="let option of f.options">
                      <input type="radio" [name]="f.id" disabled>
                      {{ option.label }}
                    </label>
                  </div>

                  <div *ngIf="f.type === 'checkbox'">
                    <label *ngFor="let option of f.options">
                      <input type="checkbox" disabled>
                      {{ option.label }}
                    </label>
                  </div>

                  <textarea
                    *ngIf="f.type === 'textarea'"
                    [placeholder]="f.placeholder || ''"
                    disabled>
                  </textarea>

                  <label
                    class="consent"
                    *ngIf="f.type === 'consent checkbox'">

                    <input type="checkbox" disabled>
                    {{ f.consentText || 'I agree to be contacted.' }}

                  </label>

                </div>

                <button class="primary" disabled>
                  {{ builderForm.value.ctaText || 'Submit' }}
                </button>

              </div>

              <button
                type="button"
                class="secondary"
                (click)="routerBackToBuilder()">
                Back to form builder
              </button>

            </section>

            <!-- PUBLIC CAMPAIGN FORM -->
            <section *ngSwitchCase="'public'">

              <div class="public-card">

                <p class="eyebrow">CAMPAIGN FORM</p>

                <h1>
                  {{ publicForm?.definition?.heading || 'Book your test drive' }}
                </h1>

                <p>
                  {{ publicForm?.definition?.body ||
                     'Complete the form and our team will contact you.' }}
                </p>

                <form
                  [formGroup]="publicFormGroup"
                  (ngSubmit)="submitPublic()">

                  <div
                    *ngFor="let f of getPublicFields()"
                    class="preview-field">

                    <label>
                      {{ f.label }}
                      <b *ngIf="f.required">*</b>
                    </label>

                    <!-- TEXT, EMAIL, MOBILE, DATE -->
                    <input
                      *ngIf="['text','email','mobile','date'].includes(f.type)"
                      [type]="f.type === 'mobile' ? 'tel' : f.type"
                      [placeholder]="f.placeholder || ''"
                      [formControlName]="f.id">

                    <!-- DROPDOWN -->
                    <select
                      *ngIf="f.type === 'dropdown'"
                      [formControlName]="f.id">

                      <option value="">Select an option</option>

                      <option
                        *ngFor="let option of f.options"
                        [value]="option.value">
                        {{ option.label }}
                      </option>

                    </select>

                    <!-- RADIO BUTTONS -->
                    <div *ngIf="f.type === 'radio'">

                      <label
                        *ngFor="let option of f.options"
                        class="choice-option">

                        <input
                          type="radio"
                          [name]="f.id"
                          [formControlName]="f.id"
                          [value]="option.value">

                        {{ option.label }}

                      </label>

                    </div>

                    <!-- MULTIPLE CHECKBOXES -->
                    <div
                      *ngIf="f.type === 'checkbox'"
                      [formGroupName]="f.id">

                      <label
                        *ngFor="let option of f.options"
                        class="choice-option">

                        <input
                          type="checkbox"
                          [formControlName]="option.value">

                        {{ option.label }}

                      </label>

                    </div>

                    <!-- TEXTAREA -->
                    <textarea
                      *ngIf="f.type === 'textarea'"
                      [placeholder]="f.placeholder || ''"
                      [formControlName]="f.id"
                      rows="3">
                    </textarea>

                    <!-- CONSENT -->
                    <label
                      class="consent"
                      *ngIf="f.type === 'consent checkbox'">

                      <input
                        type="checkbox"
                        [formControlName]="f.id">

                      {{ f.consentText || 'I agree to be contacted.' }}

                    </label>

                  </div>

                  <button
                    class="primary"
                    type="submit"
                    [disabled]="publicFormGroup.invalid || busy">
                    {{ publicForm?.definition?.ctaText || 'Submit' }}
                  </button>

                </form>

                <p class="error" *ngIf="error">{{ error }}</p>
                <p class="success" *ngIf="message">{{ message }}</p>

              </div>

            </section>

            <!-- ANALYTICS PAGE -->
            <section *ngSwitchCase="'analytics'">

              <p class="eyebrow">PERFORMANCE</p>
              <h1>Analytics</h1>

              <div class="panel">
                <p>
                  Admin-only analytics require a backend session
                  and authorized analytics API.
                </p>

                <p class="muted">
                  No demo metrics are fabricated in this application.
                </p>
              </div>

              <p class="error" *ngIf="error">{{ error }}</p>

            </section>

            <!-- SUBMISSIONS PAGE -->
            <section *ngSwitchCase="'submissions'">

              <p class="eyebrow">LEAD MANAGEMENT</p>
              <h1>Submissions</h1>

              <div class="panel">
                <p>
                  Admin-only submissions require a backend session
                  and authorized submissions API.
                </p>

                <p class="muted">
                  No sample leads or persisted submissions are fabricated.
                </p>
              </div>

              <p class="error" *ngIf="error">{{ error }}</p>

            </section>

          </ng-container>

        </main>

      </div>

    </div>

  </ng-template>
  `
})

export class AdminPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  private readonly storageKey = 'formflow_campaigns';

  page = 'forms';
  formId = '';

  user: AuthUser | null = null;

  get isAdmin(): boolean {
    return this.auth.hasRole('Admin');
  }

  forms: FormSummary[] = [];
  publicForm?: FormSummary;

  search = '';
  status = '';

  busy = false;
  error = '';
  message = '';

  newFieldType: FieldType = 'text';

  fieldTypeOptions: { label: string; value: FieldType }[] = [
    { label: 'Text', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Dropdown', value: 'dropdown' },
    { label: 'Radio', value: 'radio' },
    { label: 'Checkbox', value: 'checkbox' },
    { label: 'Date', value: 'date' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Consent Checkbox', value: 'consent checkbox' }
  ];

  fields: FormField[] = [
    {
      id: 'fullName',
      type: 'text',
      label: 'Full name',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email address',
      required: true,
      placeholder: 'name@example.com'
    },
    {
      id: 'mobile',
      type: 'mobile',
      label: 'Mobile number',
      required: true,
      placeholder: 'Enter mobile number'
    },
    {
      id: 'consent',
      type: 'consent checkbox',
      label: 'Consent',
      required: true,
      consentText: 'I agree to be contacted about this campaign.'
    }
  ];

  publicFields = this.fields;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  builderForm = this.fb.group({
  name: ['', Validators.required],
  brand: ['', Validators.required],
  market: ['', Validators.required],
  campaignSlug: ['', Validators.required],
  heading: ['', Validators.required],
  body: [''],
  ctaText: ['', Validators.required],
  thankYouMessage: ['']
  });

  publicFormGroup: FormGroup = this.fb.group({});

  ngOnInit(): void {

    this.page = this.route.snapshot.data['page'] || 'forms';
    this.formId = this.route.snapshot.paramMap.get('formId') || '';
    this.user = this.auth.getCurrentUser();

    if (this.page === 'login' && this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/admin/forms');
      return;
    }

    if (this.page === 'forms') {
      this.loadForms();
    }

    if (this.page === 'builder' && this.formId) {
  this.loadForm();
}

// LOAD SAVED DRAFT IN PREVIEW
if (this.page === 'preview' && this.formId) {
  this.loadPreviewForm();
}

if (this.page === 'public') {
  this.loadPublicForm();
}

    if (this.page === 'public' && !this.publicForm) {
      this.buildPublicFormGroup(this.publicFields);
    }
  }

  // LOGOUT

  logout(): void {
    this.auth.logout();
  }

  // LOCAL STORAGE HELPERS

  private getStoredForms(): FormSummary[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) as FormSummary[] : [];
    } catch {
      return [];
    }
  }

  private saveStoredForms(forms: FormSummary[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(forms));
  }

  // DASHBOARD SUMMARY

  countByStatus(status: string): number {
    return this.forms.filter(
      form => form.status === status
    ).length;
  }

  // LOAD CAMPAIGNS

  loadForms(): void {

    this.busy = true;
    this.error = '';

    const savedForms = this.getStoredForms();

    this.forms = savedForms.filter(form => {

      const matchesSearch =
        !this.search ||
        form.name.toLowerCase().includes(this.search.toLowerCase()) ||
        form.brand.toLowerCase().includes(this.search.toLowerCase()) ||
        form.market.toLowerCase().includes(this.search.toLowerCase());

      const matchesStatus =
        !this.status || form.status === this.status;

      return matchesSearch && matchesStatus;
    });

    this.busy = false;
  }

  // LOAD EXISTING FORM FOR EDITING

  loadForm(): void {

    const savedForms = this.getStoredForms();

    const form = savedForms.find(f => f.id === this.formId);

    if (!form) {
      this.error = 'Saved draft not found in local storage.';
      return;
    }

    this.builderForm.patchValue({
      name: form.name,
      brand: form.brand,
      market: form.market,
      campaignSlug: form.campaignSlug,
      heading: form.definition?.heading || '',
      body: form.definition?.body || '',
      ctaText: form.definition?.ctaText || '',
      thankYouMessage: form.definition?.thankYouMessage || ''
    });

    this.fields = form.definition?.fields || this.fields;

    this.error = '';
    this.message = '';
  }

  // LOAD SAVED FORM FOR PREVIEW

loadPreviewForm(): void {

  const savedForms = this.getStoredForms();

  const form = savedForms.find(
    f => f.id === this.formId
  );

  if (!form) {
    this.error = 'Saved draft not found in local storage.';
    return;
  }

  // Load campaign details
  this.builderForm.patchValue({
    name: form.name,
    brand: form.brand,
    market: form.market,
    campaignSlug: form.campaignSlug,
    heading: form.definition?.heading || '',
    body: form.definition?.body || '',
    ctaText: form.definition?.ctaText || '',
    thankYouMessage: form.definition?.thankYouMessage || ''
  });

  // Load dynamically configured fields
  this.fields = form.definition?.fields || [];

  this.error = '';
  this.message = '';
}

  // LOGIN

  login(): void {

    if (this.loginForm.invalid) return;

    this.busy = true;
    this.error = '';

    const { email, password } = this.loginForm.getRawValue();

    const success = this.auth.login(
      email || '',
      password || ''
    );

    this.busy = false;

    if (!success) {
      this.error = 'Invalid email address or password.';
      return;
    }

    this.user = this.auth.getCurrentUser();
    this.router.navigateByUrl('/admin/forms');
  }

  // ADD FIELD

  addField(): void {

  const id = `field_${Date.now()}`;

  const field: FormField = {
    id,
    type: this.newFieldType,
    label: '',
    required: false,
    placeholder: '',
    options: [],
    consentText: ''
  };

  this.fields = [...this.fields, field];

  this.error = '';
  this.message = '';
}

  private getFieldLabel(type: FieldType): string {

    const labels: Record<FieldType, string> = {
      text: 'New text field',
      email: 'Email address',
      mobile: 'Mobile number',
      dropdown: 'Dropdown field',
      radio: 'Radio field',
      checkbox: 'Checkbox field',
      date: 'Date field',
      textarea: 'Textarea field',
      'consent checkbox': 'Consent'
    };

    return labels[type];
  }

  private isChoiceField(type: FieldType): boolean {
    return ['dropdown', 'radio', 'checkbox'].includes(type);
  }

  // CHANGE FIELD TYPE

  changeFieldType(field: FormField, type: FieldType): void {

    field.type = type;

    if (this.isChoiceField(type)) {

      if (!field.options || !field.options.length) {
        field.options = [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ];
      }

    } else {
      field.options = [];
    }

    if (type === 'consent checkbox' && !field.consentText) {
      field.consentText = 'I agree to be contacted about this campaign.';
    }
  }

  // FIELD OPTIONS

  formatFieldOptions(field: FormField): string {
    return field.options?.map(option => option.label).join(', ') || '';
  }

  updateFieldOptions(field: FormField, value: string): void {

    field.options = value
      .split(',')
      .map(option => option.trim())
      .filter(option => option.length > 0)
      .map(option => ({
        label: option,
        value: this.makeOptionValue(option)
      }));
  }

  private makeOptionValue(value: string): string {

    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // REMOVE FIELD

  removeField(index: number): void {
    this.fields = this.fields.filter(
      (_, i) => i !== index
    );
  }

  // REORDER FIELD

  moveField(index: number, direction: number): void {

    const next = index + direction;

    if (next < 0 || next >= this.fields.length) return;

    const copy = [...this.fields];

    [copy[index], copy[next]] = [copy[next], copy[index]];

    this.fields = copy;
  }

  // SAVE FORM LOCALLY

  saveForm(): void {

    if (this.builderForm.invalid) return;

    const v = this.builderForm.getRawValue();

    const savedForms = this.getStoredForms();

    const existingForm = savedForms.find(
      form => form.id === this.formId
    );

    const now = new Date().toISOString();

    const formData = {
      id: this.formId || `form_${Date.now()}`,
      name: v.name!,
      brand: v.brand!,
      market: v.market!,
      campaignSlug: v.campaignSlug!,
      status: existingForm?.status || 'draft',
      createdAt: (existingForm as any)?.createdAt || now,
      updatedAt: now,
      definition: {
        heading: v.heading!,
        body: v.body || '',
        ctaText: v.ctaText!,
        thankYouMessage: v.thankYouMessage || '',
        fields: this.fields
      }
    } as unknown as FormSummary;

    const updatedForms = this.formId
      ? savedForms.map(form =>
          form.id === this.formId ? formData : form
        )
      : [...savedForms, formData];

    try {
      this.saveStoredForms(updatedForms);

      this.formId = formData.id;
      this.forms = updatedForms;

      this.error = '';
      this.message = 'Draft saved successfully on this device!';

    } catch {

      this.error = 'Could not save the draft. Check your browser storage.';

    }
  }

  // PUBLISH FORM LOCALLY

  publish(): void {

    if (!this.isAdmin) {
      this.error = 'Only Admin users can publish campaigns.';
      return;
    }

    if (!this.formId) {
      this.error = 'Please save the draft before publishing.';
      return;
    }

    const savedForms = this.getStoredForms();

    const updatedForms = savedForms.map(form =>
      form.id === this.formId
        ? {
            ...form,
            status: 'published',
            updatedAt: new Date().toISOString()
          } as FormSummary
        : form
    );

    try {

      this.saveStoredForms(updatedForms);

      this.forms = updatedForms;
      this.error = '';
      this.message = 'Campaign marked as published locally.';

    } catch {

      this.error = 'Could not update the campaign status.';

    }
  }

  // PREVIEW

 // PREVIEW

preview(): void {

  // Validate builder form
  if (this.builderForm.invalid) {
    this.builderForm.markAllAsTouched();
    this.error = 'Please complete all required campaign details before previewing.';
    return;
  }

  // Save the latest changes before opening preview
  this.error = '';
  this.saveForm();

  // Stop if saving failed
  if (this.error || !this.formId) {
    return;
  }

  // Navigate to preview
  this.router.navigateByUrl(
    `/admin/forms/${this.formId}/preview`
  );
}

  routerBackToBuilder(): void {

    const destination = this.formId
      ? `/admin/forms/${this.formId}/edit`
      : '/admin/forms/new';

    this.router.navigateByUrl(destination);
  }

  // GET PUBLIC FORM FIELDS

  getPublicFields(): FormField[] {
    return this.publicForm?.definition?.fields || this.publicFields;
  }

  // DYNAMIC PUBLIC FORM BUILDER

  private buildPublicFormGroup(fields: FormField[]): void {

    const controls: Record<string, any> = {};

    fields.forEach(field => {

      const validators = [];

      if (field.required) {
        validators.push(
          field.type === 'consent checkbox'
            ? Validators.requiredTrue
            : Validators.required
        );
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.type === 'mobile') {
        validators.push(
          Validators.pattern(/^[0-9+\-\s()]{7,20}$/)
        );
      }

      // MULTIPLE CHECKBOX FIELD
      if (field.type === 'checkbox') {

        const optionControls: Record<string, any> = {};

        (field.options || []).forEach(option => {
          optionControls[option.value] = [false];
        });

        controls[field.id] = this.fb.group(
          optionControls,
          {
            validators: field.required
              ? [this.atLeastOneChecked]
              : []
          }
        );

      } else {

        const initialValue =
          field.type === 'consent checkbox' ? false : '';

        controls[field.id] = this.fb.control(
          initialValue,
          validators
        );

      }

    });

    this.publicFormGroup = this.fb.group(controls);
  }

  // VALIDATE THAT AT LEAST ONE CHECKBOX OPTION IS SELECTED

  private atLeastOneChecked(
    control: AbstractControl
  ): ValidationErrors | null {

    const values = Object.values(control.value || {});

    return values.some(value => value === true)
      ? null
      : { required: true };
  }

  // LOAD PUBLIC FORM FROM BACKEND

  loadPublicForm(): void {

    const p = this.route.snapshot.paramMap;

    this.api.publicForm(
      p.get('brandMarketSlug') || '',
      p.get('campaignSlug') || ''
    ).subscribe({

      next: f => {

        this.publicForm = f;

        this.buildPublicFormGroup(
          f.definition?.fields || this.publicFields
        );

        this.error = '';

      },

      error: err => {

        this.buildPublicFormGroup(this.publicFields);
        this.error = this.apiMessage(err);

      }

    });
  }

  // SUBMIT PUBLIC FORM

  submitPublic(): void {

    if (this.publicFormGroup.invalid) {

      this.publicFormGroup.markAllAsTouched();
      return;

    }

    const p = this.route.snapshot.paramMap;

    const params = new URLSearchParams(window.location.search);

    const utm: Record<string, string> = {};

    [
      'utm_source',
      'utm_medium',
      'utm_campaign'
    ].forEach(k => {

      const value = params.get(k);

      if (value) {
        utm[k] = value;
      }

    });

    // Prepare submission data
    const rawValues = this.publicFormGroup.getRawValue();

    const submissionData: Record<string, unknown> = {};

    this.getPublicFields().forEach(field => {

      const value = rawValues[field.id];

      // Convert multiple checkbox values into an array
      if (field.type === 'checkbox') {

        const selectedOptions = Object.entries(value || {})
          .filter(([_, selected]) => selected === true)
          .map(([optionValue]) => optionValue);

        submissionData[field.id] = selectedOptions;

      } else {

        submissionData[field.id] = value;

      }

    });

    this.busy = true;
    this.error = '';
    this.message = '';

    this.api.submitPublicForm(
      p.get('brandMarketSlug') || '',
      p.get('campaignSlug') || '',
      submissionData,
      utm
    ).subscribe({

      next: () => {

        this.busy = false;

        this.message =
          this.publicForm?.definition?.thankYouMessage ||
          'Thank you. Your request has been received.';

        this.publicFormGroup.reset();

      },

      error: err => {

        this.busy = false;
        this.error = this.apiMessage(err);

      }

    });
  }

  // API ERROR MESSAGE

  private apiMessage(err: any): string {

    return err?.error?.message ||
      'Could not connect to the backend API. Check the API URL, server status, and endpoint contract.';

  }

}