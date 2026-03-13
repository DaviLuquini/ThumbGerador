import { Routes } from "@angular/router";
import { Dashboard } from "./pages/dashboard/dashboard";
import { ThumbnailComposer } from "./pages/thumbnail-composer/thumbnail-composer";
import { authGuard } from "../../core/guards/auth.guard";
import { History } from "./pages/history/history";
import { HistoryDetail } from "./pages/history/history-detail/history-detail";

export const applicationRoutes: Routes = [
    {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard | ThumbGerador',
        data: {
            description: 'Painel principal para criar novas thumbnails no ThumbGerador.',
            robots: 'noindex, nofollow'
        },
        // canActivate: [authGuard]
    },
    {
        path: 'thumbnail-composer',
        component: ThumbnailComposer,
        title: 'Editor de Thumbnail | ThumbGerador',
        data: {
            description: 'Edite elementos da thumbnail no compositor visual do ThumbGerador.',
            robots: 'noindex, nofollow'
        },
        canActivate: [authGuard]
    },
    {
        path: 'history',
        component: History,
        title: 'Histórico | ThumbGerador',
        data: {
            description: 'Consulte e gerencie suas thumbnails geradas no ThumbGerador.',
            robots: 'noindex, nofollow'
        },
        //canActivate: [authGuard]
    },
    {
        path: 'history/:id',
        component: HistoryDetail,
        title: 'Detalhes da Thumbnail | ThumbGerador',
        data: {
            description: 'Visualize detalhes de uma thumbnail gerada no ThumbGerador.',
            robots: 'noindex, nofollow'
        },
        //canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
