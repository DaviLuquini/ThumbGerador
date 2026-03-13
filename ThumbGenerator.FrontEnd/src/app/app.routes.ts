import { Routes } from '@angular/router';
import { Landing } from './modules/landing/pages/landing/landing';
import { Pricing } from './modules/landing/pages/pricing/pricing';

export const routes: Routes = [
    {
        path: '',
        component: Landing,
        title: 'ThumbGerador | Criador de Thumbnails com IA',
        data: {
            description: 'Crie thumbnails profissionais para YouTube e TikTok com IA. Gere variações para teste A/B em segundos e aumente seus cliques.',
            canonical: 'https://thumbgerador.com/'
        }
    },
    {
        path: 'auth',
        title: 'Acesse sua conta | ThumbGerador',
        data: {
            robots: 'noindex, nofollow'
        },
        loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'app',
        title: 'Painel | ThumbGerador',
        data: {
            robots: 'noindex, nofollow'
        },
        loadChildren: () => import('./modules/app/application.routes').then(m => m.applicationRoutes)
    },
    {
        path: 'pricing',
        component: Pricing,
        title: 'Preços | ThumbGerador',
        data: {
            description: 'Escolha o plano ideal para criar thumbnails com IA e escalar seu canal com mais velocidade e consistência.',
            canonical: 'https://thumbgerador.com/pricing'
        }
    },
    {
        path: '**',
        redirectTo: ''
    }
];
