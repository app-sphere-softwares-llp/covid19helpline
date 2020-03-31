import { Component } from '@angular/core';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { User } from '@covid19-helpline/models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent{

    searchVisible : boolean = false;
    quickViewVisible : boolean = false;
    isFolded : boolean;
    isExpand : boolean;
    currentUser: User = {
      firstName : "Pradeep",
      lastName : "Sharma",
      profilePic:'',
      mobileNumber:'9716464156'
    };

    constructor(private router: Router, private themeService: ThemeConstantService) {}

    ngOnInit(): void {
        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
    }

    toggleFold() {
        this.isFolded = !this.isFolded;
        this.themeService.toggleFold(this.isFolded);
    }

    toggleExpand() {
        this.isFolded = false;
        this.isExpand = !this.isExpand;
        this.themeService.toggleExpand(this.isExpand);
        this.themeService.toggleFold(this.isFolded);
    }

  logOut() {

      this.router.navigate(['login']);

  }
}
