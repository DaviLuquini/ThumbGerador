import { Routes } from '@angular/router';
import { Landing } from './modules/landing/pages/landing/landing';

export const routes: Routes = [
    {
        path: '',
        component: Landing
    },
    {
        path: 'app',
        loadChildren: () => import('./modules/app/application.routes').then(m => m.applicationRoutes)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
