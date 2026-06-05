export type Category = 'Teología' | 'Filosofía' | 'Todas';

export interface Note {
    id: string;
    title: string;
    content: string;
    category: Category;
    createdAt: number;
    updatedAt: number;
    isPrivate?: boolean;
    encryptedContent?: string | null;
}
