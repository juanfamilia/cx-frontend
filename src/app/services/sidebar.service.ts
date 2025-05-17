import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  isCollapsed = signal<boolean>(true);

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
