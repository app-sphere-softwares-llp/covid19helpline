import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserState, UserStore } from '../../store/user/user.store';


@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {
  user$ = this.select(s => s.user);

  constructor(protected store: UserStore) {
    super(store);
  }
}
