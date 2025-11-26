import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto, ProdutoRequest } from '../../core/models/produto';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user';
import { PagamentoRequest, Pedido, PedidoRequest } from '../../core/models/pedido';
import { PedidoService } from '../../core/services/pedido.service';
import { UserService } from '../../core/services/user.service';
import { RegisterRequest } from '../../core/models/register-request';

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
  private readonly userService = inject(UserService);
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
  protected readonly pagamentoFeedback = signal<string | null>(null);
  protected readonly adminFeedback = signal<string | null>(null);
  protected readonly pagamentoLoading = signal(false);
  protected readonly adminLoading = signal(false);

  protected produtoForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    tamanho: ['', Validators.required],
    cor: ['', Validators.required],
    preco: [0, [Validators.required, Validators.min(0)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    fotoUrl: ['']
  });

  protected pedidoForm = this.formBuilder.nonNullable.group({
    produtoId: ['', Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]]
  });

  protected pagamentoForm = this.formBuilder.nonNullable.group({
    pedidoId: ['', Validators.required],
    metodo: ['PIX', Validators.required],
    referencia: [`pgto-${Date.now()}`, Validators.required]
  });

  protected adminForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
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

  criarProduto(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    const payload: ProdutoRequest = this.produtoForm.getRawValue();
    this.feedback.set(null);

    this.produtoService.criar(payload).subscribe({
      next: (produto) => {
        this.produtoForm.reset({ preco: 0, quantidadeEstoque: 0 });
        this.produtos.set([produto, ...this.produtos()]);
        this.feedback.set('Produto criado e disponível para os clientes.');
      },
      error: (err) => {
        this.feedback.set(err?.error?.message ?? 'Não foi possível criar o produto.');
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

  registrarAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.adminForm.getRawValue();
    this.adminLoading.set(true);
    this.adminFeedback.set(null);

    this.userService.registerAdmin(payload).subscribe({
      next: () => {
        this.adminLoading.set(false);
        this.adminFeedback.set('Novo ADMIN criado com sucesso. Use o login para acessar.');
        this.adminForm.reset();
      },
      error: (err) => {
        this.adminLoading.set(false);
        this.adminFeedback.set(err?.error?.message ?? 'Não foi possível criar o administrador.');
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
        this.pagamentoFeedback.set('Pagamento registrado. O pedido é atualizado na lista.');
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

  papelAtual(): Role | 'DESCONHECIDO' {
    if (this.isAdmin()) return 'ADMIN';
    if (this.isClient()) return 'CLIENTE';
    return 'DESCONHECIDO';
  }
}
