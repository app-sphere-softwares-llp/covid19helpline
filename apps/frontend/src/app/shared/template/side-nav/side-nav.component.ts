import { Component, OnInit } from '@angular/core';
import { ROUTES } from './side-nav-routes.config';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { GeneralService } from '../../services/general.service';
import { MemberTypes, User } from '@covid19-helpline/models';
import { SideNavInterface } from '../../interfaces/side-nav.type';

@Component({
    selector: 'app-sidenav',
    templateUrl: './side-nav.component.html'
})

export class SideNavComponent implements OnInit{

    public menuItems: SideNavInterface[]
    public isFolded : boolean;
    public isSideNavDark : boolean;
    public currentUser: User;

    constructor( private themeService: ThemeConstantService,private _generalService: GeneralService) {}

    ngOnInit(): void {

        this.currentUser = this._generalService.user;
        this.menuItems = ROUTES.filter(menuItem => menuItem);

        // add route link if user is super admin
        if(this.currentUser.memberType === MemberTypes.superAdmin) {
          this.menuItems.push({
            path: 'create-admin',
            title: 'Admin',
            iconType: 'nzIcon',
            iconTheme: 'outline',
            icon: 'user-add',
            submenu: []
          })
        }

        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
    }

}
