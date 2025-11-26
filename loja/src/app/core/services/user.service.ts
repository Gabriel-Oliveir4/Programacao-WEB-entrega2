import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RegisterRequest } from '../models/register-request';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  list(ativo?: boolean): Observable<User[]> {
    let params = new HttpParams();
    if (ativo !== undefined) {
      params = params.set('ativo', ativo);
    }

    return this.http.get<User[]>(`${environment.apiUrl}/api/usuarios`, { params });
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/usuarios/${id}`);
  }

  registerAdmin(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/api/usuarios/registrar-admin`, payload);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/usuarios/${id}`);
  }
}
