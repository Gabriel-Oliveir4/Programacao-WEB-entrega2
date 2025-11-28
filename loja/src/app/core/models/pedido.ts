import { Produto } from './produto';

export interface PedidoItemRequest {
  produtoId: string;
  quantidade: number;
}

export interface PedidoItem extends PedidoItemRequest {
  id?: string;
  produto?: Produto;
}

export interface PedidoRequest {
  usuarioId: string;
  itens: PedidoItemRequest[];
}

export interface PagamentoRequest {
  metodo: string;
  referencia: string;
}

export interface Pedido {
  id?: string;
  usuarioId: string;
  status?: string;
  itens: PedidoItem[];
}
