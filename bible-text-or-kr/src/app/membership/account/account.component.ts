import { Component, inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgFor,
    JsonPipe,
    MatDividerModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {

  authService = inject(AuthService);
  account$ = this.authService.getDetail();
}
