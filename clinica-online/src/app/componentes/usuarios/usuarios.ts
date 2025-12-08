import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseClientService } from '../../servicios/supabase-client';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { AnyUsuario } from '../../clases/usuario';
import { Paciente } from '../../clases/paciente';
import { Especialista } from '../../clases/especialista';
import { FullNamePipe } from '../../pipes/full-name-pipe';
import { HistoriaClinica } from '../../clases/historia-clinica';
import { ToastService } from '../../servicios/toast';
import { LoaderService } from '../loader/loader-service';
import { Admin } from '../../clases/admin';
import { AvatarPipe } from '../../pipes/avatar-pipe';
import { HistoriaClinicaSvc } from '../../servicios/historia-clinica-svc';

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink, CommonModule, FullNamePipe, AvatarPipe],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private router = inject(Router);
  private sb = inject(SupabaseClientService).client;
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  readonly placeholder = 'placeholder.webp';
  loading = signal(true);
  q = signal('');
  hoveredId = signal<string | null>(null);
  private historiaSvc = inject(HistoriaClinicaSvc);

  rows = signal<AnyUsuario[]>([]);
  showHistory = signal(false);
  historyLoading = signal(false);
  historyRows = signal<HistoriaClinica[]>([]);
  historyPatientName = signal('');

  async ngOnInit() {
    document.title = 'La Clínica Online - Administración de Usuarios';
    this.loader.show();
    try {
      await this.load();
    } finally {
      this.loader.hide();
    }
  }

  imgFallback(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.placeholder;
  }

  async toggleApprove(r: AnyUsuario) {
    try {
      this.loader.show();
      if (this.isEspecialista(r)) {
        const next = !r.activado;
        const { error } = await this.sb
          .from('profiles')
          .update({ _is_approved: next })
          .eq('_uuid', r.authUid);
        if (error) {
          this.toast.error('No se pudo actualizar aprobación');
          return;
        }
        r.activado = next;
        await this.load();
      }
    } finally {
      this.loader.hide();
    }
  }

  exportExcel() {

    this.loader.show();
    try {
      const rows = this.rows();

      if (!rows.length) {
        this.toast.error('No hay usuarios para exportar.');
        return;
      }

      const data = rows.map((r) => ({
        Nombre: r.nombre ?? '',
        Apellido: r.apellido ?? '',
        Edad: r.edad ?? '',
        Email: r.email ?? '',
        DNI: r.dni ?? '',
        Aprobado: r.activado ? 'Sí' : 'No',
        Rol: r.categoria ?? '',
        'Obra social': (this.isPaciente(r) ? r.obraSocial : ''),
        Especialidades: (this.isEspecialista(r) ? r.especialidades?.map(e => e.nombre).join(', ') : ''),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

      const today = Date.now();
      const fileName = `usuarios_clinica_${today}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } finally {
      this.loader.hide();
    }
  }

  async exportUserAppointments(u: AnyUsuario) {
    this.loader.show();
    try {
      if (this.isPaciente(u)) {
        const { data, error } = await this.sb
          .from('turnos')
          .select(
            'fecha, hora, estado, especialidad_nombre, especialista_nombre, paciente_nombre'
          )
          .eq('paciente_id', u.authUid)
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true });

        if (error) {
          console.error('exportUserAppointments error', error);
          this.toast.error('No se pudieron obtener los turnos de este usuario.');
          throw error;
        }
        const rows = data ?? [];
        if (!rows.length) {
          this.toast.info('Este usuario todavía no tiene turnos registrados.');
          return;
        }

        const mapped = rows.map((r: any) => ({
          Fecha: r.fecha,
          Hora: r.hora,
          Paciente: r.paciente_nombre,
          Profesional: r.especialista_nombre,
          Especialidad: r.especialidad_nombre,
          Estado: r.estado,
        }));

        const ws = XLSX.utils.json_to_sheet(mapped);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Turnos');

        const today = Date.now();
        const fileName = `turnos_${u.nombre.toLowerCase().trim()}_${u.apellido.toLowerCase().trim()}_${today}.xlsx`;

        XLSX.writeFile(wb, fileName);

      }
    } catch (error) {
      console.error('exportUserAppointments error', error);
      this.toast.error('No se pudieron exportar los turnos de este usuario.');
    } finally {
      this.loader.hide();
    }
  }

  async openHistory(u: AnyUsuario) {
    if (this.isPaciente(u)) {
      this.loader.show();
      this.historyPatientName.set(
        `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() ||
        u.email.trim() ||
        'Paciente'
      );

      this.showHistory.set(true);
      this.historyLoading.set(true);
      this.historyRows.set([]);

      try {
        const rows = await this.historiaSvc.getHistoriaPaciente(u.authUid);
        this.historyRows.set(rows);
      } catch (e) {
        console.error('[admin/users] history error', e);
      } finally {
        this.loader.hide();
        this.historyLoading.set(false);
      }
    }
  }

  closeHistory() {
    this.showHistory.set(false);
    this.historyRows.set([]);
  }

  isPaciente(r: AnyUsuario): r is Paciente {
    return r.categoria === 'paciente';
  }
  isEspecialista(r: AnyUsuario): r is Especialista {
    return r.categoria === 'especialista';
  }

  async refresh() {
    this.loader.show();
    try {
      await this.load();
    } finally {
      this.loader.hide();
    }
  }

  async load() {
    this.rows.set([]);
    this.loading.set(true);
    try {
      const { data: profRows, error } = await this.sb.from('profiles')
        .select('_uuid, _email, _rol, _nombre, _apellido, _edad, _dni, _obra_social, _avatar_path1, _is_approved, specialties (*)');
      if (error) {
        console.warn('Error loading users', error);
        this.toast.error('No se pudieron cargar los usuarios');
        throw error;
      }
      profRows.forEach((r: any) => {
        switch (r._rol) {
          case 'paciente':
            const p = new Paciente(r._nombre, r._apellido, Number(r._edad), r._dni, r._obra_social, r._email, r._uuid, r._avatar_path1, '');
            this.rows().push(p);
            break;
          case 'especialista':
            const e = new Especialista(r._nombre, r._apellido, Number(r._edad), r._dni, r._email, r._uuid, r._avatar_path1, r.specialties.filter((s: any) => Boolean(s.is_active) === true).map((p: any) => ({ id: p.id, nombre: p.nombre })), Boolean(r._is_approved));
            this.rows().push(e);
            break;
          case 'admin':
            const a = new Admin(r._nombre, r._apellido, Number(r._edad), r._dni, r._email, r._uuid, r._avatar_path1);
            this.rows().push(a);
            break;
          default:
            console.warn('Rol desconocido:', r._rol);
            break;
        }
      });
    } catch (error) {
      this.rows.set([]);
      this.toast.error('No se pudieron cargar los usuarios.');
      console.error('Error loading users', error);

    } finally {
      this.loading.set(false);
    }
  }
}
