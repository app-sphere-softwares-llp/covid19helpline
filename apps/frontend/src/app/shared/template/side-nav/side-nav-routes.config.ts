import { SideNavInterface } from '../../interfaces/side-nav.type';
export const ROUTES: SideNavInterface[] = [
    {
        path: '',
        title: 'Dashboard',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'dashboard',
        submenu: []
    },
    {
        path: 'new-pass',
        title: 'New Pass',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'plus',
        submenu: []
    }
]    
