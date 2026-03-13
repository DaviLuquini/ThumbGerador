import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoService {
    private readonly router = inject(Router);
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);

    private readonly baseUrl = 'https://thumbgerador.com';
    private readonly defaultTitle = 'ThumbGerador | Criador de Thumbnails com IA';
    private readonly defaultDescription = 'Crie thumbnails profissionais para YouTube e TikTok com IA. Gere variações para teste A/B em segundos e aumente seus cliques.';
    private readonly defaultImage = `${this.baseUrl}/assets/images/thumb_podcast_1772322416313.png`;
    private readonly defaultRobots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.applyCurrentRouteSeo();

        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe(() => this.applyCurrentRouteSeo());
    }

    private applyCurrentRouteSeo(): void {
        const rootSnapshot = this.router.routerState.snapshot.root;
        const routeData = this.getMergedRouteData(rootSnapshot);
        const currentPath = this.getNormalizedUrlPath(this.router.url);

        const pageTitle = this.getDeepestTitle(rootSnapshot) ?? this.defaultTitle;
        const pageDescription = typeof routeData['description'] === 'string' && routeData['description'].trim().length > 0
            ? routeData['description']
            : this.defaultDescription;
        const canonicalUrl = typeof routeData['canonical'] === 'string' && routeData['canonical'].trim().length > 0
            ? routeData['canonical']
            : `${this.baseUrl}${currentPath}`;
        const robotsDirective = this.getRobotsDirective(routeData, currentPath);

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description', content: pageDescription });
        this.meta.updateTag({ name: 'robots', content: robotsDirective });

        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: pageDescription });
        this.meta.updateTag({ property: 'og:type', content: 'website' });
        this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
        this.meta.updateTag({ property: 'og:image', content: this.defaultImage });
        this.meta.updateTag({ property: 'og:site_name', content: 'ThumbGerador' });
        this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });

        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
        this.meta.updateTag({ name: 'twitter:description', content: pageDescription });
        this.meta.updateTag({ name: 'twitter:image', content: this.defaultImage });

        this.setCanonical(canonicalUrl);
    }

    private getRobotsDirective(routeData: Data, currentPath: string): string {
        const explicitRobots = typeof routeData['robots'] === 'string' ? routeData['robots'] : '';

        if (explicitRobots) {
            return explicitRobots;
        }

        if (currentPath.startsWith('/auth') || currentPath.startsWith('/app')) {
            return 'noindex, nofollow';
        }

        return this.defaultRobots;
    }

    private getNormalizedUrlPath(url: string): string {
        const cleanUrl = url.split('#')[0].split('?')[0] || '/';
        return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    }

    private getMergedRouteData(snapshot: ActivatedRouteSnapshot): Data {
        let current: ActivatedRouteSnapshot | null = snapshot;
        let mergedData: Data = {};

        while (current) {
            mergedData = { ...mergedData, ...current.data };
            current = current.firstChild;
        }

        return mergedData;
    }

    private getDeepestTitle(snapshot: ActivatedRouteSnapshot): string | null {
        let current: ActivatedRouteSnapshot | null = snapshot;
        let foundTitle: string | null = null;

        while (current) {
            if (typeof current.title === 'string' && current.title.trim().length > 0) {
                foundTitle = current.title;
            }
            current = current.firstChild;
        }

        return foundTitle;
    }

    private setCanonical(canonicalUrl: string): void {
        let canonicalLink = this.document.querySelector<HTMLLinkElement>("link[rel='canonical']");

        if (!canonicalLink) {
            canonicalLink = this.document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            this.document.head.appendChild(canonicalLink);
        }

        canonicalLink.setAttribute('href', canonicalUrl);
    }
}
