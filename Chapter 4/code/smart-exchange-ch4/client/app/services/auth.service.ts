import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { User } from '../shared/models/user.model';

import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  loggedIn = false;
  isAdmin = false;

  currentUser: User = new User();

  constructor(private userService: UserService,
    private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      this.setCurrentUser(JSON.parse(localStorage.getItem('user')));
    }
  }

  getCurrentUser(): User{
    return this.currentUser;
  }

  login(emailAndPassword) {
    return this.userService.login(emailAndPassword).map(
      res => {
        const user = res.user;
        delete user.__v;
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(user));
        this.setCurrentUser(user);
        return this.loggedIn;
      },
      err => {
        // kick the user out if he performs any
        // unauthorized activity
        if (err.status === 403) this.logout();
        return this.loggedIn;
      }
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn = false;
    this.isAdmin = false;
    this.currentUser = new User();
    this.router.navigate(['/']);
  }

  setCurrentUser(user) {
    this.loggedIn = true;
    this.currentUser._id = user._id;
    this.currentUser.role = user.role;
    this.currentUser.email = user.email;
    this.currentUser.name = user.name;
    user.role === 'admin' ? this.isAdmin = true : this.isAdmin = false;
    delete user.role;
  }

}
