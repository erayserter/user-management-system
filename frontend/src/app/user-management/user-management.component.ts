import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

interface User {
  id: number;
  username: string;
  password?: string;  // Password is optional for update, but required for new user
  role: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isAdmin: boolean = false;
  newUser: Partial<User> = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user'
  };

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.loggedIn && this.getRole() === 'admin';
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  getRole(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }

  addUser(): void {
    if (this.isAdmin) {
      this.userService.addUser(this.newUser).subscribe(() => {
        this.loadUsers();
        this.newUser = {
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'user'
        };
      });
    }
  }

  updateUser(user: User): void {
    if (this.isAdmin) {
      this.userService.updateUser(user.id, user).subscribe();
    }
  }

  deleteUser(id: number): void {
    if (this.isAdmin) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
