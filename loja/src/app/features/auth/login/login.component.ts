import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/login-request';
import { RegisterRequest } from '../../../core/models/register-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  feedback = signal<string | null>(null);
  registerFeedback = signal<string | null>(null);
  loading = signal(false);
  registerLoading = signal(false);

  form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  registerForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = this.form.getRawValue();
    this.loading.set(true);
    this.feedback.set(null);

    this.authService.login(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        this.feedback.set(err?.error?.message ?? 'Não foi possível fazer login.');
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.registerForm.getRawValue();
    this.registerLoading.set(true);
    this.registerFeedback.set(null);

    this.authService.register(payload).subscribe({
      next: () => {
        this.registerLoading.set(false);
        this.registerFeedback.set('Cliente cadastrado! Agora é só entrar com o email e senha.');
        this.registerForm.reset();
      },
      error: (err) => {
        this.registerLoading.set(false);
        this.registerFeedback.set(err?.error?.message ?? 'Não foi possível cadastrar o usuário.');
      }
    });
  }
}
