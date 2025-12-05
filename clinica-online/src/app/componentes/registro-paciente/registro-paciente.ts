import { Component, OnInit, inject, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Recaptcha } from '../recaptcha/recaptcha';
import { recaptchaSiteKey } from '../../../environments/environment';
import { CaptchaDirective } from '../../directivas/captcha';
import { ToastService } from '../../servicios/toast';
import { AuthService } from '../../servicios/auth';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { LoaderService } from '../loader/loader-service';


@Component({
  selector: 'app-registro-paciente',
  imports: [FormsModule, CommonModule, Recaptcha, CaptchaDirective],
  templateUrl: './registro-paciente.html',
  styleUrl: './registro-paciente.scss',
})
export class RegistroPaciente implements OnInit {
  captchaToken: string | null = null;
  captchaEnabled = signal(true);

  siteKey = recaptchaSiteKey;

  private loader = inject(LoaderService);
  private router = inject(Router);
  private sb = inject(SupabaseClientService).client;
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  obra_social = '';
  email = '';
  password = '';

  loading: any;

  foto1?: File;
  foto2?: File;

  async ngOnInit() {
    const { data, error } = await this.sb.rpc('get-captcha-enabled');
    this.captchaEnabled.set(data === true && !error);
    document.title = 'La Clínica Online - Registro de Paciente';
  }

  onCaptchaResolved(token: string | null) {
    this.captchaToken = token;
  }

  onFileChange(which: 'p1' | 'p2', ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || undefined;
    if (which === 'p1') this.foto1 = file;
    if (which === 'p2') this.foto2 = file;
  }

  private validar(): string | null {
    if (!this.nombre.trim()) return 'El nombre es obligatorio.';
    if (!this.apellido.trim()) return 'El apellido es obligatorio.';
    if (!this.edad || this.edad <= 0) return 'La edad no es válida.';
    if (!/^\d{6,9}$/.test(this.dni)) return 'El DNI no es válido.';
    if (!/^\S+@\S+\.\S+$/.test(this.email)) return 'El correo electrónico no es válido.';
    if ((this.password ?? '').length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (!this.obra_social.trim()) return 'La obra social es obligatoria.';
    if (!this.foto1) return 'La imagen de perfil es obligatoria.';
    if (!this.foto2) return 'La imagen de perfil secundaria es obligatoria.';

    return null;
  }

  async submit() {

    const msg = this.validar();
    if (msg) {
      this.toast.error(msg);
      return;
    }

    // ---- Validación de captcha  ----
    if (this.captchaEnabled()) {
      if (!this.captchaToken) {
        this.toast.error('Completá el captcha.');
        return;
      }

      const { data: verify, error: vErr } = await this.sb.functions.invoke(
        'verify-recaptcha',
        {
          body: { token: this.captchaToken },
        }
      );

      if (vErr || !verify?.success) {
        this.toast.error('Captcha inválido. Intentá nuevamente.');
        return;
      }
    }

    this.loader.show();
    try {
      const bucket = this.sb.storage.from('avatars');
      const folder = `avatars/${this.dni.trim()}/${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

      const { data: dniTaken, error: dniChkErr } = await this.sb.rpc(
        'dni_exists',
        {
          _dni: this.dni.trim(),
        }
      );
      if (dniChkErr) {
        console.warn('[register] dni_exists error:', dniChkErr);
        this.toast.error('No se pudo validar el DNI. Intentalo nuevamente.');
        return;
      }
      if (dniTaken) {
        this.toast.error('Ya existe un usuario con ese DNI.');
        return;
      }

      const { data: email_taken, error: emailChkErr } = await this.sb.rpc(
        'email_exists',
        {
          _email: this.email.trim().toLowerCase(),
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
      let avatarPath2: string | null = null;

      try {
        avatarPath1 = await upload(this.foto1, 'paciente-1');
        avatarPath2 = await upload(this.foto2, 'paciente-2');
      } catch (e: any) {
        console.warn('[register] upload pending error:', e?.message || e);
      }

      const { error: ppErr } = await this.sb.rpc('insert_patient_profile', {
        _email: this.email.trim().toLowerCase(),
        _rol: 'paciente',
        _nombre: this.nombre.trim(),
        _apellido: this.apellido.trim(),
        _edad: this.edad!,
        _dni: this.dni.trim(),
        _obra_social: this.obra_social.trim(),
        _avatar_path1: avatarPath1,
        _avatar_path2: avatarPath2,
      });

      if (ppErr) {
        console.warn('[register] rpc insert_patient_profile error:', ppErr);
        this.toast.error('No se pudo preparar el registro.');
        return;
      }

      const { error: signErr } = await this.sb.auth.signUp({
        email: this.email.trim().toLowerCase(),
        password: this.password,
        options: {
          data: {
            rol: 'paciente',
            nombre: this.nombre.trim(),
            apellido: this.apellido.trim(),
            edad: this.edad,
            dni: this.dni.trim(),
            obra_social: this.obra_social.trim(),
            avatar_path1: avatarPath1,
            avatar_path2: avatarPath2,
            specialties_ids: null,
            specialty_other: null,
          },
        },
      });

      if (signErr) {
        this.toast.error(signErr.message);
        return;
      }

      this.toast.success('Un correo fue enviado para confirmar la cuenta. Confirmá tu cuenta y luego iniciá sesión para completar el perfil.');
      this.router.navigateByUrl('/login');

    } finally {
      this.loader.hide();
    }
  }

}
