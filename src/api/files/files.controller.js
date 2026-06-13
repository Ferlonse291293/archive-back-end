import { getDocumentMetadata } from './files.service.js';
export const getMetadata = async (req, res) => {
    const result = await getDocumentMetadata(req.params.idDocument);
    if (!result) {
        return res.status(404).json({
            message: 'Document not found'
        });
    }
    res.json(result);
};
export const downloadFile = async (req, res) => {
    res.json({
        message: 'TODO'
    });
};
//# sourceMappingURL=files.controller.js.map
