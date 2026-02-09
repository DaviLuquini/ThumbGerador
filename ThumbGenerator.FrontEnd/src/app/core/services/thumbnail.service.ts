import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface GenerateThumbnailResponse {
    id: string;
    imageUrl: string;
    remainingCredits: number;
}

export interface ThumbnailHistoryItem {
    id: string;
    templateId: string;
    title: string | null;
    imageUrl: string;
    createdAt: string;
}

export interface GenerateThumbnailRequest {
    templateId: string;
    videoImage?: File;
    personImage?: File;
    title?: string;
    prompt?: string;
    enhanceWithAi: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThumbnailService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    generate(request: GenerateThumbnailRequest): Observable<GenerateThumbnailResponse> {
        const formData = new FormData();
        formData.append('templateId', request.templateId);
        formData.append('enhanceWithAi', String(request.enhanceWithAi));

        if (request.videoImage) {
            formData.append('videoImage', request.videoImage);
        }
        if (request.personImage) {
            formData.append('personImage', request.personImage);
        }
        if (request.title) {
            formData.append('title', request.title);
        }
        if (request.prompt) {
            formData.append('prompt', request.prompt);
        }

        return this.http.post<GenerateThumbnailResponse>(
            `${environment.apiUrl}/thumbnail/generate`,
            formData
        ).pipe(
            tap(response => {
                // Update user credits after generation
                this.authService.updateCredits(response.remainingCredits);
            })
        );
    }

    getHistory(): Observable<ThumbnailHistoryItem[]> {
        return this.http.get<ThumbnailHistoryItem[]>(`${environment.apiUrl}/thumbnail/history`);
    }

    getById(id: string): Observable<ThumbnailHistoryItem> {
        return this.http.get<ThumbnailHistoryItem>(`${environment.apiUrl}/thumbnail/${id}`);
    }

    getFullImageUrl(imageUrl: string): string {
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        return `http://localhost:5126${imageUrl}`;
    }
}
