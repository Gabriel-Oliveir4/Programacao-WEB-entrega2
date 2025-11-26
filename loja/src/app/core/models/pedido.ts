export interface PedidoItemRequest {
  produtoId: string;
  quantidade: number;
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
  itens: PedidoItemRequest[];
}
