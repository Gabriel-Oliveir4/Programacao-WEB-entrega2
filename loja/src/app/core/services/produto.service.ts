import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Produto, ProdutoRequest } from '../models/produto';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  constructor(private readonly http: HttpClient) {}

  listar(ativo?: boolean): Observable<Produto[]> {
    let params = new HttpParams();
    if (ativo !== undefined) {
      params = params.set('ativo', ativo);
    }

    return this.http.get<Produto[]>(`${environment.apiUrl}/api/produtos`, { params });
  }

  buscarPorId(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${environment.apiUrl}/api/produtos/${id}`);
  }

  criar(produto: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(`${environment.apiUrl}/api/produtos`, produto);
  }

  atualizar(id: string, produto: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${environment.apiUrl}/api/produtos/${id}`, produto);
  }

  alterarVisibilidade(id: string, ativo: boolean): Observable<void> {
    const params = new HttpParams().set('ativo', ativo);
    return this.http.patch<void>(`${environment.apiUrl}/api/produtos/${id}/visibilidade`, null, {
      params
    });
  }
}
