import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto } from '../../core/models/produto';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user';
import { Pedido, PedidoRequest } from '../../core/models/pedido';
import { PedidoService } from '../../core/services/pedido.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly produtoService = inject(ProdutoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  protected readonly isClient = computed(() => this.authService.hasRole('CLIENTE'));
  protected readonly userId = computed(() => this.authService.getUserId());

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly loadingProdutos = signal(false);
  protected readonly loadingPedidos = signal(false);
  protected readonly feedback = signal<string | null>(null);
  protected readonly pedidoFeedback = signal<string | null>(null);

  protected readonly pedidoAcaoFeedback = signal<string | null>(null);

  protected pedidoForm = this.formBuilder.nonNullable.group({
    produtoId: ['', Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarPedidos();
  }

  carregarProdutos(): void {
    this.loadingProdutos.set(true);
    this.feedback.set(null);

    this.produtoService.listar(true).subscribe({
      next: (produtos) => {
        this.loadingProdutos.set(false);
        this.produtos.set(produtos);
        const firstId = produtos.find((p) => p.id)?.id;
        if (firstId && !this.pedidoForm.controls.produtoId.value) {
          this.pedidoForm.patchValue({ produtoId: firstId });
        }
      },
      error: () => {
        this.loadingProdutos.set(false);
        this.feedback.set('Não foi possível carregar os produtos.');
      }
    });
  }

  carregarPedidos(): void {
    if (!this.isAdmin() && !this.userId()) {
      return;
    }

    this.loadingPedidos.set(true);
    this.pedidoFeedback.set(null);

    const pedidos$ = this.isAdmin()
      ? this.pedidoService.listarTodos()
      : this.pedidoService.listarPorUsuario(this.userId()!, true);

    pedidos$.subscribe({
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

  criarPedido(): void {
    if (this.pedidoForm.invalid || !this.userId()) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    const { produtoId, quantidade } = this.pedidoForm.getRawValue();
    const payload: PedidoRequest = {
      usuarioId: this.userId()!,
      itens: [{ produtoId, quantidade: Number(quantidade) }]
    };

    this.pedidoAcaoFeedback.set(null);

    this.pedidoService.criar(payload).subscribe({
      next: (pedido) => {
        this.pedidoAcaoFeedback.set('Pedido criado! Ele aparece abaixo e pode ser pago pelo admin.');
        this.pedidos.set([pedido, ...this.pedidos()]);
      },
      error: (err) => {
        this.pedidoAcaoFeedback.set(err?.error?.message ?? 'Não foi possível criar o pedido.');
      }
    });
  }

  nomeDoProduto(produtoId: string): string {
    return this.produtos().find((p) => p.id === produtoId)?.nome ?? produtoId;
  }

  papelAtual(): Role | 'DESCONHECIDO' {
    if (this.isAdmin()) return 'ADMIN';
    if (this.isClient()) return 'CLIENTE';
    return 'DESCONHECIDO';
  }
}
