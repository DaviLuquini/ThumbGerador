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
        // canActivate: [authGuard]
    },
    {
        path: 'thumbnail-composer',
        component: ThumbnailComposer,
        canActivate: [authGuard]
    },
    {
        path: 'history',
        component: History,
        //canActivate: [authGuard]
    },
    {
        path: 'history/:id',
        component: HistoryDetail,
        //canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
