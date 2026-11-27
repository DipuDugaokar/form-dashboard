
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'Admin' | 'Editor';

export interface AuthUser {
  email: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'formflow_user';

  // Temporary accounts for local development only.
  private readonly demoAccounts = [
    {
      email: 'admin@formflow.local',
      password: 'Admin@123',
      role: 'Admin' as UserRole
    },
    {
      email: 'editor@formflow.local',
      password: 'Editor@123',
      role: 'Editor' as UserRole
    }
  ];

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    const account = this.demoAccounts.find(
      user =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );

    if (!account) {
      return false;
    }

    const user: AuthUser = {
      email: account.email,
      role: account.role
    };

    sessionStorage.setItem(
      this.storageKey,
      JSON.stringify(user)
    );

    return true;
  }

  getCurrentUser(): AuthUser | null {
    const storedUser = sessionStorage.getItem(this.storageKey);

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser) as AuthUser;

      if (
        !user.email ||
        !['Admin', 'Editor'].includes(user.role)
      ) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }

      return user;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  logout(): void {
    sessionStorage.removeItem(this.storageKey);
    this.router.navigate(['/admin/login']);
  }
}
