import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto, ProdutoRequest } from '../../core/models/produto';
import { EstoqueService } from '../../core/services/estoque.service';
import { EstoqueMovimentoRequest } from '../../core/models/estoque';

@Component({
  selector: 'app-admin-estoque',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-estoque.component.html',
  styleUrl: './admin-estoque.component.css'
})
export class AdminEstoqueComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly loadingProdutos = signal(false);
  protected readonly feedback = signal<string | null>(null);
  protected readonly movimentoFeedback = signal<string | null>(null);
  protected readonly selectedProdutoId = signal<string | null>(null);

  protected produtoForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    tamanho: ['', Validators.required],
    cor: ['', Validators.required],
    preco: [0, [Validators.required, Validators.min(0)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    fotoUrl: ['']
  });

  protected movimentoForm = this.formBuilder.nonNullable.group({
    produtoId: ['', Validators.required],
    qtd: [1, [Validators.required, Validators.min(1)]],
    tipo: ['entrada', Validators.required]
  });

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loadingProdutos.set(true);
    this.feedback.set(null);

    this.produtoService.listar(false).subscribe({
      next: (dados) => {
        this.loadingProdutos.set(false);
        this.produtos.set(dados);

        if (!this.movimentoForm.controls.produtoId.value) {
          const first = dados.find((p) => p.id)?.id;
          if (first) {
            this.movimentoForm.patchValue({ produtoId: first });
          }
        }
      },
      error: () => {
        this.loadingProdutos.set(false);
        this.feedback.set('Não foi possível carregar os produtos.');
      }
    });
  }

  salvarProduto(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    const payload: ProdutoRequest = this.produtoForm.getRawValue();
    this.feedback.set(null);

    const request$ = this.selectedProdutoId()
      ? this.produtoService.atualizar(this.selectedProdutoId()!, payload)
      : this.produtoService.criar(payload);

    request$.subscribe({
      next: (produto) => {
        this.feedback.set(this.selectedProdutoId() ? 'Produto atualizado com sucesso.' : 'Produto criado e publicado.');
        this.produtoForm.reset({ preco: 0, quantidadeEstoque: 0 });
        this.selectedProdutoId.set(null);
        this.carregarProdutos();

        if (!this.movimentoForm.controls.produtoId.value) {
          this.movimentoForm.patchValue({ produtoId: produto.id ?? '' });
        }
      },
      error: (err) => {
        this.feedback.set(err?.error?.message ?? 'Não foi possível salvar o produto.');
      }
    });
  }

  editar(produto: Produto): void {
    this.selectedProdutoId.set(produto.id ?? null);
    this.produtoForm.patchValue({
      nome: produto.nome ?? '',
      tamanho: produto.tamanho ?? '',
      cor: produto.cor ?? '',
      preco: produto.preco ?? 0,
      quantidadeEstoque: produto.quantidadeEstoque ?? 0,
      fotoUrl: produto.fotoUrl ?? ''
    });
  }

  cancelarEdicao(): void {
    this.selectedProdutoId.set(null);
    this.produtoForm.reset({ preco: 0, quantidadeEstoque: 0 });
  }

  alternarVisibilidade(produto: Produto): void {
    if (!produto.id) return;

    const novoValor = !(produto.ativo ?? true);
    this.produtoService.alterarVisibilidade(produto.id, novoValor).subscribe({
      next: () => {
        this.feedback.set(novoValor ? 'Produto ativado.' : 'Produto desativado.');
        this.carregarProdutos();
      },
      error: () => {
        this.feedback.set('Não foi possível alterar a visibilidade.');
      }
    });
  }

  registrarMovimento(): void {
    if (this.movimentoForm.invalid) {
      this.movimentoForm.markAllAsTouched();
      return;
    }

    const { produtoId, qtd, tipo } = this.movimentoForm.getRawValue();
    const payload: EstoqueMovimentoRequest = { produtoId, qtd: Number(qtd) };

    const request$ = tipo === 'entrada' ? this.estoqueService.entrada(payload) : this.estoqueService.saida(payload);

    request$.subscribe({
      next: () => {
        this.movimentoFeedback.set('Movimentação registrada.');
        this.carregarProdutos();
      },
      error: (err) => {
        this.movimentoFeedback.set(err?.error?.message ?? 'Não foi possível registrar a movimentação.');
      }
    });
  }
}
