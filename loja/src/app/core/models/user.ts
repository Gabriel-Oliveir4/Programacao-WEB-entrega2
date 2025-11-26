export type Role = 'ADMIN' | 'CLIENTE';

export interface User {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
  role?: Role;
  ativo?: boolean;
}
