import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Pedido, PagamentoRequest } from '../../core/models/pedido';
import { Produto } from '../../core/models/produto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly loadingPedidos = signal(false);
  protected readonly loadingProdutos = signal(false);
  protected readonly pedidoFeedback = signal<string | null>(null);
  protected readonly pagamentoFeedback = signal<string | null>(null);
  protected readonly pagamentoLoading = signal(false);

  protected pagamentoForm = this.formBuilder.nonNullable.group({
    pedidoId: ['', Validators.required],
    metodo: ['PIX', Validators.required],
    referencia: [`pgto-${Date.now()}`, Validators.required]
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

  pagarPedido(): void {
    if (this.pagamentoForm.invalid) {
      this.pagamentoForm.markAllAsTouched();
      return;
    }

    const { pedidoId, metodo, referencia } = this.pagamentoForm.getRawValue();
    const payload: PagamentoRequest = { metodo, referencia };

    this.pagamentoLoading.set(true);
    this.pagamentoFeedback.set(null);

    this.pedidoService.pagar(pedidoId, payload).subscribe({
      next: () => {
        this.pagamentoLoading.set(false);
        this.pagamentoFeedback.set('Pagamento registrado e pedido atualizado.');
        this.carregarPedidos();
      },
      error: (err) => {
        this.pagamentoLoading.set(false);
        this.pagamentoFeedback.set(err?.error?.message ?? 'Não foi possível registrar o pagamento.');
      }
    });
  }

  selecionarPedido(pedidoId: string | undefined): void {
    if (pedidoId) {
      this.pagamentoForm.patchValue({ pedidoId });
    }
  }

  nomeDoProduto(produtoId: string): string {
    return this.produtos().find((p) => p.id === produtoId)?.nome ?? produtoId;
  }
}
