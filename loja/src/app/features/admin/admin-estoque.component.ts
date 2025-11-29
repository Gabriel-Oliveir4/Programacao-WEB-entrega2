import { Component, OnInit, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto, ProdutoRequest } from '../../core/models/produto';
import { EstoqueService } from '../../core/services/estoque.service';
import { EstoqueMovimentoRequest } from '../../core/models/estoque';

@Component({
  selector: 'app-admin-estoque',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-estoque.component.html',
  styleUrl: './admin-estoque.component.css'
})
export class AdminEstoqueComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('produtoDialog') produtoDialog?: TemplateRef<unknown>;
  @ViewChild('movimentoDialog') movimentoDialog?: TemplateRef<unknown>;

  private produtoDialogRef?: MatDialogRef<unknown>;
  private movimentoDialogRef?: MatDialogRef<unknown>;

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

  abrirDialogoProduto(produto?: Produto): void {
    if (produto) {
      this.editar(produto, false);
    } else {
      this.resetProdutoForm();
    }

    if (this.produtoDialog) {
      this.produtoDialogRef = this.dialog.open(this.produtoDialog, { panelClass: 'estoque-dialog', width: '760px', maxWidth: '92vw' });
    }
  }

  abrirDialogoMovimento(produto?: Produto): void {
    const targetId = produto?.id ?? this.movimentoForm.controls.produtoId.value ?? '';
    this.movimentoForm.patchValue({ produtoId: targetId });

    if (this.movimentoDialog) {
      this.movimentoDialogRef = this.dialog.open(this.movimentoDialog, { panelClass: 'estoque-dialog', width: '600px', maxWidth: '92vw' });
    }
  }

  resetProdutoForm(): void {
    this.selectedProdutoId.set(null);
    this.produtoForm.reset({ preco: 0, quantidadeEstoque: 0 });
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
        this.resetProdutoForm();
        this.carregarProdutos();

        this.produtoDialogRef?.close();
        this.snackBar.open(this.feedback() ?? 'Operação concluída.', 'Fechar', { duration: 3000 });

        if (!this.movimentoForm.controls.produtoId.value) {
          this.movimentoForm.patchValue({ produtoId: produto.id ?? '' });
        }
      },
      error: (err) => {
        this.feedback.set(err?.error?.message ?? 'Não foi possível salvar o produto.');
        this.produtoDialogRef?.close();
        this.snackBar.open(this.feedback()!, 'Fechar', { duration: 3000 });
      }
    });
  }

  editar(produto: Produto, openDialog = true): void {
    this.selectedProdutoId.set(produto.id ?? null);
    this.produtoForm.patchValue({
      nome: produto.nome ?? '',
      tamanho: produto.tamanho ?? '',
      cor: produto.cor ?? '',
      preco: produto.preco ?? 0,
      quantidadeEstoque: produto.quantidadeEstoque ?? 0,
      fotoUrl: produto.fotoUrl ?? ''
    });

    if (openDialog) {
      this.abrirDialogoProduto(produto);
    }
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

        this.movimentoDialogRef?.close();
        this.snackBar.open(this.movimentoFeedback()!, 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.movimentoFeedback.set(err?.error?.message ?? 'Não foi possível registrar a movimentação.');
        this.movimentoDialogRef?.close();
        this.snackBar.open(this.movimentoFeedback()!, 'Fechar', { duration: 3000 });
      }
    });
  }
}
