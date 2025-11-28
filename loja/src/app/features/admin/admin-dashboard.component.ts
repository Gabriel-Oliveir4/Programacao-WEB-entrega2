import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';

import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Pedido } from '../../core/models/pedido';
import { Produto } from '../../core/models/produto';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly userService = inject(UserService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly usuarios = signal<User[]>([]);
  protected readonly loadingPedidos = signal(false);
  protected readonly loadingProdutos = signal(false);
  protected readonly pedidoFeedback = signal<string | null>(null);
  protected readonly statusFiltro = signal<string>('Todos');
  protected readonly clienteFiltro = signal<string>('');
  protected readonly produtoFiltro = signal<string>('');
  protected readonly idFiltro = signal<string>('');
  protected readonly quantidadeMinFiltro = signal<number | null>(null);

  protected readonly statusDisponiveis = computed(() => {
    const status = new Set(this.pedidos().map((p) => p.status ?? 'SEM STATUS'));
    return ['Todos', ...status];
  });

  protected readonly pedidosFiltrados = computed(() => {
    const filtro = this.statusFiltro();
    const filtroCliente = this.clienteFiltro().toLowerCase();
    const filtroProduto = this.produtoFiltro().toLowerCase();
    const filtroId = this.idFiltro().toLowerCase();
    const qtdMin = this.quantidadeMinFiltro();

    return this.pedidos().filter((p) => {
      const status = p.status ?? 'SEM STATUS';
      const matchesStatus = filtro === 'Todos' || status === filtro;

      const clienteNome = this.nomeDoCliente(p.usuarioId).toLowerCase();
      const matchesCliente = !filtroCliente || clienteNome.includes(filtroCliente) || p.usuarioId.includes(filtroCliente);

      const itens = p.itens || [];
      const temProduto = !filtroProduto ||
        itens.some((item) => this.nomeDoProduto(item.produtoId, item.produto).toLowerCase().includes(filtroProduto));

      const matchesId = !filtroId || (p.id ?? '').toLowerCase().includes(filtroId);
      const somaQtd = itens.reduce((total, item) => total + (item.quantidade ?? 0), 0);
      const matchesQtd = qtdMin === null || somaQtd >= qtdMin;

      return matchesStatus && matchesCliente && temProduto && matchesId && matchesQtd;
    });
  });

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarUsuarios();
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.loadingPedidos.set(true);
    this.pedidoFeedback.set(null);

    this.pedidoService.listarTodos().subscribe({
      next: (dados) => {
        this.loadingPedidos.set(false);
        this.pedidos.set(dados);
      },
      error: () => {
        this.loadingPedidos.set(false);
        this.pedidoFeedback.set('Não foi possível carregar os pedidos.');
      }
    });
  }

  carregarProdutos(): void {
    this.loadingProdutos.set(true);

    this.produtoService.listar().subscribe({
      next: (dados) => {
        this.loadingProdutos.set(false);
        this.produtos.set(dados);
      },
      error: () => {
        this.loadingProdutos.set(false);
      }
    });
  }

  carregarUsuarios(): void {
    this.userService.list().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: () => {
        /* silencioso para não bloquear a tela */
      }
    });
  }

  nomeDoProduto(produtoId?: string | null, produto?: Produto | null): string {
    const viaProduto = produto?.nome?.trim();
    if (viaProduto) return viaProduto;

    const idLookup = produto?.id || produtoId;
    if (!idLookup) return 'Produto';

    return this.produtos().find((p) => p.id === idLookup)?.nome ?? idLookup;
  }

  nomeDoCliente(usuarioId: string): string {
    return this.usuarios().find((u) => u.id === usuarioId)?.nome ?? usuarioId;
  }

  quantidadeTotal(pedido: Pedido): number {
    return (pedido.itens || []).reduce((total, item) => total + (item.quantidade ?? 0), 0);
  }

  statusClass(status?: string | null): string {
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'pago') return 'chip-paid';
    if (normalized === 'criado') return 'chip-created';
    if (normalized === 'cancelado') return 'chip-cancelado';

    return 'chip-default';
  }
}
