import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'gm-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.authService.autoAuthUser();
  }
}
