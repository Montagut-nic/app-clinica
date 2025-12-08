import { inject, Pipe, PipeTransform } from '@angular/core';
import { AnyUsuario } from '../clases/usuario';
import { SupabaseClientService } from '../servicios/supabase-client';

@Pipe({
  name: 'avatar'
})
export class AvatarPipe implements PipeTransform {
  private sb = inject(SupabaseClientService);

  transform(value: AnyUsuario, bucket: string = 'avatars', fallback: string = 'placeholder.webp'): string {
    if(value.imagenPrincipalUrl == null || value.imagenPrincipalUrl.trim() === '') {
      return fallback;
    }
    const { data } = this.sb.client.storage.from(bucket).getPublicUrl(value.imagenPrincipalUrl);
    if (!data?.publicUrl) {
      return fallback;
    }
    return data.publicUrl;
  }

}
