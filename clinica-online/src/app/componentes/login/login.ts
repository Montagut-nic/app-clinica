import { Component, inject, OnInit } from '@angular/core';
import { LoaderService } from '../loader/loader-service';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { SessionService } from '../../servicios/session';
import { SpecialtyService } from '../../servicios/specialty';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface QuickUser {
  label: string;
  role: 'admin' | 'especialista' | 'paciente';
  email: string;
  password: string;
  avatar: string;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private session = inject(SessionService);
  private loader = inject(LoaderService);
  private sb = inject(SupabaseClientService).client;
  private specialtySvc = inject(SpecialtyService);

  quickUsers: QuickUser[] = [
    {
      label: 'Paciente 1',
      role: 'paciente',
      email: 'lucamerolla124@gmail.com',
      password: '123456',
      avatar: '',
    },
    {
      label: 'Paciente 2',
      role: 'paciente',
      email: 'pepeargento@yopmail.com',
      password: '123456',
      avatar: '',
    },
    {
      label: 'Paciente 3',
      role: 'paciente',
      email: 'cockyargento@yopmail.com',
      password: '123456',
      avatar: '',
    },
    {
      label: 'Especialista 1',
      role: 'especialista',
      email: 'terala6344@fergetic.com',
      password: '123456',
      avatar: '',
    },
    {
      label: 'Especialista 2',
      role: 'especialista',
      email: 'especialista@yopmail.com',
      password: '123456',
      avatar: '',
    },
    {
      label: 'Admin',
      role: 'admin',
      email: 'joaquin.messina@gmail.com',
      password: '123456',
      avatar: '',
    },
  ];


  ngOnInit(): void {
    document.title = 'La Clínica Online - Acceso';

  }

  email = '';
  password = '';

  useQuick(u: QuickUser) {
    this.email = u.email;
    this.password = u.password;
  }

  async submit() {
    this.loader.show();
    try {
      await (async () => {
        const r = await this.auth.signInEmailChecked(this.email, this.password);
        if (!r.ok) {
          if (r.code === 'PENDIENTE') {
            alert('Tu cuenta de especialista está pendiente de aprobación por un administrador.');
          } else if (r.code === 'CREDENCIALES') {
            alert('Email o contraseña incorrectos.');
          } else {
            alert('No se pudo iniciar sesión. Inténtalo de nuevo más tarde.');
          }
          return;
        }

        await this.session.refresh();

        const prof = this.session.profile();
        if (!prof) {
          this.router.navigateByUrl('/perfil');
          return;
        }

        if (prof.categoria === 'admin') this.router.navigateByUrl('/admin/usuarios');
        else this.router.navigateByUrl('/perfil');
      });
    } finally {
      this.loader.hide();
    }
  }

}
