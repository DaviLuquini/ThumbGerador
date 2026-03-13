import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';

export const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginPage,
        title: 'Entrar | ThumbGerador',
        data: {
            description: 'Acesse sua conta no ThumbGerador para criar thumbnails com IA.',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'register',
        component: RegisterPage,
        title: 'Criar conta | ThumbGerador',
        data: {
            description: 'Crie sua conta no ThumbGerador e comece a gerar thumbnails com IA.',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
