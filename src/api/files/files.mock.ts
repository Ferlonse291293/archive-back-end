import type { IDocumentFile } from './files.types.js';

export const documents:
    Record<string, IDocumentFile[]> = {

    doc1: [
        {
            fileId: 'file1.pdf',
            fileName: 'file1.pdf',
            type: 'pdf'
        }
    ]

};
