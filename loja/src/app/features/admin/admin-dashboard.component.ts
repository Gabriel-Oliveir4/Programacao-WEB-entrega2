import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Pedido } from '../../core/models/pedido';
import { Produto } from '../../core/models/produto';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly produtoService = inject(ProdutoService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly loadingPedidos = signal(false);
  protected readonly loadingProdutos = signal(false);
  protected readonly pedidoFeedback = signal<string | null>(null);
  protected readonly statusFiltro = signal<string>('Todos');

  protected readonly statusDisponiveis = computed(() => {
    const status = new Set(this.pedidos().map((p) => p.status ?? 'SEM STATUS'));
    return ['Todos', ...status];
  });

  protected readonly pedidosFiltrados = computed(() => {
    const filtro = this.statusFiltro();
    return this.pedidos().filter((p) => {
      const status = p.status ?? 'SEM STATUS';
      return filtro === 'Todos' || status === filtro;
    });
  });

  ngOnInit(): void {
    this.carregarProdutos();
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

  nomeDoProduto(produtoId: string): string {
    return this.produtos().find((p) => p.id === produtoId)?.nome ?? produtoId;
  }

  statusClass(status?: string | null): string {
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'pago') return 'chip-paid';
    if (normalized === 'criado') return 'chip-created';
    if (normalized === 'cancelado') return 'chip-cancelado';

    return 'chip-default';
  }
}
