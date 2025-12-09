import { Component, inject, OnInit, signal } from '@angular/core';
import { LoaderService } from '../loader/loader-service';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../servicios/toast';
import { AnyUsuario } from '../../clases/usuario';

interface QuickUser {
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
  private loader = inject(LoaderService);
  private supa = inject(SupabaseClientService);
  private toast = inject(ToastService);
  private profile = signal <AnyUsuario | null>(null);

  quickUsers: QuickUser[] = [
    {
      email: 'piyijar697@cexch.com',
      password: 'test123',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/12345666-1764995770462/paciente-1-1764995770952.jpg',
    },
    {
      email: 'nico.monta99@gmail.com',
      password: '123456',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/34566788-1764997514653/paciente-1-1764997515116.jpg',
    },
    {
      email: 'xidil37990@bialode.com',
      password: '123456',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/9876555-1765006299211/paciente-1-1765006299823.jpg',
    },
    {
      email: 'reloyob700@datehype.com',
      password: '123456',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/78999000-1765031950743/especialista-1765031951225.png',
    },
    {
      email: 'picig39619@httpsu.com',
      password: '123456',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/40983678-1765032754772/especialista-1765032755286.jpeg',
    },
    {
      email: 'montagut.nm@gmail.com',
      password: 'test123',
      avatar: 'https://oulpgsltvlibsjrrinco.supabase.co/storage/v1/object/public/avatars/42232300-1765040370940/admin.jpg',
    },
  ];


  /*  Método para crear un usuario admin de prueba 
  async crearUsuarioAdmin() {
    this.loader.show();
    try {
      let date = Date.now();
      const path = `42232300-${date}/admin.jpg`;
      const { data: resp, error: signErr } = await this.sb.auth.signUp({
        email: 'montagut.nm@gmail.com',
        password: 'test123',
        options: {
          data: {
            rol: 'admin',
            nombre: 'Nicolás',
            apellido: 'Montagut',
            edad: 26,
            dni: '42232300',
            obra_social: null,
            avatar_path1: path,
            avatar_path2: null,
            specialties_ids: null,
            specialty_other: null,
          },
        },
      });

      if (signErr) {
        this.toast.error(signErr.message);
        return;
      }

      const newUser = resp.user;

      if (!newUser) {
        // no hubo error pero tampoco user, caso raro
        this.toast.error('No se pudo crear el usuario.');
        return;
      }

      const { data, error } = await this.sb.from('profiles').insert({
        _uuid: newUser.id,
        _email: 'montagut.nm@gmail.com',
        _rol: 'admin',
        _nombre: 'Nicolás',
        _apellido: 'Montagut',
        _edad: 26,
        _dni: '42232300',
        _avatar_path1: path,
        _is_approved: true
      });

      if (error) {
        console.error('[register] error creando perfil admin:', error);
        this.toast.error('No se pudo crear el perfil del usuario admin.');
        return;
      }

      this.toast.success('Un correo fue enviado para confirmar la cuenta. Confirmá tu cuenta y luego iniciá sesión para completar el perfil.');

    } finally {
      this.loader.hide();
    }
  }
  */

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
      const r = await this.auth.signInEmailChecked(this.email, this.password);
      if (!r.ok) {
        if (r.code === 'CONFIRMACION') {
          console.warn('[login] correo no confirmado');
          this.toast.error('Tu correo electrónico no ha sido confirmado. Revisa tu bandeja de entrada.');
        } else if (r.code === 'PENDIENTE') {
          console.warn('[login] cuenta pendiente de aprobación');
          this.toast.error('Tu cuenta de especialista está pendiente de aprobación por un administrador.');
        } else if (r.code === 'CREDENCIALES') {
          console.warn('[login] credenciales incorrectas');
          this.toast.error('Email o contraseña incorrectos.');
        } else {
          console.error('[login] error desconocido al iniciar sesión');
          this.toast.error('No se pudo iniciar sesión. Inténtalo de nuevo más tarde.');
        }
        return;
      }
      
      await this.supa.loadProfile().then(() => {
        this.profile.set(this.supa.profile);
      });


      if (!this.profile()) {
        this.router.navigateByUrl('/mi-perfil', { replaceUrl: true });
      } else if (this.profile()?.categoria === 'admin') { 
        this.router.navigateByUrl('/usuarios', { replaceUrl: true }); 
      } else { 
        this.router.navigateByUrl('/mi-perfil', { replaceUrl: true });
      }
    } finally {
      this.loader.hide();
    }
  }

}
