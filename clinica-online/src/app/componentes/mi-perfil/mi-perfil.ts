import { Component, inject, signal} from '@angular/core';
import { HistoriaClinicaSvc } from '../../servicios/historia-clinica-svc';
import { HistoriaClinica } from '../../clases/historia-clinica';  
import { SupabaseClientService } from '../../servicios/supabase-client';
import { AuthService } from '../../servicios/auth';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  private historiaClinicaSvc = inject(HistoriaClinicaSvc);
  private sb = inject(SupabaseClientService);
  private auth = inject(AuthService);
  perfil = signal<any>(null);
  loading = signal(true);
  historialPacienteEspecialista = signal<HistoriaClinica[]>([]);
  descargarHistoriaPdf(){

  }

}
