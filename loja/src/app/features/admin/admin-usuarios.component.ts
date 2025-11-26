import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../../core/services/user.service';
import { RegisterRequest } from '../../core/models/register-request';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);

  protected readonly feedback = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected adminForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  registrarAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.adminForm.getRawValue();
    this.loading.set(true);
    this.feedback.set(null);

    this.userService.registerAdmin(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.feedback.set('Novo ADMIN criado com sucesso.');
        this.adminForm.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.feedback.set(err?.error?.message ?? 'Não foi possível criar o administrador.');
      }
    });
  }
}
