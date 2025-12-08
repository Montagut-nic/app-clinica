import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { ToastService } from '../../servicios/toast';
import { LoaderService } from '../loader/loader-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-admin',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.scss',
})
export class RegistroAdmin implements OnInit {

  private loader = inject(LoaderService);
  private router = inject(Router);
  private sb = inject(SupabaseClientService).client;
  private toast = inject(ToastService);

  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  email = '';
  password = '';

  loading: any;

  fotoAdm?: File;

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || undefined;
    this.fotoAdm = file;
  }

  async ngOnInit() {
    document.title = 'La Clínica Online - Registro de Administrador';
  }

  private validar(): string | null {
    if (!this.nombre.trim()) return 'El nombre es obligatorio.';
    if (!this.apellido.trim()) return 'El apellido es obligatorio.';
    if (!this.edad || this.edad <= 0) return 'La edad no es válida.';
    if (!/^\d{6,9}$/.test(this.dni)) return 'El DNI no es válido.';
    if (!/^\S+@\S+\.\S+$/.test(this.email)) return 'El correo electrónico no es válido.';
    if ((this.password ?? '').length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (!this.fotoAdm) return 'La foto del administrador es obligatoria.';

    return null;
  }

  async submit() {
    // ---- Validación de campos ----
    const msg = this.validar();
    if (msg) {
      this.toast.error(msg);
      return;
    }

    this.loader.show();
    try {
      const bucket = this.sb.storage.from('avatars');
      const folder = `${this.dni.trim()}-${Date.now()}`;

      const { data: dniTaken, error: dniChkErr } = await this.sb.rpc(
        'dni_exists',
        {
          _doc: this.dni.trim(),
        }
      );
      if (dniChkErr) {
        console.warn('[register] dni_exists error:', dniChkErr);
        this.toast.error('No se pudo validar el DNI. Intentalo nuevamente.');
        return;
      }
      if (dniTaken) {
        console.warn('[register] dni_exists:', dniTaken);
        this.toast.error('Ya existe un usuario con ese DNI.');
        return;
      }

      const { data: email_taken, error: emailChkErr } = await this.sb.rpc(
        'email_exists',
        {
          _correo: this.email.trim().toLowerCase(),
        }
      );
      if (emailChkErr) {
        console.warn('[register] email_exists error:', emailChkErr);
        this.toast.error('No se pudo validar el correo electrónico. Intentalo nuevamente.');
        return;
      }
      if (email_taken) {
        this.toast.error('Ya existe un usuario con ese correo electrónico.');
        return;
      }

      const upload = async (file: File | undefined, name: string) => {
        if (!file) return null;
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${folder}/${name}-${Date.now()}.${ext}`;
        const { error: upErr } = await bucket.upload(path, file, {
          upsert: true,
        });
        if (upErr) throw upErr;
        return path;
      };

      let avatarPath1: string | null = null;
      try {
        avatarPath1 = await upload(this.fotoAdm, 'administrador');
      } catch (e: any) {
        console.warn('[register] upload pending error:', e?.message || e);
      }

      const { data: resp, error: signErr } = await this.sb.auth.signUp({
        email: this.email.trim().toLowerCase(),
        password: this.password,
        options: {
          data: {
            rol: 'admin',
            nombre: this.nombre.trim(),
            apellido: this.apellido.trim(),
            edad: this.edad,
            dni: this.dni.trim(),
            obra_social: null,
            avatar_path1: avatarPath1,
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

      const { error: Err } = await this.sb.from('profiles').insert({
        _uuid: newUser.id,
        _email: this.email.trim().toLowerCase(),
        _rol: 'admin',
        _nombre: this.nombre.trim(),
        _apellido: this.apellido.trim(),
        _edad: this.edad,
        _dni: this.dni.trim(),
        _avatar_path1: avatarPath1,
        _is_approved: true
      });

      if (Err) {
        console.warn('[register] insert profile error:', Err);
        this.toast.error('No se pudo preparar el perfil de usuario.');
        return;
      }

      this.toast.success('Especialista registrado exitosamente. Un correo fue enviado para confirmar la cuenta.');
      this.router.navigateByUrl('/usuarios');

    } finally {
      this.loader.hide();
    }


  }

}
