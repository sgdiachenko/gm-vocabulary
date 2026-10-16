import { Component, inject, Signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';

import { DataLoadingWrapperComponent } from '../../shared/ui/data-loading-wrapper/data-loading-wrapper.component';
import { SubmitDialogComponent } from '../../shared/ui/submit-dialog/submit-dialog.component';
import { SubmitDialogData } from '../../shared/ui/submit-dialog/submit-dialog-data';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'gm-page-wrapper',
  imports: [
    MatToolbar,
    RouterOutlet,
    MatButton,
    DataLoadingWrapperComponent,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './page-wrapper.component.html',
  styleUrl: './page-wrapper.component.scss',
})
export class PageWrapperComponent {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  authLoadingState: Signal<boolean> = this.authService.authLoadingState;

  username = this.authService.username;

  logout(): void {
    const logoutDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData, boolean>(
      SubmitDialogComponent,
      {
        data: {
          title: 'Logout',
          text: 'Are you sure you want to logout?',
        },
      },
    );

    logoutDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  isWordsPageActive(): boolean {
    return this.router.isActive('/words', {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
