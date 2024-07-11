import { HangulOrder } from '@app/types/hangul-order';

export interface BuddistScripture {
    id: number;
    title: string;
    subtile: string;
    author: string;
    translator: string;
    summary: string;
    sutra: string;
    originalText: string;
    annotation: string;
    hangulOrder: HangulOrder;
}
