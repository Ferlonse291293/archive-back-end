export interface ITreeElements{
    "id": "string",
    "parentId": "string | 'root'",
    "type": any
    "name": "string",
    "children": ITreeElements[] | null
}
