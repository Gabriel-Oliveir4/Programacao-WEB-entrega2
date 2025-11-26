import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstoqueMovimentoRequest } from '../models/estoque';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  constructor(private readonly http: HttpClient) {}

  entrada(payload: EstoqueMovimentoRequest): Observable<void> {
    const params = new HttpParams().set('produtoId', payload.produtoId).set('qtd', payload.qtd);
    return this.http.post<void>(`${environment.apiUrl}/api/estoque/entrada`, null, { params });
  }

  saida(payload: EstoqueMovimentoRequest): Observable<void> {
    const params = new HttpParams().set('produtoId', payload.produtoId).set('qtd', payload.qtd);
    return this.http.post<void>(`${environment.apiUrl}/api/estoque/saida`, null, { params });
  }
}
