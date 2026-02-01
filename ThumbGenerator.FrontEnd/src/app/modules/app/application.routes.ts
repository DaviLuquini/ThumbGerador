import { Routes } from "@angular/router";
import { Dashboard } from "./pages/dashboard/dashboard";
import { ThumbnailComposer } from "./pages/thumbnail-composer/thumbnail-composer";

export const applicationRoutes: Routes = [
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'thumbnail-composer',
        component: ThumbnailComposer
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
