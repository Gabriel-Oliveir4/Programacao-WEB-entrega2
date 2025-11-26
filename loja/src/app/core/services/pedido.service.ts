import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagamentoRequest, Pedido, PedidoRequest } from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private readonly http: HttpClient) {}

  listarTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${environment.apiUrl}/api/pedidos`);
  }

  listarPorUsuario(usuarioId: string, visiveis?: boolean): Observable<Pedido[]> {
    let params = new HttpParams();
    if (visiveis !== undefined) {
      params = params.set('visiveis', visiveis);
    }

    return this.http.get<Pedido[]>(`${environment.apiUrl}/api/pedidos/usuario/${usuarioId}`, {
      params
    });
  }

  buscarPorId(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${environment.apiUrl}/api/pedidos/${id}`);
  }

  criar(pedido: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiUrl}/api/pedidos`, pedido);
  }

  pagar(id: string, pagamento: PagamentoRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/pedidos/${id}/pagar`, pagamento);
  }

  cancelar(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/pedidos/${id}/cancelar`, null);
  }
}
