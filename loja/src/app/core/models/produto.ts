export interface Produto {
  id?: string;
  nome: string;
  tamanho: string;
  cor: string;
  preco: number;
  quantidadeEstoque?: number;
  fotoUrl?: string;
  ativo?: boolean;
}

export interface ProdutoRequest extends Omit<Produto, 'id'> {}
