import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../servicios/toast';
import { LoaderService } from '../loader/loader-service';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { AuthService } from '../../servicios/auth';
import { SpecialtyService } from '../../servicios/specialty';
import { Recaptcha } from '../recaptcha/recaptcha';
import { recaptchaSiteKey } from '../../../environments/environment';
import { CaptchaDirective } from '../../directivas/captcha';

@Component({
  selector: 'app-registro-especialista',
  imports: [CommonModule,
    FormsModule, Recaptcha, CaptchaDirective],
  templateUrl: './registro-especialista.html',
  styleUrl: './registro-especialista.scss',
})
export class RegistroEspecialista implements OnInit {
  specialties = signal<{ id: string; nombre: string; isCustom?: boolean }[]>(
    []
  );
  selectedSpecialtyIds: string[] = [];
  specialtyDropdownOpen = false;
  specialtyOtherInput = '';

  siteKey = recaptchaSiteKey;

  captchaToken: string | null = null;
  captchaEnabled = signal(true);

  private loader = inject(LoaderService);
  private router = inject(Router);
  private sb = inject(SupabaseClientService).client;
  private auth = inject(AuthService);
  private specialtySvc = inject(SpecialtyService);
  private toast = inject(ToastService);

  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  email = '';
  password = '';

  loading: any;

  fotoEsp?: File;

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || undefined;
    this.fotoEsp = file;
  }

  async ngOnInit() {
    const { data, error } = await this.sb.rpc('get_captcha_enabled');
    this.captchaEnabled.set(data === true && !error);
    this.cargarEspecialidades();
    document.title = 'La Clínica Online - Registro de Especialista';
  }

  async cargarEspecialidades() {
    try {
      const { data, error } = await this.specialtySvc.listActive();
      if (!error) {
        this.specialties.set(
          (data ?? []).map((d: any) => ({
            id: d.id as string,
            nombre: d.nombre as string,
          }))
        );
      }
    } catch { }
  }

  onCaptchaResolved(token: string | null) {
    this.captchaToken = token;
  }

  toggleSpecialtyDropdown() {
    this.specialtyDropdownOpen = !this.specialtyDropdownOpen;
  }

  isSpecialtySelected(id: string): boolean {
    return this.selectedSpecialtyIds.includes(id);
  }

  toggleSpecialty(id: string, checked: boolean) {
    if (checked) {
      if (!this.selectedSpecialtyIds.includes(id)) {
        this.selectedSpecialtyIds.push(id);
      }
    } else {
      this.selectedSpecialtyIds = this.selectedSpecialtyIds.filter(
        (v) => v !== id
      );
    }
  }

  selectedSpecialtiesLabels(): string[] {
    const map = new Map(this.specialties().map((s) => [s.id, s.nombre]));
    return this.selectedSpecialtyIds
      .map((id) => map.get(id))
      .filter((v): v is string => !!v);
  }

  addSpecialty() {
    const name = this.specialtyOtherInput.trim();
    if (!name || name === '') {
      this.toast.error('El nombre de la especialidad no puede estar vacío.');
      return;
    }

    const current = this.specialties();
    const existing = current.find(
      (s) => s.nombre.toLowerCase() === name.toLowerCase()
    );

    let id: string;
    if (existing) {
      id = existing.id;
    } else {
      id = `${Date.now()}`;
      this.specialties.set([...current, { id, nombre: name, isCustom: true }]);
    }

    if (!this.selectedSpecialtyIds.includes(id)) {
      this.selectedSpecialtyIds.push(id);
    }

    this.specialtyOtherInput = '';
    this.toast.success('Especialidad agregada exitosamente.');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const inside = target.closest('.specialty-multiselect');
    if (!inside) {
      this.specialtyDropdownOpen = false;
    }
  }

  private validar(): string | null {
    if (!this.nombre.trim()) return 'El nombre es obligatorio.';
    if (!this.apellido.trim()) return 'El apellido es obligatorio.';
    if (!this.edad || this.edad <= 0) return 'La edad no es válida.';
    if (!/^\d{6,}$/.test(this.dni)) return 'El DNI no es válido.';
    if (!/^\S+@\S+\.\S+$/.test(this.email)) return 'El correo electrónico no es válido.';
    if ((this.password ?? '').length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (this.selectedSpecialtyIds.length === 0) return 'Elegí al menos una especialidad';
    if (!this.fotoEsp) return 'La foto del especialista es obligatoria.';

    return null;
  }

  async submit() {
    // ---- Validación de campos ----
    const msg = this.validar();
    if (msg) {
      this.toast.error(msg);
      return;
    }

    // ---- Validación de captcha ----
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

    // ---- Especialidades seleccionadas / otras ----
    let selectedExistingIds: string[] = [];
    let specialtyOther: string | null = null;


    selectedExistingIds = this.specialties().filter(s => !s.isCustom && this.selectedSpecialtyIds.includes(s.id)).map(s => s.id);

    const customNames = this.specialties()
      .filter((s) => s.isCustom && this.selectedSpecialtyIds.includes(s.id))
      .map((s) => s.nombre);

    specialtyOther = customNames.length > 0 ? customNames.join(', ') : null;


    // ---- Resto de la lógica igual que tenías ----
    this.loader.show();
    try {
      await (async () => {
        const bucket = this.sb.storage.from('avatars');
        const folder = `avatars/${this.dni.trim()}/${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
          }`;

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
        try {
          avatarPath1 = await upload(this.fotoEsp, 'especialista');
        } catch (e: any) {
          console.warn('[register] upload pending error:', e?.message || e);
        }

        
        let newUser;

        const { data: resp, error: signErr } = await this.sb.auth.signUp({
          email: this.email.trim().toLowerCase(),
          password: this.password,
          options: {
            data: {
              rol: 'especialista',
              nombre: this.nombre.trim(),
              apellido: this.apellido.trim(),
              edad: this.edad,
              dni: this.dni.trim(),
              obra_social: null,
              avatar_path1: avatarPath1,
              avatar_path2: null,
              specialties_ids: selectedExistingIds,
              specialty_other: specialtyOther,
            },
          },
        });

        if (signErr) {
          this.toast.error(signErr.message);
          return;
        } else {
          newUser = resp.session!.user;
        }

        const specialtiesIds = selectedExistingIds.join(', ');
        const { error: ppErr } = await this.sb.rpc('insert_pending_profile', {
          _uuid: newUser.id,
          _email: this.email.trim().toLowerCase(),
          _nombre: this.nombre.trim(),
          _apellido: this.apellido.trim(),
          _edad: this.edad!,
          _dni: this.dni.trim(),
          _specialty_id: specialtiesIds,
          _specialty_other: specialtyOther,
          _avatar_path1: avatarPath1,
        });

        if (ppErr) {
          console.warn('[register] rpc insert_pending_profile error:', ppErr);
          this.toast.error('No se pudo preparar el registro.');
          return;
        }

        this.specialties().forEach(async (s) => {
          if (this.selectedSpecialtyIds.includes(s.id)) {
            if (s.isCustom) {
              const { data } = await this.specialtySvc.addCustom(s.nombre);
              if (data) {
                await this.sb.from('profile_specialty').insert({
                  profile_id: newUser.id,
                  specialty_id: data.id
                }
                )
              }
            } else {
              await this.sb.from('profile_specialty').insert({
                profile_id: newUser.id,
                specialty_id: s.id
              });
            }
          }
        });



        this.toast.success('Un correo fue enviado para confirmar la cuenta. Confirmá tu cuenta y luego iniciá sesión para completar el perfil.');
        this.router.navigateByUrl('/login');

      });

    } finally {
      this.loader.hide();
    }
  }
}
