import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';
import { RegisterRequest } from '../models/register-request';
import { Role, User } from '../models/user';

interface JwtPayload {
  exp?: number;
  role?: Role | Role[];
  roles?: Role[];
  sub?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'lacouro_token';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<string> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, payload)
      .pipe(tap((response) => this.saveToken(response.token)), map((response) => response.token));
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/register`, payload);
  }

  logout(): void {
    if (this.hasStorageSupport()) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getToken(): string | null {
    if (!this.hasStorageSupport()) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }

    if (!payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      this.logout();
      return false;
    }

    return true;
  }

  hasRole(role: Role): boolean {
    const roles = this.getRolesFromToken();
    return roles.includes(role);
  }

  getUserId(): string | null {
    const token = this.getToken();
    const payload = token ? this.decodeToken(token) : null;

    if (!payload) {
      return null;
    }

    const subject = payload.sub ?? payload['id'];
    return typeof subject === 'string' ? subject : null;
  }

  private getRolesFromToken(): Role[] {
    const token = this.getToken();
    const payload = token ? this.decodeToken(token) : null;

    if (!payload) {
      return [];
    }

    const roles = payload.roles ?? payload.role;
    if (Array.isArray(roles)) {
      return roles;
    }

    if (roles) {
      return [roles];
    }

    return [];
  }

  private decodeToken(token: string): JwtPayload | null {
    const [, base64Payload] = token.split('.');

    if (!base64Payload) {
      return null;
    }

    try {
      const jsonPayload = this.decodeBase64(base64Payload);
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  private decodeBase64(value: string): string {
    if (typeof atob === 'function') {
      return atob(value);
    }

    return Buffer.from(value, 'base64').toString('utf-8');
  }

  private saveToken(token: string): void {
    if (this.hasStorageSupport()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private hasStorageSupport(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
